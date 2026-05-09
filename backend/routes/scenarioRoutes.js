const express = require('express');
const { createScenario, getScenarios } = require('../controllers/scenarioController');

const router = express.Router();

router.post('/', createScenario);
router.get('/', getScenarios);

module.exports = router;
