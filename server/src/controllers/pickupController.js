import { PickupRequest, User, Ward, Vehicle, Notification } from '../models/index.js';
import { creditPoints } from '../services/pointsService.js';
import { ECO_RULES } from '../config/ecoRules.js';
import { notifyUser, broadcastToWard, emitToAll } from '../services/socket.js';

// @desc    Create a new pickup request
// @route   POST /api/pickups
// @access  Private/Citizen
export const createPickup = async (req, res, next) => {
  try {
    const { wasteType, address, location, photo, slot, ward } = req.body;

    if (!wasteType || !address || !location || !location.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Waste type, address, and map location coordinates [lng, lat] are required.',
      });
    }

    // Determine user's ward or fallback to first ward
    let requestWard = ward || req.user.ward;
    if (!requestWard) {
      const defaultWard = await Ward.findOne();
      requestWard = defaultWard?._id;
    }

    const pickup = await PickupRequest.create({
      citizen: req.user.id,
      ward: requestWard,
      wasteType,
      address,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      photo: photo || '',
      slot: slot || '07:00 - 09:00',
      status: 'pending',
    });

    const populated = await PickupRequest.findById(pickup._id)
      .populate('citizen', 'name phone email avatar')
      .populate('ward', 'name code city');

    // Notify admins and workers in ward
    emitToAll('pickup:created', populated);

    res.status(201).json({
      success: true,
      message: 'Waste pickup request submitted successfully.',
      pickup: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pickup requests (role-scoped with filters & pagination)
// @route   GET /api/pickups
// @access  Private
export const getPickups = async (req, res, next) => {
  try {
    const { status, wasteType, ward, page = 1, limit = 15, search } = req.query;
    const query = {};

    // Role-based scoping:
    if (req.user.role === 'citizen') {
      query.citizen = req.user.id;
    } else if (req.user.role === 'worker') {
      // Worker can see pickups assigned to them or in their ward
      query.$or = [
        { assignedWorker: req.user.id },
        { ward: req.user.ward, status: { $in: ['pending', 'assigned', 'on_the_way'] } },
      ];
    } else if (req.user.role === 'admin') {
      if (ward) query.ward = ward;
    }

    if (status) query.status = status;
    if (wasteType) query.wasteType = wasteType;
    if (search) {
      query.address = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await PickupRequest.countDocuments(query);

    const pickups = await PickupRequest.find(query)
      .populate('citizen', 'name phone email avatar address')
      .populate('ward', 'name code city')
      .populate('assignedWorker', 'name phone')
      .populate('assignedVehicle', 'regNumber type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      pickups,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single pickup request by ID
// @route   GET /api/pickups/:id
// @access  Private
export const getPickupById = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id)
      .populate('citizen', 'name phone email avatar address ecoBalance lifetimePoints streakCount')
      .populate('ward', 'name code city')
      .populate('assignedWorker', 'name phone')
      .populate('assignedVehicle', 'regNumber type currentLocation');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    // Authorization check
    if (
      req.user.role === 'citizen' &&
      pickup.citizen._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot view another citizen\'s pickup request.',
      });
    }

    res.status(200).json({
      success: true,
      pickup,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel pickup request
// @route   PATCH /api/pickups/:id/cancel
// @access  Private/Citizen
export const cancelPickup = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    if (pickup.citizen.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own pickup requests.',
      });
    }

    if (!['pending', 'assigned'].includes(pickup.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel pickup once it is ${pickup.status}.`,
      });
    }

    pickup.status = 'cancelled';
    await pickup.save();

    emitToAll('pickup:updated', pickup);

    res.status(200).json({
      success: true,
      message: 'Pickup request cancelled successfully.',
      pickup,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign worker and vehicle to pickup
// @route   PATCH /api/pickups/:id/assign
// @access  Private/Admin
export const assignPickup = async (req, res, next) => {
  try {
    const { workerId, vehicleId } = req.body;

    if (!workerId || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Worker and Vehicle are required for assignment.',
      });
    }

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    pickup.assignedWorker = workerId;
    pickup.assignedVehicle = vehicleId;
    pickup.status = 'assigned';
    await pickup.save();

    const populated = await PickupRequest.findById(pickup._id)
      .populate('citizen', 'name phone email avatar')
      .populate('ward', 'name code city')
      .populate('assignedWorker', 'name phone')
      .populate('assignedVehicle', 'regNumber type currentLocation');

    // Notify citizen
    const notif = await Notification.create({
      user: pickup.citizen,
      title: '🚚 Pickup Assigned',
      body: `Your pickup request has been assigned to worker ${populated.assignedWorker?.name} with vehicle ${populated.assignedVehicle?.regNumber}.`,
      type: 'pickup_status',
      link: `/dashboard/pickups/${pickup._id}`,
    });

    notifyUser(pickup.citizen.toString(), {
      type: 'pickup:assigned',
      pickup: populated,
      notification: notif,
    });

    // Notify worker
    notifyUser(workerId, {
      type: 'pickup:assigned_worker',
      pickup: populated,
    });

    emitToAll('pickup:updated', populated);

    res.status(200).json({
      success: true,
      message: 'Pickup assigned successfully.',
      pickup: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update pickup status (on_the_way, collected, missed)
// @route   PATCH /api/pickups/:id/status
// @access  Private/Worker/Admin
export const updatePickupStatus = async (req, res, next) => {
  try {
    const { status, workerNotes } = req.body;

    const validStatuses = ['on_the_way', 'collected', 'missed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of [${validStatuses.join(', ')}]`,
      });
    }

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    pickup.status = status;
    if (workerNotes) pickup.workerNotes = workerNotes;
    if (status === 'collected') pickup.collectedAt = new Date();

    await pickup.save();

    const populated = await PickupRequest.findById(pickup._id)
      .populate('citizen', 'name phone email avatar')
      .populate('ward', 'name code city')
      .populate('assignedWorker', 'name phone')
      .populate('assignedVehicle', 'regNumber type');

    // Notify citizen
    const notif = await Notification.create({
      user: pickup.citizen,
      title: `Pickup ${status.replace('_', ' ').toUpperCase()}`,
      body: `Your waste pickup status has changed to '${status.replace('_', ' ')}'.`,
      type: 'pickup_status',
      link: `/dashboard/pickups/${pickup._id}`,
    });

    notifyUser(pickup.citizen.toString(), {
      type: 'pickup:updated',
      pickup: populated,
      notification: notif,
    });

    emitToAll('pickup:updated', populated);

    res.status(200).json({
      success: true,
      message: `Pickup status updated to ${status}.`,
      pickup: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify pickup segregation and credit points (key differentiator)
// @route   POST /api/pickups/:id/verify
// @access  Private/Worker/Admin
export const verifyPickup = async (req, res, next) => {
  try {
    const { segregation, workerNotes, verificationPhoto } = req.body;

    if (!['correct', 'partial', 'none'].includes(segregation)) {
      return res.status(400).json({
        success: false,
        message: 'Segregation quality must be one of: correct, partial, none.',
      });
    }

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    if (pickup.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'This pickup request has already been verified and points credited.',
      });
    }

    // Determine point value based on strict config rules
    let pointsToAward = 0;
    let reason = '';

    if (segregation === 'correct') {
      pointsToAward = ECO_RULES.POINTS.CORRECT_SEGREGATION; // +20
      reason = 'Verified 100% Correct Waste Segregation';
    } else if (segregation === 'partial') {
      pointsToAward = ECO_RULES.POINTS.PARTIAL_SEGREGATION; // +10
      reason = 'Verified Partial Waste Segregation';
    } else {
      pointsToAward = ECO_RULES.POINTS.NO_SEGREGATION; // 0
      reason = 'Unsegregated Mixed Waste (0 points)';
    }

    pickup.status = 'verified';
    pickup.segregation = segregation;
    pickup.verifiedAt = new Date();
    pickup.pointsAwarded = pointsToAward;
    if (workerNotes) pickup.workerNotes = workerNotes;
    if (verificationPhoto) pickup.verificationPhoto = verificationPhoto;
    if (!pickup.collectedAt) pickup.collectedAt = new Date();

    await pickup.save();

    // Credit points atomically to citizen with double-credit protection
    let pointsTransaction = null;
    if (pointsToAward > 0) {
      pointsTransaction = await creditPoints({
        userId: pickup.citizen,
        amount: pointsToAward,
        reason,
        refModel: 'PickupRequest',
        refId: pickup._id,
      });
    }

    const populated = await PickupRequest.findById(pickup._id)
      .populate('citizen', 'name phone email avatar ecoBalance lifetimePoints streakCount')
      .populate('ward', 'name code city')
      .populate('assignedWorker', 'name phone')
      .populate('assignedVehicle', 'regNumber type');

    emitToAll('pickup:updated', populated);

    res.status(200).json({
      success: true,
      message: `Pickup verified successfully. ${pointsToAward} eco-points credited to citizen.`,
      pickup: populated,
      pointsAwarded: pointsToAward,
      pointsTransaction,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit feedback and rating for verified pickup
// @route   POST /api/pickups/:id/feedback
// @access  Private/Citizen
export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5.',
      });
    }

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found.',
      });
    }

    if (pickup.citizen.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your own pickup requests.',
      });
    }

    const isFirstFeedback = !pickup.rating;

    pickup.rating = rating;
    pickup.feedback = feedback || '';
    await pickup.save();

    // Award +5 eco points for citizen feedback (max once per pickup)
    let feedbackBonus = null;
    if (isFirstFeedback) {
      feedbackBonus = await creditPoints({
        userId: req.user.id,
        amount: ECO_RULES.POINTS.SERVICE_FEEDBACK, // +5
        reason: 'Service Feedback Submission Bonus',
        refModel: 'Feedback',
        refId: pickup._id,
      });
    }

    res.status(200).json({
      success: true,
      message: isFirstFeedback
        ? `Thank you for your rating! You earned +${ECO_RULES.POINTS.SERVICE_FEEDBACK} bonus eco-points.`
        : 'Feedback updated successfully.',
      pickup,
      feedbackBonus,
    });
  } catch (err) {
    next(err);
  }
};
