// Evaluation controller — uses MongoDB via Session model
const Session = require('../models/Session');
const { analyzeSubmission } = require('../services/olqAnalyzer');

exports.evaluateSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Re-analyze all submissions
    let updated = false;
    if (session.submissions) {
      session.submissions.forEach(sub => {
        sub.olqAnalysis = analyzeSubmission(sub, session);
        updated = true;
      });
    }
    if (updated) await session.save();

    res.status(200).json({ message: 'Evaluation complete', session });
  } catch (error) {
    res.status(500).json({ error: 'Evaluation failed' });
  }
};
