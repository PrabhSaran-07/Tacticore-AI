const Scenario = require('../models/Scenario');
const mockDb = require('../services/mockDatabase');

exports.createScenario = async (req, res) => {
  try {
    const newScenario = {
      _id: String(mockDb.scenarios.length + 1),
      ...req.body,
      createdAt: new Date()
    };
    mockDb.scenarios.push(newScenario);
    res.status(201).json({ message: 'Scenario created', scenario: newScenario });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create scenario' });
  }
};

exports.getScenarios = async (req, res) => {
  try {
    res.status(200).json({ scenarios: mockDb.scenarios });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
};
