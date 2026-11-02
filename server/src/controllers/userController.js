import { User } from '../models/index.js';

// @desc    Get all users (with search, filter, pagination)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, ward, status, page = 1, limit = 15 } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }
    if (ward) {
      query.ward = ward;
    }
    if (status) {
      query.isActive = status === 'active';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .populate('ward', 'name code city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new user (worker or admin)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, ward, address } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, password, and role are required.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
      ward: ward || null,
      address: address || '',
    });

    const populatedUser = await User.findById(user._id).populate('ward', 'name code city');

    res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      user: populatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, ward, address, isActive, ecoBalance } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (role) fieldsToUpdate.role = role;
    if (ward !== undefined) fieldsToUpdate.ward = ward || null;
    if (address !== undefined) fieldsToUpdate.address = address;
    if (isActive !== undefined) fieldsToUpdate.isActive = isActive;
    if (ecoBalance !== undefined) fieldsToUpdate.ecoBalance = ecoBalance;

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).populate('ward', 'name code city');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
