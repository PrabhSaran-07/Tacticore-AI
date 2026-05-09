const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('accessor'), sessionController.createSession);
router.post('/join', protect, sessionController.joinSession);
router.get('/my-sessions', protect, authorize('accessor'), sessionController.getAccessorSessions);
router.get('/:id', protect, sessionController.getSessionById);

module.exports = router;
