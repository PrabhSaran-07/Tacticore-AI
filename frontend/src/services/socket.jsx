import { io } from 'socket.io-client';

const socket = io(process.env.VITE_API_URL || 'http://localhost:5000', {
  transports: ['websocket']
});

export default socket;
