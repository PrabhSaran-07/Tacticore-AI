import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const getToken = () => sessionStorage.getItem('token');

export default function Dashboard({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API}/api/sessions/my-sessions`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        if (response.ok) setSessions(data.sessions || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>
          Instructor Dashboard
        </h1>
        <p style={{ color: 'var(--gray-400)' }}>Welcome back, {user?.name || 'Instructor'}!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>{loading ? '-' : sessions.length}</div>
          <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Sessions Created</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>14</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>OLQs Analyzed</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>100%</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>System Health</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <Link to="/accessor" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>Instructor Portal</h3>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>Manage sessions and review cadet submissions.</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>Access</button>
        </Link>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Recent Sessions</h2>
        {loading ? (
          <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>Loading...</p>
        ) : sessions.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>No sessions created yet.</p>
        ) : (
          <div className="space-y-4">
            {sessions.slice(0, 5).map((s, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem',
                background: 'var(--gray-800)', borderRadius: '0.5rem', border: '1px solid var(--gray-700)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>👨‍🏫</div>
                  <div>
                    <p style={{ color: 'var(--gray-100)', fontWeight: '600' }}>
                      {s.title || `Session ${s.sessionCode}`}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      Code: {s.sessionCode} | {s.participants?.length || 0} cadets | {s.phase}
                    </p>
                  </div>
                </div>
                <span className={`badge ${s.phase === 'completed' ? 'badge-success' : s.phase === 'waiting' ? 'badge-warning' : 'badge-info'}`}>
                  {s.phase}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
