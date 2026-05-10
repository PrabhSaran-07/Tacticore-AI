const Session = require('../models/Session');

// Track per-room silence timers
const cadetLastAction = {}; // { roomId: { cadetId: timestamp } }
const SILENCE_THRESHOLD_MS = 90000; // 90 seconds

function getTimestampKey(roomId, cadetId) {
  return `${roomId}::${cadetId}`;
}

module.exports = (io) => {
  // Silence detection interval
  setInterval(async () => {
    const now = Date.now();
    for (const [key, lastTime] of Object.entries(cadetLastAction)) {
      const gap = now - lastTime;
      if (gap > SILENCE_THRESHOLD_MS && gap < SILENCE_THRESHOLD_MS + 15000) {
        const [roomId, cadetId] = key.split('::');
        try {
          await Session.findByIdAndUpdate(roomId, {
            $push: { behavioralLog: { cadetId, type: 'silence_flag', timestamp: new Date(), phase: 'group_discussion', data: { durationSec: Math.round(gap / 1000) } } }
          });
        } catch (e) { /* non-critical */ }
      }
    }
  }, 15000);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // ── Join session room ──
    socket.on('joinRoom', (data) => {
      const roomId = typeof data === 'string' ? data : data.roomId;
      const chestNo = typeof data === 'object' ? data.chestNo : null;
      const userName = typeof data === 'object' ? data.userName : null;
      const userId = typeof data === 'object' ? data.userId : null;

      socket.join(roomId);
      socket.roomId = roomId;
      socket.chestNo = chestNo;
      socket.userName = userName;
      socket.userId = userId;

      socket.to(roomId).emit('userJoined', { socketId: socket.id, chestNo, userName });
      const room = io.sockets.adapter.rooms.get(roomId);
      io.to(roomId).emit('participantCount', { count: room ? room.size : 0 });

      // Record join
      if (roomId && userId) {
        Session.findByIdAndUpdate(roomId, {
          $push: { behavioralLog: { cadetId: userId, cadetName: chestNo ? `${chestNo} - ${userName}` : userName, chestNo, type: 'join', timestamp: new Date(), phase: 'waiting', data: {} } }
        }).catch(() => {});
      }
    });

    // Helper to record action time
    const recordAction = (roomId, cadetId) => {
      if (roomId && cadetId) cadetLastAction[getTimestampKey(roomId, cadetId)] = Date.now();
    };

    // Helper to check if cadet is first in phase
    const checkFirstInPhase = async (roomId, cadetId, cadetName, chestNo, phase) => {
      try {
        const session = await Session.findById(roomId).select('behavioralLog').lean();
        const phaseEvents = (session?.behavioralLog || []).filter(e => e.phase === phase && e.type !== 'join' && e.type !== 'silence_flag');
        if (phaseEvents.length === 0) {
          await Session.findByIdAndUpdate(roomId, {
            $push: { behavioralLog: { cadetId, cadetName, chestNo, type: 'phase_first_action', timestamp: new Date(), phase, data: { isFirst: true } } }
          });
        }
      } catch (e) { /* non-critical */ }
    };

    // ── Chat message ──
    socket.on('message', async (message) => {
      io.to(message.roomId).emit('message', message);
      recordAction(message.roomId, message.userId);

      const text = message.message || '';
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const hasQuestion = /\?/.test(text);
      const hasCausal = /\b(because|therefore|hence|thus|since)\b/i.test(text);
      const hasTeam = /\b(we|us|our|together|team|group)\b/i.test(text);

      try {
        await Session.findByIdAndUpdate(message.roomId, {
          $push: { behavioralLog: { cadetId: message.userId, cadetName: message.chestNo ? `${message.chestNo} - ${message.sender}` : message.sender, chestNo: message.chestNo, type: 'chat_message', timestamp: new Date(), phase: message.phase || 'group_discussion', data: { text, chestNo: message.chestNo, wordCount, hasQuestion, hasCausal, hasTeam } } }
        });
        if (message.phase) await checkFirstInPhase(message.roomId, message.userId, message.sender, message.chestNo, message.phase);
      } catch (err) { /* non-critical */ }
    });

    // ── Chat reaction ──
    socket.on('chatReaction', async (data) => {
      io.to(data.roomId).emit('chatReaction', data);
      try {
        await Session.findByIdAndUpdate(data.roomId, {
          $push: {
            chatReactions: { messageId: data.messageId, cadetId: data.userId, chestNo: data.chestNo, reaction: data.reaction },
            behavioralLog: { cadetId: data.userId, chestNo: data.chestNo, type: 'reaction', timestamp: new Date(), phase: data.phase || 'group_discussion', data: { messageId: data.messageId, reaction: data.reaction } }
          }
        });
      } catch (e) { /* non-critical */ }
    });

    // ── Raise hand ──
    socket.on('raiseHand', async (data) => {
      io.to(data.roomId).emit('raiseHand', data);
      try {
        await Session.findByIdAndUpdate(data.roomId, {
          $push: { behavioralLog: { cadetId: data.userId, chestNo: data.chestNo, type: 'raise_hand', timestamp: new Date(), phase: data.phase || 'group_discussion', data: {} } }
        });
      } catch (e) { /* non-critical */ }
    });

    // ── Map marker/path ──
    socket.on('mapUpdate', async (data) => {
      socket.to(data.roomId).emit('mapUpdate', data);
      recordAction(data.roomId, data.userId);

      if (data.type === 'marker' || data.type === 'path') {
        try {
          await Session.findByIdAndUpdate(data.roomId, {
            $push: { behavioralLog: { cadetId: data.userId, cadetName: data.chestNo || 'Unknown', chestNo: data.chestNo, type: 'board_add', timestamp: new Date(), phase: data.phase || 'group_discussion', data: { objectType: data.type, marker: data.marker, path: data.path } } }
          });
          if (data.phase) await checkFirstInPhase(data.roomId, data.userId, data.chestNo, data.chestNo, data.phase);
        } catch (err) { /* non-critical */ }
      }
    });

    // ── Proposal submit ──
    socket.on('proposalSubmit', async (data) => {
      io.to(data.roomId).emit('proposalSubmit', data);
      recordAction(data.roomId, data.userId);
      try {
        await Session.findByIdAndUpdate(data.roomId, {
          $push: { behavioralLog: { cadetId: data.userId, chestNo: data.chestNo, type: 'proposal_submit', timestamp: new Date(), phase: 'group_discussion', data: { proposalId: data.proposalId, title: data.title, priority: data.priority } } }
        });
      } catch (e) { /* non-critical */ }
    });

    // ── Proposal vote ──
    socket.on('proposalVote', async (data) => {
      io.to(data.roomId).emit('proposalVote', data);
      recordAction(data.roomId, data.userId);
      try {
        await Session.findByIdAndUpdate(data.roomId, {
          $push: { behavioralLog: { cadetId: data.userId, chestNo: data.chestNo, type: 'proposal_vote', timestamp: new Date(), phase: 'group_discussion', data: { proposalId: data.proposalId, vote: data.vote, reason: data.reason } } }
        });
      } catch (e) { /* non-critical */ }
    });

    // ── Challenge submit ──
    socket.on('challengeSubmit', async (data) => {
      io.to(data.roomId).emit('challengeSubmit', data);
      recordAction(data.roomId, data.userId);
      try {
        await Session.findByIdAndUpdate(data.roomId, {
          $push: { behavioralLog: { cadetId: data.userId, chestNo: data.chestNo, type: 'challenge_submit', timestamp: new Date(), phase: data.phase || 'group_discussion', data: { targetProposalId: data.targetProposalId, reason: data.reason } } }
        });
      } catch (e) { /* non-critical */ }
    });

    // ── Individual plan submit ──
    socket.on('individualPlanSubmit', async (data) => {
      recordAction(data.roomId, data.userId);
      try {
        await Session.findByIdAndUpdate(data.roomId, {
          $push: { behavioralLog: { cadetId: data.userId, chestNo: data.chestNo, type: 'individual_plan_submit', timestamp: new Date(), phase: 'individual_planning', data: { planSummary: data.planSummary } } }
        });
      } catch (e) { /* non-critical */ }
    });

    // ── Complication response ──
    socket.on('complicationResponse', async (data) => {
      io.to(data.roomId).emit('complicationResponse', data);
      recordAction(data.roomId, data.userId);
      try {
        await Session.findByIdAndUpdate(data.roomId, {
          $push: { behavioralLog: { cadetId: data.userId, chestNo: data.chestNo, type: 'complication_response', timestamp: new Date(), phase: data.phase || 'group_discussion', data: { responseText: data.text, latencyMs: data.latencyMs } } }
        });
      } catch (e) { /* non-critical */ }
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
      io.to(data.roomId).emit('sessionEnded', { message: 'Session has been ended by the Instructor.', endedAt: new Date() });
    });

    // ── Complication injected by instructor ──
    socket.on('injectComplication', async (data) => {
      io.to(data.roomId).emit('complicationInjected', data);
      try {
        await Session.findByIdAndUpdate(data.roomId, {
          $push: { complications: { type: data.complicationType, description: data.description, phase: data.phase, data: data.extra } }
        });
      } catch (e) { /* non-critical */ }
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      if (socket.roomId) {
        socket.to(socket.roomId).emit('userLeft', { socketId: socket.id, chestNo: socket.chestNo });
        const room = io.sockets.adapter.rooms.get(socket.roomId);
        io.to(socket.roomId).emit('participantCount', { count: room ? room.size : 0 });
      }
    });
  });
};
