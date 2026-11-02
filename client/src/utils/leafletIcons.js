import L from 'leaflet';

export const createTruckIcon = (regNumber = '', isMoving = true) => {
  return L.divIcon({
    className: 'custom-truck-marker',
    html: `
      <div class="relative flex flex-col items-center">
        ${isMoving ? '<span class="absolute -top-1 w-10 h-10 rounded-full bg-primary-500/30 live-pulse"></span>' : ''}
        <div class="relative w-10 h-10 rounded-2xl bg-primary-700 text-white shadow-lg flex items-center justify-center border-2 border-white ring-2 ring-primary-500/50">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </div>
        ${regNumber ? `<span class="mt-1 px-1.5 py-0.5 text-[10px] font-bold bg-white text-ink rounded shadow border border-gray-200 whitespace-nowrap">${regNumber}</span>` : ''}
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 26],
    popupAnchor: [0, -26],
  });
};

export const createPickupIcon = (wasteType = 'wet', status = 'pending') => {
  const colors = {
    wet: '#16a34a',
    dry: '#0284c7',
    recyclable: '#d97706',
    'e-waste': '#9333ea',
    hazardous: '#dc2626',
  };
  const bg = colors[wasteType] || '#16a34a';

  return L.divIcon({
    className: 'custom-pickup-marker',
    html: `
      <div class="relative flex flex-col items-center group">
        <div class="w-8 h-8 rounded-full text-white shadow-md flex items-center justify-center border-2 border-white ring-1 ring-black/10" style="background-color: ${bg};">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div class="w-2 h-2 rotate-45 -mt-1" style="background-color: ${bg};"></div>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 36],
    popupAnchor: [0, -36],
  });
};

export const createDumpIcon = (severity = 'medium', status = 'open') => {
  const isCleared = status === 'cleared';
  const colors = {
    high: '#dc2626',
    medium: '#f59e0b',
    low: '#eab308',
  };
  const bg = isCleared ? '#16a34a' : colors[severity] || '#f59e0b';

  return L.divIcon({
    className: 'custom-dump-marker',
    html: `
      <div class="relative flex flex-col items-center">
        <div class="w-8 h-8 rounded-full text-white shadow-md flex items-center justify-center border-2 border-white ring-1 ring-black/10" style="background-color: ${bg};">
          ${
            isCleared
              ? '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>'
              : '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
          }
        </div>
        <div class="w-2 h-2 rotate-45 -mt-1" style="background-color: ${bg};"></div>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 36],
    popupAnchor: [0, -36],
  });
};

export const createStopIcon = (order = 1, status = 'pending') => {
  const isDone = status === 'completed';
  const isReached = status === 'reached';
  const bg = isDone ? '#16a34a' : isReached ? '#d97706' : '#2F6F8F';

  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div class="w-7 h-7 rounded-full text-white text-xs font-bold shadow-md flex items-center justify-center border-2 border-white ring-1 ring-black/20" style="background-color: ${bg};">
        ${isDone ? '✓' : order}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export const createCitizenPin = (name = 'You') => {
  return L.divIcon({
    className: 'custom-citizen-marker',
    html: `
      <div class="relative flex flex-col items-center">
        <span class="absolute -top-1 w-8 h-8 rounded-full bg-accent-500/30 live-pulse"></span>
        <div class="w-8 h-8 rounded-full bg-accent-500 text-white shadow-lg flex items-center justify-center border-2 border-white ring-2 ring-accent-400/50">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div class="w-2 h-2 rotate-45 -mt-1 bg-accent-500"></div>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 36],
    popupAnchor: [0, -36],
  });
};
