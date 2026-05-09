const aiEvaluation = require('../services/aiEvaluation');
const mockDb = require('../services/mockDatabase');

exports.evaluateSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = mockDb.sessions.find(s => s._id === sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const score = aiEvaluation.analyze(session);
    
    const result = {
      _id: String(mockDb.results.length + 1),
      session: sessionId,
      score: score.overallScore,
      feedback: 'Evaluation complete',
      metrics: score,
      createdAt: new Date()
    };
    
    mockDb.results.push(result);
    session.status = 'completed';
    
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Evaluation failed' });
  }
};
