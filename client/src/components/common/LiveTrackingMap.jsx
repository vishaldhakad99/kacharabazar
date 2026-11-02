import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Truck, Navigation, Clock, MapPin, Gauge } from 'lucide-react';
import { createTruckIcon, createCitizenPin, createStopIcon } from '../../utils/leafletIcons';
import { getSocket, joinWardRoom, leaveWardRoom } from '../../services/socket';

export const LiveTrackingMap = ({
  wardId,
  citizenCoords,
  routeStops = [],
  vehicleInitial = null,
}) => {
  const [vehicleLocation, setVehicleLocation] = useState(
    vehicleInitial?.currentLocation?.coordinates || [77.4334, 23.2332]
  );
  const [vehicleInfo, setVehicleInfo] = useState({
    regNumber: vehicleInitial?.regNumber || 'MP04-EA-1037',
    speed: 24,
    status: 'on_route',
  });
  const [etaMinutes, setEtaMinutes] = useState(12);

  useEffect(() => {
    if (wardId) {
      joinWardRoom(wardId);
    }

    const socket = getSocket();

    const handleLocationUpdate = (data) => {
      if (data?.coordinates) {
        setVehicleLocation(data.coordinates);
        setVehicleInfo((prev) => ({
          ...prev,
          regNumber: data.regNumber || prev.regNumber,
          speed: data.speed || prev.speed,
        }));

        // Calculate simple ETA if citizenCoords are available
        if (citizenCoords && citizenCoords.length === 2) {
          const [lon1, lat1] = data.coordinates;
          const [lon2, lat2] = citizenCoords;
          // Rough distance in km
          const dLat = (lat2 - lat1) * 111;
          const dLon = (lon2 - lon1) * 102;
          const distKm = Math.sqrt(dLat * dLat + dLon * dLon);
          const speed = data.speed || 20;
          const mins = Math.max(1, Math.round((distKm / speed) * 60));
          setEtaMinutes(mins);
        }
      }
    };

    socket.on('vehicle:location', handleLocationUpdate);

    return () => {
      socket.off('vehicle:location', handleLocationUpdate);
      if (wardId) leaveWardRoom(wardId);
    };
  }, [wardId, citizenCoords]);

  const mapCenter = citizenCoords ? [citizenCoords[1], citizenCoords[0]] : [vehicleLocation[1], vehicleLocation[0]];

  // Generate polyline positions for route stops if available
  const polylinePositions = routeStops
    .filter((s) => s.location?.coordinates)
    .map((s) => [s.location.coordinates[1], s.location.coordinates[0]]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-soft-lg bg-surface dark:bg-gray-900">
      {/* Live status overlay strip */}
      <div className="p-3.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-sm text-ink dark:text-white">
                {vehicleInfo.regNumber}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Live GPS Active
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-primary-600" /> {vehicleInfo.speed} km/h
              </span>
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-accent-500" /> Door-to-Door Route
              </span>
            </div>
          </div>
        </div>

        {/* Live ETA Card */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-accent-50 dark:bg-accent-950/50 border border-accent-200 dark:border-accent-900">
          <Clock className="w-4 h-4 text-accent-600 dark:text-accent-400" />
          <div>
            <span className="text-[10px] uppercase font-bold text-accent-700 dark:text-accent-300 block leading-tight">
              Estimated Arrival
            </span>
            <span className="text-sm font-extrabold text-accent-600 dark:text-accent-400">
              ~{etaMinutes} mins
            </span>
          </div>
        </div>
      </div>

      {/* Map view */}
      <div className="h-80 sm:h-96 w-full relative">
        <MapContainer
          center={mapCenter}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Polyline connecting route stops */}
          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="#1E7A46"
              weight={4}
              opacity={0.8}
              dashArray="6, 8"
            />
          )}

          {/* Citizen Pin */}
          {citizenCoords && (
            <Marker
              position={[citizenCoords[1], citizenCoords[0]]}
              icon={createCitizenPin('Your House')}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-ink">Your Pickup Location</p>
                  <p className="text-muted">Keep your segregated waste bins ready!</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route stops */}
          {routeStops.map((stop, index) => {
            if (!stop.location?.coordinates) return null;
            return (
              <Marker
                key={stop._id || index}
                position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
                icon={createStopIcon(stop.order || index + 1, stop.status)}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">Stop #{stop.order || index + 1}</p>
                    <p className="text-muted">{stop.address || 'Locality Stop'}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-gray-100">
                      {stop.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Live Moving Truck */}
          <Marker
            position={[vehicleLocation[1], vehicleLocation[0]]}
            icon={createTruckIcon(vehicleInfo.regNumber, true)}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-sm text-primary-900">{vehicleInfo.regNumber}</p>
                <p className="text-muted">Bhopal Municipal Collection Vehicle</p>
                <p className="mt-1 font-semibold text-accent-600">Speed: {vehicleInfo.speed} km/h</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
