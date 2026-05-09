import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeSessions: 12,
    completedSimulations: 48,
    averageAccuracy: 94.2,
    systemHealth: 98.5,
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'planning', title: 'Village Fire Exercise', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'analysis', title: 'Group Evaluation', time: '4 hours ago', status: 'in-progress' },
    { id: 3, type: 'planning', title: 'Broken Bridge Exercise', time: '1 day ago', status: 'completed' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeSessions: Math.floor(Math.random() * 20) + 8,
        systemHealth: Math.min(100, prev.systemHealth + Math.random() * 2 - 0.5),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100 mb-2">Planning Dashboard</h1>
        <p className="text-slate-400">Real-time coordination and planning management</p>
      </div>

      <div className="grid-row">
        <div className="stat-box">
          <div className="stat-value">{stats.activeSessions}</div>
          <div className="stat-label">Active Sessions</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.completedSimulations}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.averageAccuracy.toFixed(1)}%</div>
          <div className="stat-label">AI Accuracy</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.systemHealth.toFixed(1)}%</div>
          <div className="stat-label">System Health</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        <Link to="/simulation" className="card" style={{
          textDecoration: 'none',
          color: 'inherit',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--gray-100)',
            marginBottom: '0.5rem'
          }}>Start Planning</h3>
          <p style={{
            color: 'var(--gray-400)',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>Launch a new GPE planning scenario</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            Launch
          </button>
        </Link>

        <Link to="/results" className="card" style={{
          textDecoration: 'none',
          color: 'inherit',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--gray-100)',
            marginBottom: '0.5rem'
          }}>View Analytics</h3>
          <p style={{
            color: 'var(--gray-400)',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>Review performance metrics and insights</p>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            View
          </button>
        </Link>

        <Link to="/instructor" className="card" style={{
          textDecoration: 'none',
          color: 'inherit',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--gray-100)',
            marginBottom: '0.5rem'
          }}>Instructor Panel</h3>
          <p style={{
            color: 'var(--gray-400)',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>Manage scenarios and student progress</p>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            Access
          </button>
        </Link>
      </div>

      <div className="card">
        <div className="card-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 className="card-title">Recent Activity</h2>
          <span style={{
            fontSize: '0.875rem',
            color: 'var(--primary)'
          }}>Live</span>
        </div>
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'var(--gray-800)',
              borderRadius: '0.5rem',
              border: '1px solid var(--gray-700)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flex: 1
              }}>
                <div style={{ fontSize: '2rem' }}>{activity.type === 'simulation' ? '🎮' : '🤖'}</div>
                <div>
                  <p style={{
                    color: 'var(--gray-100)',
                    fontWeight: '600'
                  }}>{activity.title}</p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--gray-500)'
                  }}>{activity.time}</p>
                </div>
              </div>
              <span className={`badge ${
                activity.status === 'completed' ? 'badge-success' : 'badge-info'
              }`}>
                {activity.status === 'completed' ? '✓ Completed' : '⊙ In Progress'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Status</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: 'var(--gray-300)' }}>API Connectivity</span>
                <span className="badge badge-success">✓ Online</span>
              </div>
              <div style={{
                width: '100%',
                background: 'var(--gray-700)',
                borderRadius: '9999px',
                height: '0.5rem'
              }}>
                <div style={{
                  background: 'var(--success)',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  width: '100%'
                }}></div>
              </div>
            </div>
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: 'var(--gray-300)' }}>Database</span>
                <span className="badge badge-success">✓ Connected</span>
              </div>
              <div style={{
                width: '100%',
                background: 'var(--gray-700)',
                borderRadius: '9999px',
                height: '0.5rem'
              }}>
                <div style={{
                  background: 'var(--success)',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  width: '95%'
                }}></div>
              </div>
            </div>
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: 'var(--gray-300)' }}>AI Engine</span>
                <span className="badge badge-warning">⚠ Processing</span>
              </div>
              <div style={{
                width: '100%',
                background: 'var(--gray-700)',
                borderRadius: '9999px',
                height: '0.5rem'
              }}>
                <div style={{
                  background: 'var(--warning)',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  width: '85%'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Latest Insights</h3>
          </div>
          <ul className="space-y-3">
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>💡</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                Model accuracy improved by 2.3% this week
              </p>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                Response time optimized by 40% with new algorithm
              </p>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🎯</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                New coordination patterns identified in latest scenarios
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
