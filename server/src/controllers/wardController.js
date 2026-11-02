import { Ward, Vehicle, PickupRequest } from '../models/index.js';

// @desc    Get all wards
// @route   GET /api/wards
// @access  Public
export const getWards = async (req, res, next) => {
  try {
    const wards = await Ward.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: wards.length,
      wards,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single ward with statistics
// @route   GET /api/wards/:id
// @access  Public
export const getWardById = async (req, res, next) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found.',
      });
    }

    const vehicleCount = await Vehicle.countDocuments({ ward: ward._id });
    const activePickups = await PickupRequest.countDocuments({
      ward: ward._id,
      status: { $in: ['pending', 'assigned', 'on_the_way'] },
    });

    res.status(200).json({
      success: true,
      ward,
      stats: {
        vehicles: vehicleCount,
        activePickups,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new ward
// @route   POST /api/wards
// @access  Private/Admin
export const createWard = async (req, res, next) => {
  try {
    const { name, code, city, center, population, description } = req.body;

    if (!name || !code || !center || !center.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, and center coordinates [lng, lat] are required.',
      });
    }

    const ward = await Ward.create({
      name,
      code: code.toUpperCase(),
      city: city || 'Bhopal',
      center: {
        type: 'Point',
        coordinates: center.coordinates,
      },
      population: population || 25000,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Ward created successfully.',
      ward,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update ward
// @route   PATCH /api/wards/:id
// @access  Private/Admin
export const updateWard = async (req, res, next) => {
  try {
    const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ward) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ward updated successfully.',
      ward,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete ward
// @route   DELETE /api/wards/:id
// @access  Private/Admin
export const deleteWard = async (req, res, next) => {
  try {
    const ward = await Ward.findByIdAndDelete(req.params.id);
    if (!ward) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ward deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
