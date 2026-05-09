import { io } from 'socket.io-client';

// Use environment variable or default to localhost:5000 for backend
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

export default socket;
