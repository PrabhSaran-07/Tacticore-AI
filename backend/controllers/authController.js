const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, chestNo: user.chestNo || null },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '12h' }
  );
};

// ── Accessor Login (email + password) ──
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email, role: 'accessor' });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// ── Cadet Join (chestNo + name + cadetType + batch + sessionCode) ──
// Registers the cadet if new, or finds existing, then joins the session
exports.cadetJoin = async (req, res) => {
  try {
    const { chestNo, name, cadetType, batch, sessionCode } = req.body;

    if (!chestNo || !name || !cadetType || !batch || !sessionCode) {
      return res.status(400).json({ error: 'All fields are required: chestNo, name, cadetType, batch, sessionCode' });
    }

    // Find or create cadet
    let cadet = await User.findOne({ chestNo });
    if (cadet) {
      // Update name/batch/type in case they changed
      cadet.name = name;
      cadet.batch = batch;
      cadet.cadetType = cadetType;
      await cadet.save();
    } else {
      cadet = await User.create({
        chestNo,
        name,
        role: 'cadet',
        cadetType,
        batch
      });
    }

    // Find session by code
    const session = await Session.findOne({ sessionCode: sessionCode.toUpperCase() });
    if (!session) {
      return res.status(404).json({ error: 'Session not found. Check the code and try again.' });
    }

    // Check group size limit
    const maxSize = session.groupConfig?.maxSize || 10;
    if (session.participants.length >= maxSize && !session.participants.includes(cadet._id)) {
      return res.status(400).json({ error: 'Session is full.' });
    }

    // Check if session is completed
    if (session.phase === 'completed') {
      return res.status(400).json({ error: 'This session has already ended.' });
    }

    // Add cadet to participants if not already
    if (!session.participants.some(p => p.toString() === cadet._id.toString())) {
      session.participants.push(cadet._id);
      // Log join event
      session.behavioralLog.push({
        cadetId: cadet._id.toString(),
        cadetName: `${chestNo} - ${name}`,
        type: 'join',
        timestamp: new Date(),
        phase: session.phase,
        data: { chestNo, batch, cadetType }
      });
      await session.save();
    }

    const token = generateToken(cadet);
    res.status(200).json({
      message: 'Joined session successfully',
      token,
      user: { _id: cadet._id, name: cadet.name, chestNo: cadet.chestNo, batch: cadet.batch, cadetType: cadet.cadetType, role: 'cadet' },
      session: {
        _id: session._id,
        sessionCode: session.sessionCode,
        title: session.title,
        phase: session.phase,
        status: session.status
      }
    });
  } catch (error) {
    console.error('Cadet join error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
};

// ── Get current user from token ──
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
