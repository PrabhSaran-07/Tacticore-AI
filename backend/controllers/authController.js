const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mockDb = require('../services/mockDatabase');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = mockDb.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (mockDb.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = {
      _id: String(mockDb.users.length + 1),
      name,
      email,
      password,
      role: role || 'cadet',
      createdAt: new Date()
    };
    
    mockDb.users.push(newUser);
    const token = generateToken(newUser);
    res.status(201).json({ message: 'Registration successful', token, user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};
