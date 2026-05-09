import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SimulationRoom from './pages/SimulationRoom';
import AccessorPortal from './pages/AccessorPortal';
import CadetPortal from './pages/CadetPortal';
import ResultsPage from './pages/ResultsPage';

const getSafeUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : { role: '' };
  } catch {
    return { role: '' };
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(getSafeUser());

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUser(getSafeUser());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser({ role: '' });
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#050a13' }}>
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <main style={{ flex: 1, padding: isAuthenticated ? '2rem' : '0', maxWidth: isAuthenticated ? '1400px' : '100%', margin: '0 auto', width: '100%' }}>
          <Routes>
            {/* Login - always accessible, redirects if already logged in */}
            <Route
              path="/"
              element={
                isAuthenticated
                  ? <Navigate to={user.role === 'accessor' ? '/accessor' : '/cadet'} replace />
                  : <Login onLogin={handleLogin} />
              }
            />

            {/* Shared authenticated routes */}
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} />
            <Route path="/simulation" element={isAuthenticated ? <SimulationRoom /> : <Navigate to="/" replace />} />
            <Route path="/results" element={isAuthenticated ? <ResultsPage /> : <Navigate to="/" replace />} />

            {/* Role-specific portals */}
            <Route
              path="/accessor"
              element={isAuthenticated && user.role === 'accessor' ? <AccessorPortal /> : <Navigate to="/" replace />}
            />
            <Route
              path="/cadet"
              element={isAuthenticated && user.role === 'cadet' ? <CadetPortal /> : <Navigate to="/" replace />}
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
