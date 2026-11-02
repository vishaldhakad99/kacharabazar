import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { createDumpIcon } from '../../utils/leafletIcons';
import api from '../../api/client';

export const PublicHotspotMap = () => {
  const [dumps, setDumps] = useState([]);
  const [filter, setFilter] = useState('all'); // all, open, cleared
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicDumps = async () => {
      try {
        const res = await api.get('/dumps/public');
        if (res.success) {
          setDumps(res.dumps || []);
        }
      } catch (err) {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    fetchPublicDumps();
  }, []);

  const filteredDumps = dumps.filter((d) => {
    if (filter === 'open') return d.status === 'open' || d.status === 'assigned';
    if (filter === 'cleared') return d.status === 'cleared';
    return true;
  });

  const bhopalCenter = [23.2599, 77.4126];

  return (
    <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-soft-lg bg-surface dark:bg-gray-900">
      {/* Header filter controls */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-bold text-base text-ink dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent-500" />
            Live Civic Garbage Hotspot Map (Bhopal)
          </h3>
          <p className="text-xs text-muted">
            Citizens report roadside dumps. BMC clears hotspots with verified after-photos.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-gray-900 font-bold shadow-sm text-primary-700 dark:text-primary-300'
                : 'text-muted hover:text-ink'
            }`}
          >
            All ({dumps.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filter === 'open'
                ? 'bg-white dark:bg-gray-900 font-bold shadow-sm text-amber-600'
                : 'text-muted hover:text-ink'
            }`}
          >
            Active ({dumps.filter((d) => d.status !== 'cleared').length})
          </button>
          <button
            onClick={() => setFilter('cleared')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filter === 'cleared'
                ? 'bg-white dark:bg-gray-900 font-bold shadow-sm text-emerald-600'
                : 'text-muted hover:text-ink'
            }`}
          >
            Cleared ({dumps.filter((d) => d.status === 'cleared').length})
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="h-96 w-full relative">
        <MapContainer
          center={bhopalCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredDumps.map((dump) => {
            if (!dump.location?.coordinates) return null;
            const [lng, lat] = dump.location.coordinates;

            return (
              <Marker
                key={dump._id}
                position={[lat, lng]}
                icon={createDumpIcon(dump.severity, dump.status)}
              >
                <Popup className="custom-popup">
                  <div className="max-w-[220px] text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          dump.status === 'cleared'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dump.status}
                      </span>
                      <span className="text-[10px] text-muted font-medium capitalize">
                        {dump.severity} severity
                      </span>
                    </div>

                    <p className="font-semibold text-ink line-clamp-2 mb-1.5">
                      {dump.description}
                    </p>

                    {dump.address && (
                      <p className="text-[11px] text-muted mb-2">{dump.address}</p>
                    )}

                    {/* Before / After Photo Display */}
                    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden bg-gray-100 p-1">
                      {dump.photoBefore && (
                        <div>
                          <img
                            src={dump.photoBefore}
                            alt="Before cleanup"
                            className="w-full h-16 object-cover rounded"
                          />
                          <span className="block text-[9px] text-center text-muted mt-0.5 font-bold">
                            Reported
                          </span>
                        </div>
                      )}
                      {dump.photoAfter ? (
                        <div>
                          <img
                            src={dump.photoAfter}
                            alt="After cleanup"
                            className="w-full h-16 object-cover rounded border border-emerald-500"
                          />
                          <span className="block text-[9px] text-center text-emerald-600 mt-0.5 font-bold">
                            Cleared ✓
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-16 bg-gray-200 rounded text-[9px] text-muted text-center p-1">
                          Action In Progress
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend strip */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> High Severity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Cleared by BMC
          </span>
        </div>
        <span className="text-[11px]">Click any pin to inspect verified photos</span>
      </div>
    </div>
  );
};

export default PublicHotspotMap;
