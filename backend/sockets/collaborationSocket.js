module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('userJoined', { socketId: socket.id });
    });

    socket.on('message', (message) => {
      io.to(message.roomId).emit('message', message);
    });

    // Handle Map Marker Updates
    socket.on('mapUpdate', (data) => {
      // broadcast to everyone in the room except the sender
      socket.to(data.roomId).emit('mapUpdate', data);
    });

    // Handle Map Path Drawing
    socket.on('drawPath', (data) => {
      socket.to(data.roomId).emit('drawPath', data);
    });

    // Handle Simulation Play/Pause State
    socket.on('simulationStateChange', (data) => {
      socket.to(data.roomId).emit('simulationStateChange', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
