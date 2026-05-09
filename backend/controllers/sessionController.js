const Session = require('../models/Session');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mockDb = require('../services/mockDatabase');

// Helper to determine if we are in mock mode
const isMockMode = () => mongoose.connection.readyState !== 1;

// Generate unique 6-character session code
const generateSessionCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

exports.createSession = async (req, res) => {
  try {
    const { problemDescription, assignedResources, timeLimit, optimumSolution } = req.body;
    let sessionCode = generateSessionCode();

    if (isMockMode()) {
      const accessorUser = mockDb.users.find(u => u._id === req.user.id);
      const session = {
        _id: String(mockDb.sessions.length + 1),
        sessionCode,
        accessor: { _id: req.user.id, name: accessorUser?.name || 'Accessor' },
        problemDescription,
        assignedResources,
        timeLimit,
        optimumSolution,
        status: 'waiting',
        participants: [],
        createdAt: new Date()
      };
      mockDb.sessions.push(session);
      return res.status(201).json({ session });
    }

    // MongoDB Mode
    let isUnique = false;
    while (!isUnique) {
      const existing = await Session.findOne({ sessionCode });
      if (!existing) isUnique = true;
      else sessionCode = generateSessionCode();
    }

    const session = new Session({
      sessionCode,
      accessor: req.user.id,
      problemDescription,
      assignedResources,
      timeLimit,
      optimumSolution,
      status: 'waiting'
    });

    await session.save();
    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
};

exports.joinSession = async (req, res) => {
  try {
    const { sessionCode } = req.body;
    
    if (isMockMode()) {
      const session = mockDb.sessions.find(s => s.sessionCode === sessionCode.toUpperCase());
      if (!session) return res.status(404).json({ message: 'Session not found' });
      
      if (!session.participants.includes(req.user.id)) {
        session.participants.push(req.user.id);
      }
      return res.status(200).json({ session });
    }

    // MongoDB Mode
    const session = await Session.findOne({ sessionCode: sessionCode.toUpperCase() })
      .populate('accessor', 'name')
      .populate('scenario');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (!session.participants.includes(req.user.id)) {
      session.participants.push(req.user.id);
      await session.save();
    }

    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error joining session', error: error.message });
  }
};

exports.getAccessorSessions = async (req, res) => {
  try {
    if (isMockMode()) {
      const sessions = mockDb.sessions.filter(s => s.accessor._id === req.user.id);
      return res.status(200).json({ sessions });
    }
    const sessions = await Session.find({ accessor: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    if (isMockMode()) {
      const session = mockDb.sessions.find(s => s._id === req.params.id);
      if (!session) return res.status(404).json({ message: 'Session not found' });
      return res.status(200).json({ session });
    }
    const session = await Session.findById(req.params.id)
      .populate('accessor', 'name')
      .populate('participants', 'name');
    
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { markers, paths, note } = req.body;
    const cadetUser = isMockMode()
      ? mockDb.users.find(u => u._id === req.user.id)
      : null;

    const submission = {
      cadet: req.user.id,
      cadetName: cadetUser?.name || req.user.name || 'Cadet',
      submittedAt: new Date(),
      mapState: { markers: markers || [], paths: paths || [] },
      note: note || ''
    };

    if (isMockMode()) {
      const session = mockDb.sessions.find(s => s._id === req.params.id);
      if (!session) return res.status(404).json({ message: 'Session not found' });
      if (!session.submissions) session.submissions = [];
      // Replace existing submission from this cadet if any
      session.submissions = session.submissions.filter(s => s.cadet !== req.user.id);
      session.submissions.push(submission);
      return res.status(200).json({ message: 'Answer submitted successfully!', submission });
    }

    // MongoDB mode
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { $pull: { submissions: { cadet: req.user.id } } },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });

    await Session.findByIdAndUpdate(
      req.params.id,
      { $push: { submissions: submission } }
    );
    res.status(200).json({ message: 'Answer submitted successfully!', submission });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting answer', error: error.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    if (isMockMode()) {
      const session = mockDb.sessions.find(s => s._id === req.params.id);
      if (!session) return res.status(404).json({ message: 'Session not found' });
      return res.status(200).json({ submissions: session.submissions || [] });
    }
    const session = await Session.findById(req.params.id).populate('submissions.cadet', 'name');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ submissions: session.submissions || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};
