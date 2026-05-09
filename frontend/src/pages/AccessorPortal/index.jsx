import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../../services/socket';

export default function AccessorPortal() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    problemDescription: '',
    timeLimit: 30,
    volunteers: 4,
    fireTrucks: 1,
    waterPumps: 1
  });

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemDescription: formData.problemDescription,
          timeLimit: formData.timeLimit,
          assignedResources: {
            volunteers: formData.volunteers,
            fireTrucks: formData.fireTrucks,
            waterPumps: formData.waterPumps
          }
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSessions([data.session, ...sessions]);
        setShowCreateForm(false);
        // Optionally navigate to the simulation room to draw the optimum solution
        // navigate(`/simulation?sessionId=${data.session._id}&mode=setup`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>Accessor Portal</h1>
          <p style={{ color: 'var(--gray-400)' }}>Create exercises and monitor cadet progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
          + New Exercise Session
        </button>
      </div>

      {showCreateForm && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h2 className="card-title">Create New Session</h2>
          <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="text-sm text-slate-400">Problem Description (Situation)</label>
              <textarea 
                className="input" 
                rows="4"
                value={formData.problemDescription}
                onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                placeholder="Explain the village fire scenario, train approach, etc."
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="text-sm text-slate-400">Time Limit (Minutes)</label>
                <input 
                  type="number" 
                  className="input" 
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({...formData, timeLimit: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Fire Trucks</label>
                <input 
                  type="number" 
                  className="input" 
                  value={formData.fireTrucks}
                  onChange={(e) => setFormData({...formData, fireTrucks: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Volunteers</label>
                <input 
                  type="number" 
                  className="input" 
                  value={formData.volunteers}
                  onChange={(e) => setFormData({...formData, volunteers: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Water Pumps</label>
                <input 
                  type="number" 
                  className="input" 
                  value={formData.waterPumps}
                  onChange={(e) => setFormData({...formData, waterPumps: e.target.value})}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create & Generate Code</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Active Sessions</h2>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-slate-500 italic">No active sessions. Create one to begin.</p>
          ) : (
            sessions.map(session => (
              <div key={session._id} style={{ 
                padding: '1rem', 
                background: 'var(--gray-800)', 
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--gray-700)'
              }}>
                <div>
                  <h3 style={{ color: 'var(--primary)', fontWeight: 'bold' }}>CODE: {session.sessionCode}</h3>
                  <p className="text-sm text-slate-400">{session.problemDescription.substring(0, 50)}...</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/simulation?sessionId=${session._id}`)}>
                    View Map
                  </button>
                  <button className="btn btn-sm btn-success">
                    Assign to Cadet
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
