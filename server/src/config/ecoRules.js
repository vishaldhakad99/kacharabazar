// Kachra Bazar Eco-Points Rules & Environmental Metrics Configuration

export const ECO_RULES = {
  // Point values for waste pickup segregation
  POINTS: {
    CORRECT_SEGREGATION: 20,
    PARTIAL_SEGREGATION: 10,
    NO_SEGREGATION: 0,
    CLEARED_DUMP_REPORT: 30,
    STREAK_7_DAYS: 50,
    SERVICE_FEEDBACK: 5, // max once per pickup
  },

  // Environmental impact estimation constants
  METRICS: {
    AVG_KG_PER_PICKUP: 3.5, // Estimated kg of municipal waste per household pickup
    CO2_SAVED_PER_KG_KG: 1.25, // 1.25 kg CO2 equivalent avoided per kg segregated recycled waste
  },

  // Citizen loyalty tiers based on lifetime points
  TIERS: [
    { name: 'Bronze', minPoints: 0, maxPoints: 99, color: '#CD7F32', badge: '🥉' },
    { name: 'Silver', minPoints: 100, maxPoints: 299, color: '#C0C0C0', badge: '🥈' },
    { name: 'Gold', minPoints: 300, maxPoints: 699, color: '#FFD700', badge: '🥇' },
    { name: 'Platinum', minPoints: 700, maxPoints: Infinity, color: '#E5E4E2', badge: '💎' },
  ],

  // Waste categories supported
  WASTE_TYPES: [
    { id: 'wet', label: 'Wet Waste (Biodegradable)', icon: 'apple', color: '#16a34a' },
    { id: 'dry', label: 'Dry Recyclable (Paper/Plastic)', icon: 'package', color: '#0284c7' },
    { id: 'recyclable', label: 'Metal & Glass', icon: 'recycle', color: '#d97706' },
    { id: 'e-waste', label: 'E-Waste (Electronics/Batteries)', icon: 'cpu', color: '#9333ea' },
    { id: 'hazardous', label: 'Domestic Hazardous / Medical', icon: 'alert-triangle', color: '#dc2626' }
  ]
};

export default ECO_RULES;
