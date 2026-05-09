import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--dark) 0%, var(--darker) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.875rem' }}>T</span>
          </div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>Planning AI</h1>
          <p style={{ color: 'var(--primary)' }}>GPE Planning Platform</p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-300)',
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="candidate@planningai.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--gray-800)',
                  border: '1px solid var(--gray-700)',
                  borderRadius: '0.5rem',
                  color: 'var(--gray-100)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-300)',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--gray-800)',
                  border: '1px solid var(--gray-700)',
                  borderRadius: '0.5rem',
                  color: 'var(--gray-100)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                required
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.875rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--gray-400)',
                cursor: 'pointer'
              }}>
                <input type="checkbox" style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '0.25rem'
                }} />
                Remember me
              </label>
              <a href="#" style={{
                color: 'var(--primary)',
                textDecoration: 'none'
              }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--gray-800)',
          borderRadius: '0.5rem',
          border: '1px solid var(--gray-700)'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--gray-300)',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>Demo Credentials:</p>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--gray-400)'
          }}>Email: demo@tacticore.ai</p>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--gray-400)'
          }}>Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
