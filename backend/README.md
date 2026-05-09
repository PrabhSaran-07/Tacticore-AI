# Backend Setup & Running

## Quick Start (No MongoDB Required)

The backend is pre-configured to run without MongoDB. It uses in-memory mock data by default.

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

The server will start on `http://localhost:5000` and display:
```
✅ Server running on port 5000
⚠️  No MONGO_URI provided. Running in mock mode without database.
```

## API Endpoints Available

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user

### Scenarios
- `GET /api/scenarios` - List all scenarios
- `POST /api/scenarios` - Create a new scenario

### Simulation
- `POST /api/simulation/start` - Start a simulation session
- `GET /api/simulation/:sessionId` - Get session details

### Evaluation
- `POST /api/evaluation` - Evaluate a session

## Using MongoDB (Optional)

To use a real MongoDB database:

1. Update `.env` with your MongoDB connection:
```env
MONGO_URI=mongodb://localhost:27017/tacticore
```

2. Restart the server. It will now attempt to connect to MongoDB.

## Mock Data

The mock database includes:
- 2 sample users (admin and candidate)
- 2 sample scenarios (Village Defense, Mountain Siege)
- In-memory storage for sessions and results

Test credentials:
- Email: `admin@tacticore.com` (instructor role)
- Email: `candidate@tacticore.com` (candidate role)
