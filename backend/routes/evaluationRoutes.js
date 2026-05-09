const express = require('express');
const { evaluateSession } = require('../controllers/evaluationController');

const router = express.Router();

router.post('/', evaluateSession);

module.exports = router;
