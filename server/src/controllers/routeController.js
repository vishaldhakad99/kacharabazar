import { Route, Vehicle, PickupRequest } from '../models/index.js';
import { emitToAll } from '../services/socket.js';

// @desc    Get routes (role-scoped)
// @route   GET /api/routes
// @access  Private
export const getRoutes = async (req, res, next) => {
  try {
    const { ward, status, date } = req.query;
    const query = {};

    if (req.user.role === 'worker') {
      query.worker = req.user.id;
    } else if (req.user.role === 'admin') {
      if (ward) query.ward = ward;
    }

    if (status) query.status = status;

    const routes = await Route.find(query)
      .populate('ward', 'name code city center')
      .populate('vehicle', 'regNumber type currentLocation status')
      .populate('worker', 'name phone email')
      .populate({
        path: 'stops.request',
        populate: { path: 'citizen', select: 'name phone address' },
      })
      .sort({ scheduledFor: -1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      routes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single route by ID
// @route   GET /api/routes/:id
// @access  Private
export const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('ward', 'name code city center')
      .populate('vehicle', 'regNumber type currentLocation status')
      .populate('worker', 'name phone email')
      .populate({
        path: 'stops.request',
        populate: { path: 'citizen', select: 'name phone address ecoBalance' },
      });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.',
      });
    }

    res.status(200).json({
      success: true,
      route,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new collection route
// @route   POST /api/routes
// @access  Private/Admin
export const createRoute = async (req, res, next) => {
  try {
    const { name, ward, vehicle, worker, stops, scheduledFor } = req.body;

    if (!name || !ward || !stops || stops.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Route name, ward, and at least one stop are required.',
      });
    }

    // Format stops
    const formattedStops = stops.map((s, index) => ({
      request: s.request || null,
      location: {
        type: 'Point',
        coordinates: s.location?.coordinates || s.coordinates,
      },
      address: s.address || `Stop #${index + 1}`,
      order: index + 1,
      status: 'pending',
    }));

    const route = await Route.create({
      name,
      ward,
      vehicle: vehicle || null,
      worker: worker || null,
      stops: formattedStops,
      scheduledFor: scheduledFor || new Date(),
      status: 'scheduled',
    });

    // Update vehicle status
    if (vehicle) {
      await Vehicle.findByIdAndUpdate(vehicle, { status: 'on_route' });
    }

    // Link stops that are pickup requests
    for (const stop of formattedStops) {
      if (stop.request) {
        await PickupRequest.findByIdAndUpdate(stop.request, {
          route: route._id,
          assignedWorker: worker || null,
          assignedVehicle: vehicle || null,
          status: 'assigned',
        });
      }
    }

    const populated = await Route.findById(route._id)
      .populate('ward', 'name code city')
      .populate('vehicle', 'regNumber type')
      .populate('worker', 'name phone');

    emitToAll('route:created', populated);

    res.status(201).json({
      success: true,
      message: 'Collection route created successfully.',
      route: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update route (start route, complete route, edit)
// @route   PATCH /api/routes/:id
// @access  Private/Worker/Admin
export const updateRoute = async (req, res, next) => {
  try {
    const { status, name, vehicle, worker } = req.body;
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.',
      });
    }

    if (status) {
      route.status = status;
      if (status === 'in_progress' && !route.startedAt) {
        route.startedAt = new Date();
        if (route.vehicle) {
          await Vehicle.findByIdAndUpdate(route.vehicle, { status: 'on_route' });
        }
      } else if (status === 'completed') {
        route.completedAt = new Date();
        if (route.vehicle) {
          await Vehicle.findByIdAndUpdate(route.vehicle, { status: 'idle' });
        }
      }
    }

    if (name) route.name = name;
    if (vehicle) route.vehicle = vehicle;
    if (worker) route.worker = worker;

    await route.save();

    const populated = await Route.findById(route._id)
      .populate('ward', 'name code city')
      .populate('vehicle', 'regNumber type currentLocation')
      .populate('worker', 'name phone');

    emitToAll('route:updated', populated);

    res.status(200).json({
      success: true,
      message: 'Route updated successfully.',
      route: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update specific stop in route (arrived, completed, skipped)
// @route   PATCH /api/routes/:id/stops/:stopId
// @access  Private/Worker/Admin
export const updateRouteStop = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id, stopId } = req.params;

    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.',
      });
    }

    const stop = route.stops.id(stopId);
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found in this route.',
      });
    }

    stop.status = status;
    if (status === 'reached') {
      stop.reachedAt = new Date();
    } else if (status === 'completed') {
      stop.completedAt = new Date();
    }

    // Check if all stops are completed
    const allDone = route.stops.every((s) => s.status === 'completed' || s.status === 'skipped');
    if (allDone) {
      route.status = 'completed';
      route.completedAt = new Date();
      if (route.vehicle) {
        await Vehicle.findByIdAndUpdate(route.vehicle, { status: 'idle' });
      }
    } else if (route.status === 'scheduled') {
      route.status = 'in_progress';
      route.startedAt = new Date();
    }

    await route.save();

    res.status(200).json({
      success: true,
      message: 'Stop status updated.',
      stop,
      routeStatus: route.status,
    });
  } catch (err) {
    next(err);
  }
};
