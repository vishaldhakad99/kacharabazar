import { Announcement, Notification, User } from '../models/index.js';
import { broadcastAnnouncement, notifyUser } from '../services/socket.js';

// @desc    Get announcements (public / ward-filtered)
// @route   GET /api/announcements
// @access  Public / Private
export const getAnnouncements = async (req, res, next) => {
  try {
    const { ward } = req.query;
    const query = { isActive: true };

    if (ward) {
      query.$or = [{ ward: null }, { ward }];
    }

    const announcements = await Announcement.find(query)
      .populate('ward', 'name code city')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new civic announcement
// @route   POST /api/announcements
// @access  Private/Admin
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, ward, priority } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required for announcement.',
      });
    }

    const announcement = await Announcement.create({
      title,
      body,
      ward: ward || null,
      createdBy: req.user.id,
      priority: priority || 'normal',
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('ward', 'name code city')
      .populate('createdBy', 'name');

    // Broadcast live to ward or whole city
    broadcastAnnouncement(populated);

    // Also insert Notifications for users in that ward (or all citizens)
    const userQuery = { role: 'citizen' };
    if (ward) userQuery.ward = ward;
    const citizens = await User.find(userQuery).select('_id');

    const notifs = citizens.map((c) => ({
      user: c._id,
      title: `📢 Announcement: ${title}`,
      body,
      type: 'announcement',
      link: '/dashboard',
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published and broadcasted successfully.',
      announcement: populated,
    });
  } catch (err) {
    next(err);
  }
};
