const Session = require('../models/Session');
const mockDb = require('../services/mockDatabase');

exports.startSimulation = async (req, res) => {
  try {
    const { scenarioId, participants } = req.body;
    
    const newSession = {
      _id: String(mockDb.sessions.length + 1),
      scenario: scenarioId,
      participants: participants || [],
      status: 'active',
      timeline: [],
      createdAt: new Date()
    };
    
    mockDb.sessions.push(newSession);
    res.status(200).json({ message: 'Simulation started', session: newSession });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start simulation' });
  }
};

exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = mockDb.sessions.find(s => s._id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};
