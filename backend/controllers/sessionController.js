const Session = require('../models/Session');
const crypto = require('crypto');

// Generate unique 6-character session code
const generateSessionCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

exports.createSession = async (req, res) => {
  try {
    const {
      title, scenarioId, problemDescription, difficulty,
      assignedResources, constraints, problems,
      timeLimit, phaseDurations,
      groupConfig, evalWeights, customRubric,
      optimumSolution
    } = req.body;

    let sessionCode = generateSessionCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Session.findOne({ sessionCode });
      if (!existing) isUnique = true;
      else sessionCode = generateSessionCode();
    }

    const session = new Session({
      sessionCode,
      accessor: req.user.id,
      title: title || '',
      scenarioId: scenarioId || 'village_fire',
      problemDescription,
      difficulty: difficulty || 'medium',
      assignedResources,
      constraints,
      problems: problems || [],
      timeLimit,
      phaseDurations,
      groupConfig,
      evalWeights,
      customRubric,
      optimumSolution,
      status: 'waiting',
      phase: 'waiting'
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
    const session = await Session.findOne({ sessionCode: sessionCode.toUpperCase() })
      .populate('accessor', 'name')
      .populate('participants', 'name chestNo batch');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (!session.participants.some(p => p._id.toString() === req.user.id)) {
      session.participants.push(req.user.id);
      await session.save();
    }

    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error joining session', error: error.message });
  }
};

// ── Start Session (Accessor only) ──
exports.startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.accessor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the session creator can start it' });
    }
    if (session.phase !== 'waiting') {
      return res.status(400).json({ message: 'Session has already been started' });
    }

    session.phase = 'group_discussion';
    session.status = 'active';
    session.startedAt = new Date();
    await session.save();

    // Broadcast to all connected clients in this session
    const io = req.app.get('io');
    if (io) {
      io.to(session._id.toString()).emit('sessionPhaseChange', {
        phase: session.phase,
        status: session.status,
        startedAt: session.startedAt
      });
    }

    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error starting session', error: error.message });
  }
};

// ── End Session (Accessor only) ──
exports.endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.accessor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the session creator can end it' });
    }

    session.phase = 'completed';
    session.status = 'completed';
    session.endedAt = new Date();
    await session.save();

    // Broadcast to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.to(session._id.toString()).emit('sessionPhaseChange', {
        phase: 'completed',
        status: 'completed',
        endedAt: session.endedAt
      });
    }

    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error ending session', error: error.message });
  }
};

// ── Get session participants ──
exports.getSessionParticipants = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('participants', 'name chestNo batch cadetType');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ participants: session.participants });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching participants', error: error.message });
  }
};

exports.getAccessorSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ accessor: req.user.id })
      .populate('participants', 'name chestNo batch')
      .sort({ createdAt: -1 });
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('accessor', 'name')
      .populate('participants', 'name chestNo batch cadetType');

    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { markers, paths, note } = req.body;
    const { analyzeSubmission } = require('../services/olqAnalyzer');

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const User = require('../models/User');
    const cadet = await User.findById(req.user.id);

    const submissionData = {
      cadet: req.user.id,
      cadetName: cadet ? `${cadet.chestNo} - ${cadet.name}` : 'Cadet',
      submittedAt: new Date(),
      mapState: { markers: markers || [], paths: paths || [] },
      note: note || ''
    };

    // Run AI OLQ Analysis
    const olqAnalysis = analyzeSubmission(submissionData, session);
    submissionData.olqAnalysis = olqAnalysis;

    // Remove old submission from this cadet, add new
    await Session.findByIdAndUpdate(
      req.params.id,
      { $pull: { submissions: { cadet: req.user.id } } }
    );
    await Session.findByIdAndUpdate(
      req.params.id,
      { $push: { submissions: submissionData } }
    );

    res.status(200).json({ message: 'Answer submitted successfully!', submission: submissionData });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting answer', error: error.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { analyzeSubmission } = require('../services/olqAnalyzer');
    const session = await Session.findById(req.params.id).populate('submissions.cadet', 'name chestNo');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Auto-analyze any submissions missing OLQ analysis
    if (session.submissions && session.submissions.length > 0) {
      let updated = false;
      session.submissions.forEach(sub => {
        if (!sub.olqAnalysis) {
          sub.olqAnalysis = analyzeSubmission(sub, session);
          updated = true;
        }
      });
      if (updated) await session.save();
    }

    res.status(200).json({ submissions: session.submissions || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const { analyzeSubmission } = require('../services/olqAnalyzer');
    const sessions = await Session.find({ 'submissions.cadet': req.user.id });

    const results = [];
    for (let session of sessions) {
      let submission = session.submissions.find(s => String(s.cadet) === String(req.user.id));
      if (!submission) continue;

      if (!submission.olqAnalysis) {
        submission.olqAnalysis = analyzeSubmission(submission, session);
        await Session.updateOne(
          { _id: session._id, 'submissions.cadet': req.user.id },
          { $set: { 'submissions.$.olqAnalysis': submission.olqAnalysis } }
        );
      }

      results.push({
        sessionId: session._id,
        sessionCode: session.sessionCode,
        problemDescription: session.problemDescription,
        submission
      });
    }

    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
};

// ── Get session replay (behavioral log) ──
exports.getSessionReplay = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).select('behavioralLog sessionCode title');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ replay: session.behavioralLog, sessionCode: session.sessionCode });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching replay', error: error.message });
  }
};
