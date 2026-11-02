import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        process.env.CLIENT_URL || 'http://localhost:5173',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
    pingTimeout: 60000,
  });

  // Optional JWT socket authentication middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.headers?.cookie
          ?.split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

      if (token) {
        const secret = process.env.JWT_SECRET || 'kachra_bazar_super_secure_jwt_secret_sirte_2026';
        const decoded = jwt.verify(token, secret);
        socket.user = decoded;
      }
      next();
    } catch (err) {
      // Continue unauthenticated for public tracking/announcements
      next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    const role = socket.user?.role;

    if (userId) {
      // Join personal room for private notifications
      socket.join(`user:${userId}`);
    }

    if (role) {
      socket.join(`role:${role}`);
    }

    // Join specific ward tracking room
    socket.on('join:ward', (wardId) => {
      if (wardId) {
        socket.join(`ward:${wardId}`);
      }
    });

    socket.on('leave:ward', (wardId) => {
      if (wardId) {
        socket.leave(`ward:${wardId}`);
      }
    });

    // Worker live GPS broadcast from browser (if enabled)
    socket.on('worker:update_location', (data) => {
      if (data?.wardId && data?.coords) {
        io.to(`ward:${data.wardId}`).emit('vehicle:location', {
          vehicleId: data.vehicleId,
          wardId: data.wardId,
          coords: data.coords,
          speed: data.speed || 25,
          timestamp: new Date(),
        });
      }
    });

    socket.on('disconnect', () => {
      // Client disconnected cleanly
    });
  });

  console.log('[Socket.io] Real-time gateway initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

export const notifyUser = (userId, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit('notification', data);
    io.to(`user:${userId}`).emit(data.type || 'message', data);
  }
};

export const broadcastToWard = (wardId, event, data) => {
  if (io && wardId) {
    io.to(`ward:${wardId}`).emit(event, data);
  }
};

export const broadcastVehicleLocation = (wardId, data) => {
  if (io) {
    if (wardId) {
      io.to(`ward:${wardId}`).emit('vehicle:location', data);
    }
    // Also emit to admin dashboard listening globally
    io.to('role:admin').emit('vehicle:location', data);
  }
};

export const broadcastAnnouncement = (announcement) => {
  if (io) {
    if (announcement.ward) {
      io.to(`ward:${announcement.ward}`).emit('announcement', announcement);
    } else {
      io.emit('announcement', announcement);
    }
  }
};

export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
