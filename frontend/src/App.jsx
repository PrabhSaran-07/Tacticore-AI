import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SimulationRoom from './pages/SimulationRoom';
import InstructorPanel from './pages/InstructorPanel';
import ResultsPage from './pages/ResultsPage';

// Protected Route Component
function ProtectedRoute({ component: Component, isAuthenticated }) {
  return isAuthenticated ? Component : <Navigate to="/" />;
}

function App() {
  const [isAuthenticated] = useState(true); // Simplified for demo

  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
        
        {isAuthenticated && (
          <>
            <Navbar />
            <main className="flex-1">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/simulation" element={<SimulationRoom />} />
                  <Route path="/instructor" element={<InstructorPanel />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
