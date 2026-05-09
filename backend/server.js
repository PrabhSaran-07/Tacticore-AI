require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const collaborationSocket = require('./sockets/collaborationSocket');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/evaluation', evaluationRoutes);

collaborationSocket(io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    if (MONGO_URI) {
      console.log('MongoDB URI configured. Ready to connect.');
    } else {
      console.log('⚠️  No MONGO_URI provided. Running in mock mode without database.');
    }
  });
};

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('✅ Connected to MongoDB');
      startServer();
    })
    .catch((err) => {
      console.error('⚠️  MongoDB connection failed:', err.message);
      console.log('Starting server in mock mode...');
      startServer();
    });
} else {
  console.log('No MONGO_URI in environment. Starting server in mock mode.');
  startServer();
}
