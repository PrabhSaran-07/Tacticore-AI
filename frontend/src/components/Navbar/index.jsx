import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar({ onLogout, user }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const role = user?.role || 'accessor';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/simulation', label: 'Planning Room', icon: '📝' },
    { path: '/accessor', label: 'Instructor Portal', icon: '👨‍✈' },
  ];

  return (
    <nav style={{
      background: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          {/* Logo */}
          <Link to="/accessor" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem',
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid var(--primary)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)'
            }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'Rajdhani, sans-serif' }}>O</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: 0, padding: 0 }}>OpSim GPE</h1>
              <p style={{ fontSize: '0.65rem', color: 'var(--primary)', margin: 0, padding: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructor Panel</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {navItems.map(({ path, label, icon }) => (
              <Link key={path} to={path} className={`nav-link ${isActive(path) ? 'active' : ''}`}>
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Info + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-100)' }}>
                {user?.name || 'Instructor'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>
                {user?.email || ''}
              </p>
            </div>
            <div style={{
              width: '2.5rem', height: '2.5rem',
              background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>👨‍✈</span>
            </div>
            {onLogout && (
              <button onClick={onLogout} style={{
                padding: '0.4rem 0.8rem', background: 'var(--gray-700)', border: '1px solid var(--gray-600)',
                borderRadius: '0.4rem', color: 'var(--gray-300)', cursor: 'pointer', fontSize: '0.75rem'
              }}>
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
