const express = require('express');
const { login, cadetJoin, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/cadet-join', cadetJoin);
router.get('/me', protect, me);

module.exports = router;
