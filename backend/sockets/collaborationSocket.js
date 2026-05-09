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

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
