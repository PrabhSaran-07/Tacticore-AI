import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'cadet';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const endpoint = role === 'accessor' 
          ? 'http://localhost:5000/api/sessions/my-sessions'
          : 'http://localhost:5000/api/sessions/my-results';
          
        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setSessions(role === 'accessor' ? data.sessions : data.results);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100 mb-2">Planning Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user.name || 'User'}! Here is your current overview.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>{loading ? '-' : sessions.length}</div>
          <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {role === 'accessor' ? 'Active Sessions' : 'Simulations Completed'}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>15</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>OLQs Analyzed</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>100%</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>System Health</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {role === 'cadet' && (
          <>
            <Link to="/cadet" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>Join Exercise</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>Enter a session code to start a scenario.</p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Launch</button>
            </Link>

            <Link to="/results" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>View Analytics</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>Review your AI-generated OLQ reports.</p>
              <button className="btn btn-secondary" style={{ width: '100%' }}>View</button>
            </Link>
          </>
        )}

        {role === 'accessor' && (
          <Link to="/accessor" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>Accessor Portal</h3>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>Manage sessions and review cadet submissions.</p>
            <button className="btn btn-primary" style={{ width: '100%' }}>Access</button>
          </Link>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Recent Activity</h2>
        {loading ? (
          <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>Loading activity...</p>
        ) : sessions.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>No recent activity to display.</p>
        ) : (
          <div className="space-y-4">
            {sessions.slice(0, 5).map((s, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem',
                background: 'var(--gray-800)', borderRadius: '0.5rem', border: '1px solid var(--gray-700)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>{role === 'accessor' ? '👨‍🏫' : '📝'}</div>
                  <div>
                    <p style={{ color: 'var(--gray-100)', fontWeight: '600' }}>
                      {role === 'accessor' ? `Session Created: ${s.sessionCode}` : `Scenario Completed: ${s.sessionCode}`}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {role === 'accessor' ? s.problemDescription?.substring(0, 50) : s.problemDescription?.substring(0, 50)}...
                    </p>
                  </div>
                </div>
                <span className="badge badge-success">✓ {role === 'accessor' ? 'Active' : 'Analyzed'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
