import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';
import { initSocket } from './services/socket.js';
import { startVehicleSimulator } from './services/vehicleSimulator.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import wardRoutes from './routes/wardRoutes.js';
import pickupRoutes from './routes/pickupRoutes.js';
import dumpRoutes from './routes/dumpRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import pointRoutes from './routes/pointRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security and utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows OSM map tiles and Unsplash images
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL || 'http://localhost:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev permissive for localhost variants
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded static files
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kachra Bazar API is running smoothly',
    timestamp: new Date().toISOString(),
    service: 'Municipal Waste Management Engine - Bhopal',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/dumps', dumpRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/uploads', uploadRoutes);

// Catch 404 & Central Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server if not running inside Jest test
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    // Start background live vehicle simulator
    startVehicleSimulator();

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` 🚀 Kachra Bazar Backend Server running on port ${PORT}`);
      console.log(` 📍 Pilot City: Bhopal Municipal Corporation (BMC)`);
      console.log(` 🌿 Student Team: Sourabh Patel, Vishal Dhakad, Rehman Khan, Zeeshan Ashraf`);
      console.log(` 🎓 Institute: SIRTE, Sagar Group of Institutions, Bhopal`);
      console.log(`=======================================================`);
    });
  }).catch((err) => {
    console.error('Fatal Database Connection Failure:', err);
  });
}

export { app, server };
export default app;
