import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'cadet';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/simulation', label: 'Planning Room', icon: '📝' },
    { 
      path: role === 'accessor' ? '/accessor' : '/cadet', 
      label: role === 'accessor' ? 'Accessor' : 'Cadet Portal', 
      icon: '👨‍🏫' 
    },
    { path: '/results', label: 'Results', icon: '📈' },
  ];

  return (
    <nav style={{
      background: 'linear-gradient(135deg, var(--dark) 0%, var(--darker) 100%)',
      borderBottom: '1px solid var(--gray-800)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '4rem'
        }}>
          {/* Logo */}
          <Link to="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>T</span>
            </div>
            <div style={{ display: 'none' }} className="sm:block">
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.125rem'
              }}>Planning AI</h1>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--primary)'
              }}>Group Coordination</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem'
          }} className="md:flex">
            {navItems.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'none', textAlign: 'right' }} className="sm:block">
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-100)'
              }}>{role.charAt(0).toUpperCase() + role.slice(1)}</p>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--gray-400)'
              }}>Active</p>
            </div>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>👤</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'block',
              color: 'var(--gray-300)',
              padding: '0.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
            className="md:hidden"
          >
            <span style={{ fontSize: '1.5rem' }}>☰</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div style={{
            paddingBottom: '1rem',
            borderTop: '1px solid var(--gray-800)',
            marginTop: '1rem',
            display: 'block'
          }} className="md:hidden">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navItems.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link ${isActive(path) ? 'active' : ''}`}
                  style={{
                    textAlign: 'center',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
