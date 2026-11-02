import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Navigation, MapPin } from 'lucide-react';
import { createCitizenPin } from '../../utils/leafletIcons';
import toast from 'react-hot-toast';

// Component to handle clicks on the map to place the pin
const LocationMarker = ({ position, setPosition }) => {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lng, e.latlng.lat]);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          setPosition([latlng.lng, latlng.lat]);
        }
      },
    }),
    [setPosition]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position[1], position[0]]} // Leaflet expects [lat, lng]
      ref={markerRef}
      icon={createCitizenPin('Pickup')}
    />
  );
};

export const MapPicker = ({ initialCoords = [77.4126, 23.2599], onLocationChange }) => {
  // Coords in [lng, lat]
  const [coords, setCoords] = useState(initialCoords);

  useEffect(() => {
    if (initialCoords && initialCoords.length === 2) {
      setCoords(initialCoords);
    }
  }, [initialCoords]);

  const handlePositionChange = (newCoords) => {
    setCoords(newCoords);
    if (onLocationChange) {
      onLocationChange(newCoords);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = [pos.coords.longitude, pos.coords.latitude];
        setCoords(newCoords);
        if (onLocationChange) {
          onLocationChange(newCoords);
        }
        toast.success('Location detected using device GPS!');
      },
      (err) => {
        toast.error('Could not fetch device location. Please drag the pin on map.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="h-64 sm:h-72 w-full">
        <MapContainer
          center={[coords[1], coords[0]]}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={coords} setPosition={handlePositionChange} />
        </MapContainer>
      </div>

      {/* Floating GPS button */}
      <div className="absolute top-3 right-3 z-[400]">
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 text-ink dark:text-white text-xs font-semibold shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-primary-600" />
          Use My GPS
        </button>
      </div>

      {/* Coordinates label */}
      <div className="p-2.5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1 font-mono">
          <MapPin className="w-3.5 h-3.5 text-accent-500" />
          {coords[1].toFixed(5)}° N, {coords[0].toFixed(5)}° E
        </span>
        <span className="text-[11px] text-primary-700 dark:text-primary-300 font-medium">
          Drag pin or click map to set exact spot
        </span>
      </div>
    </div>
  );
};

export default MapPicker;
