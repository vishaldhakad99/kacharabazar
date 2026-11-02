import { Vehicle, VehicleLocation, Ward, Route } from '../models/index.js';
import { broadcastVehicleLocation } from '../services/socket.js';

// @desc    Get all vehicles (with filters)
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res, next) => {
  try {
    const { ward, status } = req.query;
    const query = {};

    if (ward) query.ward = ward;
    if (status) query.status = status;

    const vehicles = await Vehicle.find(query)
      .populate('ward', 'name code city center')
      .populate('driver', 'name phone email')
      .sort({ regNumber: 1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single vehicle with live location
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('ward', 'name code city center')
      .populate('driver', 'name phone email');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    // Get active route for this vehicle
    const activeRoute = await Route.findOne({
      vehicle: vehicle._id,
      status: { $in: ['in_progress', 'scheduled'] },
    }).populate('worker', 'name phone');

    res.status(200).json({
      success: true,
      vehicle,
      activeRoute,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
export const createVehicle = async (req, res, next) => {
  try {
    const { regNumber, type, ward, driver, capacityKg } = req.body;

    if (!regNumber || !ward) {
      return res.status(400).json({
        success: false,
        message: 'Registration number and ward are required.',
      });
    }

    const wardDoc = await Ward.findById(ward);
    const initialCoords = wardDoc?.center?.coordinates || [77.4126, 23.2599];

    const vehicle = await Vehicle.create({
      regNumber: regNumber.toUpperCase(),
      type: type || 'tipper_truck',
      ward,
      driver: driver || null,
      capacityKg: capacityKg || 1500,
      currentLocation: {
        type: 'Point',
        coordinates: initialCoords,
      },
    });

    const populated = await Vehicle.findById(vehicle._id)
      .populate('ward', 'name code city')
      .populate('driver', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully.',
      vehicle: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update vehicle
// @route   PATCH /api/vehicles/:id
// @access  Private/Admin
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('ward', 'name code city')
      .populate('driver', 'name phone');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully.',
      vehicle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update vehicle live GPS location (from worker's phone GPS)
// @route   POST /api/vehicles/:id/location
// @access  Private/Worker/Admin
export const updateVehicleLocation = async (req, res, next) => {
  try {
    const { coordinates, speed } = req.body;

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid coordinates [longitude, latitude] are required.',
      });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    vehicle.currentLocation = {
      type: 'Point',
      coordinates,
    };
    vehicle.lastUpdated = new Date();
    await vehicle.save();

    await VehicleLocation.create({
      vehicle: vehicle._id,
      ward: vehicle.ward,
      location: {
        type: 'Point',
        coordinates,
      },
      speed: speed || 20,
      at: new Date(),
    });

    broadcastVehicleLocation(vehicle.ward.toString(), {
      vehicleId: vehicle._id,
      regNumber: vehicle.regNumber,
      coordinates,
      speed: speed || 20,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Vehicle location updated and broadcast.',
    });
  } catch (err) {
    next(err);
  }
};
