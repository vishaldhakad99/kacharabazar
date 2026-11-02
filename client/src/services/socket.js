import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      // Socket connected
    });

    socket.on('connect_error', () => {
      // Reconnecting silently
    });
  }
  return socket;
};

export const joinWardRoom = (wardId) => {
  const s = getSocket();
  if (s && wardId) {
    s.emit('join:ward', wardId);
  }
};

export const leaveWardRoom = (wardId) => {
  const s = getSocket();
  if (s && wardId) {
    s.emit('leave:ward', wardId);
  }
};
