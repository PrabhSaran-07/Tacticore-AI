# TactiCore AI - Getting Started

TactiCore AI is an AI-powered web-based tactical simulation platform. This is the complete project setup that runs **without MongoDB** by default.

## 🚀 Quick Start (5 minutes)

### Terminal 1 - Start Backend

```bash
cd backend
npm install
npm start
```

You'll see:
```
✅ Server running on port 5000
⚠️  No MONGO_URI provided. Running in mock mode without database.
```

### Terminal 2 - Start Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:5173`

## 📝 Test Credentials

The mock database includes:

| Email | Password | Role |
|-------|----------|------|
| `admin@tacticore.com` | any | Instructor |
| `candidate@tacticore.com` | any | Candidate |

## 📁 Project Structure

```
TactiCore AI/
├── backend/           # Express API & Socket.IO
│   ├── controllers/   # Request handlers
│   ├── models/        # MongoDB schemas (optional)
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic & AI
│   ├── sockets/       # Real-time communication
│   └── server.js      # Main server file
│
├── frontend/          # React + Vite UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│
├── ai-module/         # Python AI scoring
├── simulation-engine/ # Simulation logic
├── maps/              # Scenario data
└── docs/              # Documentation
```

## 🎮 Available Routes

After login, explore:

- **Dashboard** `/dashboard` - Plan and coordinate
- **Simulation** `/simulation` - Active mission room
- **Instructor** `/instructor` - Session monitoring
- **Results** `/results` - Performance analytics

## 💾 Using MongoDB (Optional)

To add a real database later:

1. Update `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/tacticore
```

2. Restart the backend

It will auto-detect and connect if available.

## 📚 More Information

- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)
- [Full Project Documentation](./docs/README.md)

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB (optional)
- **Maps**: Leaflet.js
- **Auth**: JWT
- **AI**: Python (scoring & analysis)
