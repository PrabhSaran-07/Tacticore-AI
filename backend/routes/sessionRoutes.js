const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('accessor'), sessionController.createSession);
router.post('/join', protect, sessionController.joinSession);
router.get('/my-sessions', protect, authorize('accessor'), sessionController.getAccessorSessions);
router.get('/:id', protect, sessionController.getSessionById);
router.post('/:id/submit', protect, authorize('cadet'), sessionController.submitAnswer);
router.get('/:id/submissions', protect, authorize('accessor'), sessionController.getSubmissions);

module.exports = router;
