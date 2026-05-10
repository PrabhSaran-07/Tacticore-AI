require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const collaborationSocket = require('./sockets/collaborationSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Make io accessible to routes
app.set('io', io);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/sessions', sessionRoutes);

collaborationSocket(io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

// Seed the 3 SSB accessor accounts
const seedAccessors = async () => {
  const User = require('./models/User');
  const accessors = [
    { name: 'Interviewing Officer', email: 'io@gov.in', password: 'io@12345', role: 'accessor' },
    { name: 'Psychologist', email: 'psych@gov.in', password: 'psych@12345', role: 'accessor' },
    { name: 'Group Testing Officer', email: 'gto@gov.in', password: 'gto@12345', role: 'accessor' }
  ];
  for (const acc of accessors) {
    const exists = await User.findOne({ email: acc.email });
    if (!exists) {
      await User.create(acc);
      console.log(`  ✅ Seeded accessor: ${acc.email}`);
    }
  }
};

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      await seedAccessors();
      startServer();
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      console.error('   This platform requires MongoDB. Please set MONGO_URI in .env');
      process.exit(1);
    });
} else {
  console.error('❌ No MONGO_URI in environment. MongoDB is required.');
  console.error('   Add MONGO_URI to your .env file');
  process.exit(1);
}
