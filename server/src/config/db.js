import mongoose from 'mongoose';
import Ward from '../models/Ward.js';
import User from '../models/User.js';
import Reward from '../models/Reward.js';

let memoryServer = null;

// Initial Bhopal wards, demo users, and rewards seed helper if database is fresh/empty
const ensureDefaultData = async () => {
  try {
    let firstWard = null;
    const wardCount = await Ward.countDocuments();
    if (wardCount === 0) {
      console.log('[Database] No wards detected. Seeding 8 Bhopal Wards automatically...');
      const defaultWards = [
        { name: 'Ward 10 - MP Nagar Zone 1', code: 'W-010', city: 'Bhopal', population: 38500, center: { type: 'Point', coordinates: [77.4326, 23.2332] } },
        { name: 'Ward 24 - Arera Colony E-3', code: 'W-024', city: 'Bhopal', population: 42000, center: { type: 'Point', coordinates: [77.4285, 23.2185] } },
        { name: 'Ward 45 - Kolar Road Main', code: 'W-045', city: 'Bhopal', population: 55000, center: { type: 'Point', coordinates: [77.4195, 23.1895] } },
        { name: 'Ward 32 - TT Nagar New Market', code: 'W-032', city: 'Bhopal', population: 36000, center: { type: 'Point', coordinates: [77.3995, 23.2385] } },
        { name: 'Ward 15 - Shahpura Lake View', code: 'W-015', city: 'Bhopal', population: 31000, center: { type: 'Point', coordinates: [77.4265, 23.1995] } },
        { name: 'Ward 08 - Old City Chowk', code: 'W-008', city: 'Bhopal', population: 62000, center: { type: 'Point', coordinates: [77.4015, 23.2625] } },
        { name: 'Ward 52 - Hoshangabad Road', code: 'W-052', city: 'Bhopal', population: 48000, center: { type: 'Point', coordinates: [77.4585, 23.1855] } },
        { name: 'Ward 61 - Ayodhya Bypass', code: 'W-061', city: 'Bhopal', population: 44000, center: { type: 'Point', coordinates: [77.4695, 23.2725] } },
      ];
      const inserted = await Ward.insertMany(defaultWards);
      firstWard = inserted[0];
      console.log('[Database] 8 Bhopal Wards seeded successfully.');
    } else {
      firstWard = await Ward.findOne();
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] No users detected. Seeding core demo accounts (Admin, Worker, Citizen)...');
      const hash = await User.hashPassword('Demo@1234');
      await User.insertMany([
        {
          name: 'Dr. Rakesh Swaroop (BMC Sanitation Chief)',
          email: 'admin@kachrabazar.in',
          phone: '+91 98260 12345',
          passwordHash: hash,
          role: 'admin',
          ward: firstWard?._id,
          address: 'Bhopal Municipal Corporation HQ, Mata Mandir, Bhopal',
          isActive: true,
        },
        {
          name: 'Mukesh Kumar Dhakad',
          email: 'worker1@kachrabazar.in',
          phone: '+91 98261 00001',
          passwordHash: hash,
          role: 'worker',
          ward: firstWard?._id,
          address: 'Ward W-010 Sanitation Depot, Bhopal',
          isActive: true,
        },
        {
          name: 'Aarav Sharma',
          email: 'citizen@kachrabazar.in',
          phone: '+91 98765 43210',
          passwordHash: hash,
          role: 'citizen',
          ward: firstWard?._id,
          address: 'House #42, Sector A, MP Nagar, Bhopal',
          ecoBalance: 250,
          lifetimePoints: 500,
          streakCount: 5,
          isActive: true,
        },
      ]);
      console.log('[Database] Demo accounts created successfully.');
    }

    const rewardCount = await Reward.countDocuments();
    if (rewardCount === 0) {
      console.log('[Database] No rewards detected. Seeding initial rewards catalog...');
      await Reward.insertMany([
        {
          title: '₹100 Bhopal Metro Rail Smart Card Top-up',
          description: 'Recharge coupon for Bhopal Metro rapid transit travel card.',
          category: 'vouchers',
          pointsCost: 100,
          stock: 50,
          partnerName: 'MP Metro Rail Corporation Ltd. (MPMRCL)',
          terms: 'Valid on Orange & Blue line corridors across Bhopal.',
        },
        {
          title: '₹200 Electricity Bill Rebate (MPEZ)',
          description: 'Direct rebate on monthly domestic residential electricity consumption.',
          category: 'utilities',
          pointsCost: 200,
          stock: 40,
          partnerName: 'MP Madhya Kshetra Vidyut Vitaran Co. Ltd.',
          terms: 'Valid on residential domestic connections within Bhopal limits.',
        },
      ]);
      console.log('[Database] Initial rewards seeded successfully.');
    }
  } catch (err) {
    console.warn('[Database] Initial data seed check skipped:', err.message);
  }
};

export const connectDB = async () => {
  let primaryUri = process.env.MONGODB_URI;

  // Safeguard: Check if primaryUri has unfilled placeholders like <db_username> or <...>
  const hasPlaceholders = primaryUri && (primaryUri.includes('<') || primaryUri.includes('>'));
  if (hasPlaceholders) {
    console.warn(`[Database] MONGODB_URI contains unreplaced placeholder brackets (<...>). Falling back to local MongoDB.`);
    primaryUri = 'mongodb://127.0.0.1:27017/kachra_bazar';
  }

  const fallbackLocalUri = 'mongodb://127.0.0.1:27017/kachra_bazar';
  const targetUri = primaryUri || fallbackLocalUri;

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    await ensureDefaultData();
    return conn;
  } catch (err) {
    console.warn(`[Database] Connection to ${targetUri} failed: ${err.message}`);

    // If targetUri wasn't local, try local MongoDB before in-memory
    if (targetUri !== fallbackLocalUri) {
      try {
        console.log(`[Database] Attempting fallback to local MongoDB (${fallbackLocalUri})...`);
        const localConn = await mongoose.connect(fallbackLocalUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[Database] Local MongoDB connected successfully: ${localConn.connection.host}/${localConn.connection.name}`);
        await ensureDefaultData();
        return localConn;
      } catch (localErr) {
        console.warn(`[Database] Local MongoDB unavailable (${localErr.message}).`);
      }
    }

    // Ultimate fallback: Automated In-Memory MongoDB Server
    console.log('[Database] Initializing automated embedded MongoDB instance...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'kachra_bazar',
        },
      });
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Embedded MongoDB initialized & connected at: ${memoryUri}`);
      await ensureDefaultData();
      return conn;
    } catch (fallbackErr) {
      console.error('[Database] Failed to start embedded MongoDB fallback:', fallbackErr.message);
      throw fallbackErr;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
