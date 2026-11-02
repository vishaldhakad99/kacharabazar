import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  Ward,
  Vehicle,
  Route,
  PickupRequest,
  DumpReport,
  VehicleLocation,
  EcoPointTransaction,
  Reward,
  Redemption,
  Notification,
  Announcement,
  IssueReport,
} from '../models/index.js';
import { ECO_RULES } from '../config/ecoRules.js';

dotenv.config();

const DEMO_PASSWORD = 'Demo@1234';

const bhopalWards = [
  {
    name: 'MP Nagar (Zone 1 & 2)',
    code: 'BPL-W01',
    city: 'Bhopal',
    center: { type: 'Point', coordinates: [77.4334, 23.2332] },
    population: 48000,
    description: 'Commercial and institutional core of New Bhopal',
  },
  {
    name: 'Arera Colony',
    code: 'BPL-W02',
    city: 'Bhopal',
    center: { type: 'Point', coordinates: [77.4326, 23.2131] },
    population: 62000,
    description: 'Premier residential sectors E1 to E8 with active resident welfare associations',
  },
  {
    name: 'New Market (TT Nagar)',
    code: 'BPL-W03',
    city: 'Bhopal',
    center: { type: 'Point', coordinates: [77.3995, 23.2355] },
    population: 52000,
    description: 'High-density commercial market area, government quarters and transit hub',
  },
  {
    name: 'Kolar Road',
    code: 'BPL-W04',
    city: 'Bhopal',
    center: { type: 'Point', coordinates: [77.4188, 23.1812] },
    population: 75000,
    description: 'Rapidly growing residential corridor with large housing societies',
  },
  {
    name: 'Bairagarh (Sant Hirdaram Nagar)',
    code: 'BPL-W05',
    city: 'Bhopal',
    center: { type: 'Point', coordinates: [77.3411, 23.2721] },
    population: 58000,
    description: 'Major wholesale textile market and historic western municipal boundary',
  },
  {
    name: 'Hamidia Road (Old Bhopal)',
    code: 'BPL-W06',
    city: 'Bhopal',
    center: { type: 'Point', coordinates: [77.4045, 23.2685] },
    population: 82000,
    description: 'Dense heritage trading street near Bhopal Junction railway station',
  },
  {
    name: 'Piplani (BHEL Township)',
    code: 'BPL-W07',
    city: 'Bhopal',
    center: { type: 'Point', coordinates: [77.4815, 23.2351] },
    population: 69000,
    description: 'Industrial and residential township with wide avenues and civic quarters',
  },
  {
    name: 'Shahpura & Chunabhatti',
    code: 'BPL-W08',
    city: 'Bhopal',
    center: { type: 'Point', coordinates: [77.4312, 23.1945] },
    population: 54000,
    description: 'Scenic lakeside residential locality surrounding Shahpura Lake',
  },
];

const rewardsData = [
  {
    title: '₹200 Madhya Pradesh Electricity Bill Subsidy',
    description: 'Direct rebate voucher applicable on monthly MPPKVVCL electricity bills.',
    category: 'utilities',
    pointsCost: 200,
    stock: 75,
    partnerName: 'MP Madhya Kshetra Vidyut Vitaran Co. Ltd.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80',
    terms: 'Valid on residential domestic connections within Bhopal Municipal limits.',
  },
  {
    title: '₹150 BMC Water Tax Discount Voucher',
    description: 'Municipal rebate on half-yearly Bhopal Municipal Corporation water utility cess.',
    category: 'utilities',
    pointsCost: 150,
    stock: 60,
    partnerName: 'Bhopal Municipal Corporation (BMC)',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
    terms: 'Can be linked directly with property water consumer ID.',
  },
  {
    title: '3-Bin Color Coded Segregation Kit',
    description: 'Set of Green (Wet), Blue (Dry), and Red (Hazardous) 15L bins with pedal lids.',
    category: 'goods',
    pointsCost: 250,
    stock: 40,
    partnerName: 'Swachh Bharat Mission Bhopal',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    terms: 'Delivered to your doorstep by the ward collection vehicle within 7 working days.',
  },
  {
    title: 'Home Aerobic Composting Smart Kit',
    description: '20L organic kitchen waste composter with microbial composting accelerator brick.',
    category: 'goods',
    pointsCost: 350,
    stock: 25,
    partnerName: 'Bhopal Eco Living Society',
    image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=600&auto=format&fit=crop&q=80',
    terms: 'Includes step-by-step Hindi/English composting guide and phone support.',
  },
  {
    title: 'Heavy Duty Reusable Jute Shopping Bags (Pack of 3)',
    description: 'Sturdy, washable, zero-plastic vegetable and grocery shopping bags.',
    category: 'goods',
    pointsCost: 80,
    stock: 120,
    partnerName: 'Madhya Pradesh Hastshilp Vikas Nigam',
    image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&auto=format&fit=crop&q=80',
    terms: '100% natural biodegradable jute fiber, made by local women self-help groups.',
  },
  {
    title: '₹100 Organic Khadi Store Grocery Voucher',
    description: 'Discount coupon valid across all Bhopal Khadi Gramodyog and organic stores.',
    category: 'vouchers',
    pointsCost: 100,
    stock: 90,
    partnerName: 'MP Khadi & Village Industries Board',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
    terms: 'Valid on purchases above ₹300 at participating outlets.',
  },
  {
    title: '25% Off Local Plant Nursery Voucher',
    description: 'Discount on indigenous flowering plants, medicinal herbs, and terracotta pots.',
    category: 'vouchers',
    pointsCost: 75,
    stock: 80,
    partnerName: 'Bhopal Horticultural Guild',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80',
    terms: 'Valid across Arera and Kolar authorized green nurseries.',
  },
  {
    title: '₹50 Bhopal City Metro / City Bus Pass Card Credit',
    description: 'Digital recharge coupon for Bhopal BCLL MyBus smart transit travel cards.',
    category: 'utilities',
    pointsCost: 60,
    stock: 150,
    partnerName: 'Bhopal City Link Limited (BCLL)',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',
    terms: 'Redeemable at any BCLL ticket counter or MyBus Android app.',
  },
];

const indianFirstNames = [
  'Aarav', 'Ananya', 'Rohan', 'Pooja', 'Vikram', 'Neha', 'Aditya', 'Sneha',
  'Deepak', 'Kavita', 'Suresh', 'Sunita', 'Rajesh', 'Priya', 'Manoj', 'Ritu',
  'Amit', 'Swati', 'Alok', 'Meera', 'Kunal', 'Shweta', 'Nikhil', 'Divya',
  'Gaurav', 'Archana', 'Sanjay', 'Preeti', 'Prateek', 'Jyoti', 'Varun', 'Pallavi',
  'Ashish', 'Anjali', 'Tarun', 'Komal', 'Abhishek', 'Monika', 'Sachin', 'Bhavna',
  'Mayank', 'Suman', 'Mohit', 'Tanvi', 'Harish', 'Geeta', 'Anand', 'Nisha',
  'Devendra', 'Mamta', 'Hemant', 'Rashmi', 'Vivek', 'Garima', 'Yogesh', 'Seema',
  'Pankaj', 'Poonam', 'Mukesh', 'Vandana'
];

const indianLastNames = [
  'Sharma', 'Verma', 'Patel', 'Dhakad', 'Jain', 'Gupta', 'Singh', 'Chouhan',
  'Mishra', 'Tiwari', 'Yadav', 'Dubey', 'Soni', 'Pandey', 'Saxena', 'Shrivastava',
  'Malviya', 'Nagar', 'Meena', 'Rathore', 'Lodhi', 'Gour', 'Tomar', 'Bhatt'
];

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Ward.deleteMany({}),
      Vehicle.deleteMany({}),
      Route.deleteMany({}),
      PickupRequest.deleteMany({}),
      DumpReport.deleteMany({}),
      VehicleLocation.deleteMany({}),
      EcoPointTransaction.deleteMany({}),
      Reward.deleteMany({}),
      Redemption.deleteMany({}),
      Notification.deleteMany({}),
      Announcement.deleteMany({}),
      IssueReport.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // 1. Seed Wards
    console.log('[Seed] Inserting Bhopal wards...');
    const insertedWards = await Ward.insertMany(bhopalWards);
    const wardMap = {};
    insertedWards.forEach((w) => {
      wardMap[w.code] = w;
    });

    // 2. Seed Admin User
    console.log('[Seed] Creating municipal administrator...');
    const adminUser = await User.create({
      name: 'Dr. Rakesh Swaroop (BMC Sanitation Chief)',
      email: 'admin@kachrabazar.in',
      phone: '+91 98260 12345',
      passwordHash,
      role: 'admin',
      ward: insertedWards[0]._id,
      address: 'Bhopal Municipal Corporation HQ, Harshvardhan Complex, Mata Mandir, Bhopal',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    // 3. Seed 8 Sanitation Workers (1 per ward)
    console.log('[Seed] Creating 8 ward sanitation workers...');
    const workerNames = [
      'Mukesh Kumar Dhakad', 'Raju Chouhan', 'Rameshwar Meena', 'Sunil Solanki',
      'Dharmendra Malviya', 'Gopal Ahirwar', 'Kailash Lodhi', 'Mahesh Verma'
    ];

    const workers = [];
    for (let i = 0; i < insertedWards.length; i++) {
      const worker = await User.create({
        name: workerNames[i] || `BMC Worker Ward ${i + 1}`,
        email: `worker${i + 1}@kachrabazar.in`,
        phone: `+91 9826${i} 000${i + 1}`,
        passwordHash,
        role: 'worker',
        ward: insertedWards[i]._id,
        address: `Ward ${insertedWards[i].code} Sanitation Depot, Bhopal`,
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`,
        isActive: true,
      });
      workers.push(worker);
    }

    // 4. Seed 60 Citizens with realistic Bhopal addresses
    console.log('[Seed] Creating 60 citizens with profiles & points...');
    const citizens = [];
    for (let i = 0; i < 60; i++) {
      const fName = indianFirstNames[i % indianFirstNames.length];
      const lName = indianLastNames[(i * 3) % indianLastNames.length];
      const ward = insertedWards[i % insertedWards.length];

      // Jitter around ward center coordinates
      const center = ward.center.coordinates;
      const lng = center[0] + (Math.random() - 0.5) * 0.015;
      const lat = center[1] + (Math.random() - 0.5) * 0.015;

      const citizen = await User.create({
        name: `${fName} ${lName}`,
        email: i === 0 ? 'citizen@kachrabazar.in' : `citizen${i + 1}@gmail.com`,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: 'citizen',
        ward: ward._id,
        address: `House #${10 + (i % 80)}, Sector ${['A', 'B', 'C', 'D'][i % 4]}, ${ward.name}, Bhopal`,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + (i % 10) * 100}?w=150&auto=format&fit=crop&q=80`,
        ecoBalance: 60 + (i * 15) % 240,
        lifetimePoints: 120 + (i * 25) % 450,
        streakCount: (i % 7) + 1,
        lastPickupDate: new Date(Date.now() - (i % 3) * 86400000),
        isActive: true,
      });
      citizens.push(citizen);
    }

    // 5. Seed 12 Bhopal Municipal Collection Vehicles
    console.log('[Seed] Creating 12 BMC waste collection vehicles...');
    const vehicleTypes = ['tipper_truck', 'compactor', 'mini_truck', 'electric_cart'];
    const vehicles = [];
    for (let i = 0; i < 12; i++) {
      const ward = insertedWards[i % insertedWards.length];
      const driver = workers[i % workers.length];
      const coords = [
        ward.center.coordinates[0] + (Math.random() - 0.5) * 0.008,
        ward.center.coordinates[1] + (Math.random() - 0.5) * 0.008,
      ];

      const vehicle = await Vehicle.create({
        regNumber: `MP04-EA-${1000 + (i + 1) * 37}`,
        type: vehicleTypes[i % vehicleTypes.length],
        ward: ward._id,
        driver: driver._id,
        status: i < 8 ? 'on_route' : 'idle',
        currentLocation: {
          type: 'Point',
          coordinates: coords,
        },
        capacityKg: 1200 + (i % 3) * 500,
        lastUpdated: new Date(),
      });
      vehicles.push(vehicle);
    }

    // 6. Seed 6 Collection Routes with ordered stops
    console.log('[Seed] Creating 6 collection routes with road waypoints...');
    const routes = [];
    for (let r = 0; r < 6; r++) {
      const ward = insertedWards[r];
      const vehicle = vehicles[r];
      const worker = workers[r];
      const center = ward.center.coordinates;

      // 5 stops per route along simulated street path
      const stops = [
        {
          location: { type: 'Point', coordinates: [center[0] - 0.004, center[1] - 0.003] },
          address: `Stop 1: Gate 1, ${ward.name}`,
          order: 1,
          status: 'completed',
        },
        {
          location: { type: 'Point', coordinates: [center[0] - 0.002, center[1] + 0.001] },
          address: `Stop 2: Community Hall, ${ward.name}`,
          order: 2,
          status: 'completed',
        },
        {
          location: { type: 'Point', coordinates: [center[0] + 0.001, center[1] + 0.003] },
          address: `Stop 3: Market Square, ${ward.name}`,
          order: 3,
          status: 'reached',
        },
        {
          location: { type: 'Point', coordinates: [center[0] + 0.003, center[1] + 0.001] },
          address: `Stop 4: Society Park, ${ward.name}`,
          order: 4,
          status: 'pending',
        },
        {
          location: { type: 'Point', coordinates: [center[0] + 0.004, center[1] - 0.002] },
          address: `Stop 5: Main Road Crossing, ${ward.name}`,
          order: 5,
          status: 'pending',
        },
      ];

      const route = await Route.create({
        name: `Morning Line 1 - ${ward.name}`,
        ward: ward._id,
        vehicle: vehicle._id,
        worker: worker._id,
        stops,
        scheduledFor: new Date(),
        status: 'in_progress',
        startedAt: new Date(Date.now() - 3600000),
      });
      routes.push(route);
    }

    // 7. Seed 14 Days of Historical Pickups (120+ pickups)
    console.log('[Seed] Generating 14 days of realistic pickup requests...');
    const wasteTypes = ['wet', 'dry', 'recyclable', 'e-waste', 'hazardous'];
    const slots = ['07:00 - 09:00', '09:00 - 11:00', '11:00 - 13:00', '15:00 - 17:00'];
    const ledgerEntries = [];

    for (let day = 14; day >= 0; day--) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - day);

      const pickupsForDay = day === 0 ? 12 : 8 + (day % 5);

      for (let p = 0; p < pickupsForDay; p++) {
        const citizen = citizens[(day * 4 + p) % citizens.length];
        const ward = insertedWards[(day + p) % insertedWards.length];
        const worker = workers[(day + p) % workers.length];
        const vehicle = vehicles[(day + p) % vehicles.length];
        const wasteType = wasteTypes[(day + p * 2) % wasteTypes.length];
        const slot = slots[p % slots.length];

        const center = ward.center.coordinates;
        const coords = [
          center[0] + (Math.random() - 0.5) * 0.012,
          center[1] + (Math.random() - 0.5) * 0.012,
        ];

        // Distribution of status: historical are mostly verified or collected, recent days have pending/assigned
        let status = 'verified';
        let segregation = 'correct';
        let points = 20;

        if (day === 0) {
          if (p === 0) status = 'pending';
          else if (p === 1) status = 'assigned';
          else if (p === 2) status = 'on_the_way';
          else if (p < 6) status = 'collected';
          else status = 'verified';
        } else if (day === 1 && p % 7 === 0) {
          status = 'missed';
          segregation = null;
          points = 0;
        } else {
          // Segregation distribution: 70% correct (+20), 22% partial (+10), 8% none (0)
          const roll = (day * 7 + p * 3) % 100;
          if (roll < 70) {
            segregation = 'correct';
            points = ECO_RULES.POINTS.CORRECT_SEGREGATION;
          } else if (roll < 92) {
            segregation = 'partial';
            points = ECO_RULES.POINTS.PARTIAL_SEGREGATION;
          } else {
            segregation = 'none';
            points = ECO_RULES.POINTS.NO_SEGREGATION;
          }
        }

        const createdAt = new Date(dayDate);
        createdAt.setHours(7 + (p % 8), Math.floor(Math.random() * 60));

        const pickup = await PickupRequest.create({
          citizen: citizen._id,
          ward: ward._id,
          wasteType,
          address: `${citizen.address}`,
          location: {
            type: 'Point',
            coordinates: coords,
          },
          slot,
          status,
          assignedWorker: status !== 'pending' ? worker._id : null,
          assignedVehicle: status !== 'pending' ? vehicle._id : null,
          route: routes[0]._id,
          collectedAt: ['collected', 'verified'].includes(status) ? new Date(createdAt.getTime() + 7200000) : null,
          verifiedAt: status === 'verified' ? new Date(createdAt.getTime() + 9000000) : null,
          segregation: status === 'verified' ? segregation : null,
          pointsAwarded: status === 'verified' ? points : 0,
          rating: status === 'verified' && p % 2 === 0 ? 4 + (p % 2) : null,
          feedback: status === 'verified' && p % 2 === 0 ? 'Punctual door-to-door pickup by BMC truck. Driver was polite.' : '',
          createdAt,
        });

        // Add ledger transaction if points awarded
        if (status === 'verified' && points > 0) {
          ledgerEntries.push({
            user: citizen._id,
            type: 'earn',
            amount: points,
            reason: segregation === 'correct'
              ? 'Verified 100% Correct Waste Segregation'
              : 'Verified Partial Waste Segregation',
            refModel: 'PickupRequest',
            refId: pickup._id,
            balanceAfter: citizen.ecoBalance,
            createdAt: pickup.verifiedAt,
          });
        }
      }
    }

    if (ledgerEntries.length > 0) {
      await EcoPointTransaction.insertMany(ledgerEntries);
    }

    // 8. Seed 25 Dump Reports across Bhopal
    console.log('[Seed] Creating 25 geo-tagged illegal dump reports...');
    const dumpDescriptions = [
      'Construction debris and plastic bags dumped beside service road',
      'Overflowing community bin spilling onto pedestrian footpath',
      'Hazardous medical and electronic waste discarded near storm drain',
      'Unattended commercial packaging cardboard and thermocol waste',
      'Mixed vegetable market organic waste causing foul odor',
      'Discarded tires and plastic bottles accumulating stagnant water'
    ];

    for (let d = 0; d < 25; d++) {
      const ward = insertedWards[d % insertedWards.length];
      const reporter = citizens[d % citizens.length];
      const worker = workers[d % workers.length];
      const center = ward.center.coordinates;

      const coords = [
        center[0] + (Math.random() - 0.5) * 0.014,
        center[1] + (Math.random() - 0.5) * 0.014,
      ];

      // 10 cleared, 7 assigned, 8 open
      let status = 'open';
      let clearedAt = null;
      let photoAfter = '';

      if (d < 10) {
        status = 'cleared';
        clearedAt = new Date(Date.now() - (d + 1) * 86400000);
        photoAfter = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';
      } else if (d < 17) {
        status = 'assigned';
      }

      await DumpReport.create({
        reporter: reporter._id,
        ward: ward._id,
        location: {
          type: 'Point',
          coordinates: coords,
        },
        address: `Near Landmark #${d + 1}, ${ward.name}, Bhopal`,
        photoBefore: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80',
        photoAfter,
        description: dumpDescriptions[d % dumpDescriptions.length],
        severity: d % 3 === 0 ? 'high' : d % 3 === 1 ? 'medium' : 'low',
        status,
        assignedWorker: status !== 'open' ? worker._id : null,
        clearedAt,
        bonusPointsCredited: status === 'cleared',
        workerNotes: status === 'cleared' ? 'Cleared with JCB compactor. Disinfected with bleaching powder.' : '',
        createdAt: new Date(Date.now() - (d + 2) * 86400000),
      });
    }

    // 9. Seed Rewards Catalog
    console.log('[Seed] Inserting 8 rewards items...');
    await Reward.insertMany(rewardsData);

    // 10. Seed Announcements
    console.log('[Seed] Inserting civic announcements...');
    await Announcement.insertMany([
      {
        title: '🌧️ Monsoon Waste Management & Drain Clearance Advisory',
        body: 'Citizens are requested to avoid throwing non-biodegradable plastics in roadside storm drains. Special wet waste collection trucks operate daily from 07:00 AM.',
        ward: null, // city wide
        createdBy: adminUser._id,
        priority: 'urgent',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        title: '🔋 Special E-Waste Drive in Arera Colony & MP Nagar This Saturday',
        body: 'Dispose of obsolete batteries, cables, and electronic gadgets at your doorstep collection truck for double eco-points (+40 pts)!',
        ward: insertedWards[0]._id,
        createdBy: adminUser._id,
        priority: 'normal',
        createdAt: new Date(Date.now() - 172800000),
      },
      {
        title: '🏆 Swachh Survekshan 2026: Bhopal Citizen Segregation Drive',
        body: 'Bhopal ranked 5th in Swachh Survekshan. Let us target Rank 1 this year by achieving 100% source segregation of wet and dry waste!',
        ward: null,
        createdBy: adminUser._id,
        priority: 'normal',
        createdAt: new Date(Date.now() - 345600000),
      },
    ]);

    // 11. Seed Worker Issue Reports
    console.log('[Seed] Inserting worker issue reports...');
    await IssueReport.insertMany([
      {
        worker: workers[0]._id,
        vehicle: vehicles[0]._id,
        ward: insertedWards[0]._id,
        type: 'blocked_access',
        description: 'Road repair digging on Sector 2 inner lane blocking collection truck entry.',
        status: 'open',
      },
      {
        worker: workers[1]._id,
        vehicle: vehicles[1]._id,
        ward: insertedWards[1]._id,
        type: 'overflowing_bin',
        description: 'Commercial market secondary bin overflowing before scheduled evening clearance.',
        status: 'investigating',
      },
    ]);

    console.log('\n=============================================================');
    console.log('       🌿 KACHRA BAZAR SEED COMPLETED SUCCESSFULLY! 🌿');
    console.log('=============================================================');
    console.log('📍 Pilot City: Bhopal Municipal Corporation (8 Wards Seeded)');
    console.log('👥 Accounts created: 1 Admin, 8 Workers, 60 Citizens');
    console.log('🚚 12 Municipal vehicles, 6 Live Routes, 120+ Pickup Requests');
    console.log('🗺️ 25 Geo-tagged Dump Hotspots, 8 Green Rewards, Announcements');
    console.log('-------------------------------------------------------------');
    console.log('🔑 DEMO LOGIN CREDENTIALS (All passwords: "Demo@1234"):');
    console.log('   👑 ADMIN:    admin@kachrabazar.in    (Role: admin)');
    console.log('   👷 WORKER:   worker1@kachrabazar.in  (Role: worker, MP Nagar)');
    console.log('   🏡 CITIZEN:  citizen@kachrabazar.in (Role: citizen)');
    console.log('-------------------------------------------------------------');
    console.log('🎓 Team: Sourabh Patel, Vishal Dhakad, Rehman Khan, Zeeshan Ashraf');
    console.log('🏛️ Institute: SIRTE, Sagar Group of Institutions, Bhopal');
    console.log('=============================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seedDatabase();
