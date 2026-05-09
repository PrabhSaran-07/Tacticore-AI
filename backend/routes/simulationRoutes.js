const express = require('express');
const { startSimulation, getSession } = require('../controllers/simulationController');

const router = express.Router();

router.post('/start', startSimulation);
router.get('/:sessionId', getSession);

module.exports = router;
