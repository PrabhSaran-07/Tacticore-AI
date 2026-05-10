const Session = require('../models/Session');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // ── Join session room ──
    socket.on('joinRoom', (data) => {
      const roomId = typeof data === 'string' ? data : data.roomId;
      const chestNo = typeof data === 'object' ? data.chestNo : null;
      const userName = typeof data === 'object' ? data.userName : null;

      socket.join(roomId);
      socket.roomId = roomId;
      socket.chestNo = chestNo;
      socket.userName = userName;

      // Notify others
      socket.to(roomId).emit('userJoined', {
        socketId: socket.id,
        chestNo,
        userName
      });

      // Send current participant count
      const room = io.sockets.adapter.rooms.get(roomId);
      io.to(roomId).emit('participantCount', {
        count: room ? room.size : 0
      });
    });

    // ── Chat message ──
    socket.on('message', async (message) => {
      io.to(message.roomId).emit('message', message);

      // Record to behavioral log
      try {
        await Session.findByIdAndUpdate(message.roomId, {
          $push: {
            behavioralLog: {
              cadetId: message.userId,
              cadetName: message.chestNo ? `${message.chestNo} - ${message.sender}` : message.sender,
              type: 'chat_message',
              timestamp: new Date(),
              phase: message.phase || 'group_discussion',
              data: {
                text: message.message,
                chestNo: message.chestNo,
                wordCount: message.message ? message.message.split(/\s+/).length : 0
              }
            }
          }
        });
      } catch (err) {
        // Non-critical, don't break chat
      }
    });

    // ── Map marker added ──
    socket.on('mapUpdate', async (data) => {
      socket.to(data.roomId).emit('mapUpdate', data);

      // Record to behavioral log
      if (data.type === 'marker' || data.type === 'path') {
        try {
          await Session.findByIdAndUpdate(data.roomId, {
            $push: {
              behavioralLog: {
                cadetId: data.userId,
                cadetName: data.chestNo ? `${data.chestNo}` : 'Unknown',
                type: data.type === 'marker' ? 'board_add' : 'board_add',
                timestamp: new Date(),
                phase: data.phase || 'group_discussion',
                data: {
                  chestNo: data.chestNo,
                  objectType: data.type,
                  marker: data.marker,
                  path: data.path
                }
              }
            }
          });
        } catch (err) {
          // Non-critical
        }
      }
    });

    // ── Path drawing ──
    socket.on('drawPath', (data) => {
      socket.to(data.roomId).emit('drawPath', data);
    });

    // ── Simulation play/pause ──
    socket.on('simulationStateChange', (data) => {
      socket.to(data.roomId).emit('simulationStateChange', data);
    });

    // ── Session phase change (accessor controls) ──
    socket.on('sessionPhaseChange', (data) => {
      io.to(data.roomId).emit('sessionPhaseChange', data);
    });

    // ── Session ended by accessor ──
    socket.on('endSession', (data) => {
      io.to(data.roomId).emit('sessionEnded', {
        message: 'Session has been ended by the Instructor.',
        endedAt: new Date()
      });
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      if (socket.roomId) {
        socket.to(socket.roomId).emit('userLeft', {
          socketId: socket.id,
          chestNo: socket.chestNo
        });

        // Update participant count
        const room = io.sockets.adapter.rooms.get(socket.roomId);
        io.to(socket.roomId).emit('participantCount', {
          count: room ? room.size : 0
        });
      }
    });
  });
};
