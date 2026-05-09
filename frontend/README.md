# Frontend Setup & Running

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm start
```

The app will open at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

## Environment Configuration

The `.env` file is already configured to point to `http://localhost:5000` (backend API).

### Available Pages

- `/` - Login page
- `/dashboard` - Main dashboard with team planning
- `/simulation` - Active simulation room with map and chat
- `/instructor` - Instructor panel for session management
- `/results` - Results and evaluation analytics

### Features

- Real-time collaboration via WebSockets
- Tactical map interface with Leaflet.js
- Live team chat panel
- Resource and time management
- AI-driven evaluation dashboard

## Connecting to Backend

Make sure the backend is running on `http://localhost:5000` before starting the frontend.

```bash
# Terminal 1: Start backend
cd backend
npm install
npm start

# Terminal 2: Start frontend
cd frontend
npm install
npm start
```

The frontend will automatically connect to the backend APIs and WebSocket server.
