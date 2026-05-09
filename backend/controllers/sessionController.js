const Session = require('../models/Session');
const crypto = require('crypto');

// Generate unique 6-character session code
const generateSessionCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

exports.createSession = async (req, res) => {
  try {
    const { problemDescription, assignedResources, timeLimit, optimumSolution } = req.body;
    
    let sessionCode = generateSessionCode();
    let isUnique = false;
    
    // Ensure uniqueness
    while (!isUnique) {
      const existing = await Session.findOne({ sessionCode });
      if (!existing) {
        isUnique = true;
      } else {
        sessionCode = generateSessionCode();
      }
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
    const session = await Session.findOne({ sessionCode })
      .populate('accessor', 'name')
      .populate('scenario');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Add cadet to participants if not already present
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
    const sessions = await Session.find({ accessor: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('accessor', 'name')
      .populate('participants', 'name');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};
