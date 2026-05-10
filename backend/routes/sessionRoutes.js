const express = require('express');
const router = express.Router();
const sc = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// CRUD
router.post('/create', protect, authorize('accessor'), sc.createSession);
router.post('/join', protect, sc.joinSession);
router.get('/my-sessions', protect, authorize('accessor'), sc.getAccessorSessions);
router.get('/my-results', protect, authorize('cadet'), sc.getMyResults);
router.get('/:id', protect, sc.getSessionById);
router.delete('/:id', protect, authorize('accessor'), sc.deleteSession);
router.post('/:id/duplicate', protect, authorize('accessor'), sc.duplicateSession);

// Phase control
router.post('/:id/start', protect, authorize('accessor'), sc.startSession);
router.post('/:id/advance-phase', protect, authorize('accessor'), sc.advancePhase);
router.post('/:id/end', protect, authorize('accessor'), sc.endSession);

// Participants
router.get('/:id/participants', protect, sc.getSessionParticipants);

// Proposals
router.post('/:id/proposal', protect, authorize('cadet'), sc.submitProposal);
router.post('/:id/proposal/:proposalId/vote', protect, authorize('cadet'), sc.voteOnProposal);

// Challenges
router.post('/:id/challenge', protect, authorize('cadet'), sc.submitChallenge);

// Individual plan
router.post('/:id/individual-plan', protect, authorize('cadet'), sc.saveIndividualPlan);

// Submissions
router.post('/:id/submit', protect, authorize('cadet'), sc.submitAnswer);
router.get('/:id/submissions', protect, authorize('accessor'), sc.getSubmissions);

// AI Report
router.post('/:id/ai-report/generate', protect, authorize('accessor'), sc.generateAIReport);
router.get('/:id/ai-report', protect, authorize('accessor'), sc.getAIReport);

// Replay
router.get('/:id/replay', protect, authorize('accessor'), sc.getSessionReplay);

module.exports = router;
