import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CadetPortal() {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/sessions/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sessionCode: sessionCode.toUpperCase() })
      });
      
      const data = await response.json();
      if (response.ok) {
        navigate(`/simulation?sessionId=${data.session._id}`);
      } else {
        setError(data.message || 'Failed to join session');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh',
      gap: '2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>
          Cadet Portal
        </h1>
        <p style={{ color: 'var(--gray-400)' }}>Enter the session code provided by your Accessor</p>
      </div>

      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <form onSubmit={handleJoinSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Session Code</label>
            <input 
              type="text" 
              className="input" 
              placeholder="E.G. A1B2C3"
              style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Exercise'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '2rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
        <p>Waiting for a session? Contact your coordinator for a code.</p>
      </div>
    </div>
  );
}
