const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('accessor'), sessionController.createSession);
router.post('/join', protect, sessionController.joinSession);
router.get('/my-sessions', protect, authorize('accessor'), sessionController.getAccessorSessions);
router.get('/my-results', protect, authorize('cadet'), sessionController.getMyResults);

router.get('/:id', protect, sessionController.getSessionById);
router.post('/:id/start', protect, authorize('accessor'), sessionController.startSession);
router.post('/:id/end', protect, authorize('accessor'), sessionController.endSession);
router.get('/:id/participants', protect, sessionController.getSessionParticipants);
router.post('/:id/submit', protect, authorize('cadet'), sessionController.submitAnswer);
router.get('/:id/submissions', protect, authorize('accessor'), sessionController.getSubmissions);
router.get('/:id/replay', protect, authorize('accessor'), sessionController.getSessionReplay);
router.delete('/:id', protect, authorize('accessor'), sessionController.deleteSession);

module.exports = router;
