import { Vehicle, Route, VehicleLocation, PickupRequest, Notification } from '../models/index.js';
import { broadcastVehicleLocation, notifyUser } from './socket.js';

let simulationInterval = null;
const notifiedPickups = new Set(); // Prevent repeated "within 500m" notifications

// Calculate Haversine distance in meters between two [lng, lat] coordinates
const calculateDistanceMeters = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Linear interpolation between two coordinates
const interpolate = (p1, p2, factor) => {
  return [
    p1[0] + (p2[0] - p1[0]) * factor,
    p1[1] + (p2[1] - p1[1]) * factor,
  ];
};

// Route step tracker in memory: { routeId: { currentStopIndex: 0, progress: 0 } }
const routeStates = new Map();

export const startVehicleSimulator = () => {
  if (process.env.SIMULATE_VEHICLES === 'false') {
    console.log('[Simulator] Vehicle simulation disabled by SIMULATE_VEHICLES=false');
    return;
  }

  const intervalMs = parseInt(process.env.SIMULATION_INTERVAL_MS, 10) || 3000;
  console.log(`[Simulator] Starting vehicle simulation engine (interval: ${intervalMs}ms)`);

  if (simulationInterval) {
    clearInterval(simulationInterval);
  }

  simulationInterval = setInterval(async () => {
    try {
      // Find all routes that are scheduled or in progress, or find vehicles marked on_route
      const activeRoutes = await Route.find({
        status: { $in: ['in_progress', 'scheduled'] },
      }).populate('vehicle').populate('ward');

      if (!activeRoutes || activeRoutes.length === 0) {
        return;
      }

      for (const route of activeRoutes) {
        if (!route.vehicle || !route.stops || route.stops.length < 2) continue;

        const routeId = route._id.toString();
        let state = routeStates.get(routeId);

        if (!state) {
          state = { currentStopIndex: 0, progress: 0 };
          routeStates.set(routeId, state);
        }

        const totalStops = route.stops.length;
        const fromStop = route.stops[state.currentStopIndex];
        const toStop = route.stops[(state.currentStopIndex + 1) % totalStops];

        if (!fromStop?.location?.coordinates || !toStop?.location?.coordinates) continue;

        // Move vehicle forward along segment
        state.progress += 0.08; // advance step
        if (state.progress >= 1) {
          state.progress = 0;
          state.currentStopIndex = (state.currentStopIndex + 1) % totalStops;
        }

        const newCoordinates = interpolate(
          fromStop.location.coordinates,
          toStop.location.coordinates,
          state.progress
        );

        const speed = Math.round(18 + Math.random() * 12); // Realistic city speed 18-30 km/h

        // Update Vehicle document
        await Vehicle.findByIdAndUpdate(route.vehicle._id, {
          currentLocation: {
            type: 'Point',
            coordinates: newCoordinates,
          },
          lastUpdated: new Date(),
          status: 'on_route',
        });

        // Store location history with 24h TTL
        await VehicleLocation.create({
          vehicle: route.vehicle._id,
          ward: route.ward._id,
          location: {
            type: 'Point',
            coordinates: newCoordinates,
          },
          speed,
          at: new Date(),
        });

        // Broadcast to ward and admin rooms
        broadcastVehicleLocation(route.ward._id.toString(), {
          vehicleId: route.vehicle._id,
          regNumber: route.vehicle.regNumber,
          routeId: route._id,
          routeName: route.name,
          wardId: route.ward._id,
          wardName: route.ward.name,
          coordinates: newCoordinates, // [lng, lat]
          speed,
          currentStopIndex: state.currentStopIndex,
          totalStops,
          timestamp: new Date(),
        });

        // Proximity detection: check nearby citizen pickups within 500m
        const pendingPickups = await PickupRequest.find({
          ward: route.ward._id,
          status: { $in: ['assigned', 'on_the_way'] },
        });

        for (const pickup of pendingPickups) {
          if (!pickup.location?.coordinates) continue;

          const distanceMeters = calculateDistanceMeters(
            newCoordinates,
            pickup.location.coordinates
          );

          // If within 500 meters and not notified recently
          const pickupKey = `${pickup._id}-${pickup.citizen}`;
          if (distanceMeters <= 500 && !notifiedPickups.has(pickupKey)) {
            notifiedPickups.add(pickupKey);

            if (pickup.status === 'assigned') {
              pickup.status = 'on_the_way';
              pickup.assignedVehicle = route.vehicle._id;
              pickup.assignedWorker = route.worker;
              await pickup.save();
            }

            const notif = await Notification.create({
              user: pickup.citizen,
              title: '🚚 Collection Truck Nearby!',
              body: `Waste collection vehicle (${route.vehicle.regNumber}) is within 500m of your location. Please keep your segregated bins ready!`,
              type: 'pickup_status',
              link: `/dashboard/pickups/${pickup._id}`,
            });

            notifyUser(pickup.citizen.toString(), {
              type: 'pickup:nearby',
              pickupId: pickup._id,
              regNumber: route.vehicle.regNumber,
              distance: Math.round(distanceMeters),
              notification: notif,
            });
          }
        }
      }
    } catch (err) {
      console.error('[Simulator Error]', err.message);
    }
  }, intervalMs);
};

export const stopVehicleSimulator = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};
