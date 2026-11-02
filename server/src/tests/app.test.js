import request from 'supertest';
import { app } from '../server.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User, PickupRequest, EcoPointTransaction, Ward } from '../models/index.js';

describe('Kachra Bazar Full Stack API Tests', () => {
  let adminToken = '';
  let workerToken = '';
  let citizenToken = '';
  let citizenId = '';
  let sampleWardId = '';
  let samplePickupId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();

    // Fetch sample ward
    const ward = await Ward.findOne();
    if (ward) sampleWardId = ward._id.toString();

    // 1. Login Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kachrabazar.in', password: 'Demo@1234' });
    adminToken = adminRes.body.token;

    // 2. Login Worker
    const workerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'worker1@kachrabazar.in', password: 'Demo@1234' });
    workerToken = workerRes.body.token;

    // 3. Login Citizen
    const citizenRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'citizen@kachrabazar.in', password: 'Demo@1234' });
    citizenToken = citizenRes.body.token;
    citizenId = citizenRes.body.user._id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Health Check & Public Endpoints', () => {
    it('GET /api/health should return 200 OK with service info', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.service).toContain('Bhopal');
    });

    it('GET /api/wards should return Bhopal wards list without auth', async () => {
      const res = await request(app).get('/api/wards');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.wards)).toBe(true);
      expect(res.body.wards.length).toBeGreaterThan(0);
    });

    it('GET /api/dumps/public should return public anonymized hotspots', async () => {
      const res = await request(app).get('/api/dumps/public');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.dumps)).toBe(true);
    });
  });

  describe('2. Authentication & RBAC', () => {
    it('POST /api/auth/register should create a new citizen account', async () => {
      const uniqueEmail = `testcitizen_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Pooja Sharma',
          email: uniqueEmail,
          phone: '+91 98930 11223',
          password: 'Demo@1234',
          ward: sampleWardId,
          address: 'Flat 102, Green Meadows, Arera Colony, Bhopal',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('citizen');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('Citizen should be FORBIDDEN (403) from accessing Admin Analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Admin should be AUTHORIZED (200) to access Analytics Overview', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.kpis).toHaveProperty('completionRate');
    });
  });

  describe('3. Pickup Creation & Worker Segregation Verification Flow', () => {
    it('Citizen can create a waste pickup request with coordinates', async () => {
      const res = await request(app)
        .post('/api/pickups')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          wasteType: 'wet',
          address: 'E-3/45, Arera Colony, Bhopal',
          location: { coordinates: [77.4326, 23.2131] },
          slot: '07:00 - 09:00',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.pickup.status).toBe('pending');
      samplePickupId = res.body.pickup._id;
    });

    it('Worker verifies pickup segregation as "correct" and credits +20 points', async () => {
      // First get citizen balance before verification
      const userBefore = await User.findById(citizenId);
      const balanceBefore = userBefore.ecoBalance;

      const res = await request(app)
        .post(`/api/pickups/${samplePickupId}/verify`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          segregation: 'correct',
          workerNotes: 'All organic waste properly separated in green bin.',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pointsAwarded).toBe(20);
      expect(res.body.pickup.status).toBe('verified');
      expect(res.body.pickup.segregation).toBe('correct');

      // Verify user's balance increased by exactly +20
      const userAfter = await User.findById(citizenId);
      expect(userAfter.ecoBalance).toBe(balanceBefore + 20);
    });

    it('Double verification on the same pickup must be REJECTED (400)', async () => {
      const res = await request(app)
        .post(`/api/pickups/${samplePickupId}/verify`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          segregation: 'correct',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already been verified');
    });
  });

  describe('4. Eco-Points Summary & Rewards Bazar Redemption', () => {
    it('Citizen gets "Your Worth" summary with tier, kg segregated, CO2 saved', async () => {
      const res = await request(app)
        .get('/api/points/summary')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary).toHaveProperty('ecoBalance');
      expect(res.body.summary).toHaveProperty('currentTier');
      expect(res.body.summary).toHaveProperty('kgSegregated');
      expect(res.body.summary).toHaveProperty('co2SavedKg');
    });

    it('Citizen can redeem a reward when points balance is sufficient', async () => {
      // Set citizen balance to 300 to guarantee sufficient funds
      await User.findByIdAndUpdate(citizenId, { ecoBalance: 300 });

      // Find an active reward (e.g. ₹150 water rebate or ₹200 electricity)
      const catalogRes = await request(app).get('/api/rewards');
      const reward = catalogRes.body.rewards[0];

      const res = await request(app)
        .post(`/api/rewards/${reward._id}/redeem`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.redemption).toHaveProperty('code');
      expect(res.body.redemption.code).toMatch(/^KB-/);
    });
  });
});
