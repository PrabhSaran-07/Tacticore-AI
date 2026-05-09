import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mini SVG map that renders a cadet's submitted markers and paths
function SubmissionMap({ markers = [], paths = [] }) {
  const W = 800, H = 550;
  return (
    <div style={{ width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--gray-700)', background: '#3d6b47' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Terrain */}
        <rect x="0" y="0" width={W} height={H} fill="#3d6b47" />

        {/* Village */}
        <rect x="80" y="80" width="320" height="280" rx="8" fill="#7c6a4a" opacity="0.8" />
        <text x="240" y="72" textAnchor="middle" fill="#f3f4f6" fontSize="13" fontWeight="bold">🏘 VILLAGE</text>

        {/* Roads */}
        <rect x="0" y="195" width={W} height="18" fill="#6b7280" />
        <rect x="240" y="0" width="18" height={H} fill="#6b7280" />

        {/* Houses */}
        {[[100,100],[160,100],[220,100],[100,170],[160,170],[220,170],[100,240],[160,240],[220,240]].map(([hx,hy],i) => (
          <g key={i}>
            <rect x={hx} y={hy} width="40" height="38" rx="4" fill="#8b7355" stroke="#a0856e" strokeWidth="1.5"/>
            <polygon points={`${hx},${hy} ${hx+40},${hy} ${hx+20},${hy-16}`} fill="#6b5a3a"/>
          </g>
        ))}

        {/* Fires */}
        {[[100,100],[160,100],[100,170]].map(([fx,fy],i) => (
          <g key={i}>
            <ellipse cx={fx+20} cy={fy-5} rx="18" ry="22" fill="#ff4500" opacity="0.7"/>
            <text x={fx+20} y={fy-2} textAnchor="middle" fontSize="18">🔥</text>
          </g>
        ))}

        {/* River */}
        <path d={`M 500 0 Q 520 120 490 200 Q 460 280 510 ${H}`} stroke="#1e90ff" strokeWidth="30" fill="none" opacity="0.7" strokeLinecap="round"/>

        {/* Train track */}
        <line x1="0" y1="460" x2={W} y2="400" stroke="#374151" strokeWidth="12" strokeDasharray="20,8"/>
        <text x="640" y="450" fill="#f3f4f6" fontSize="12" fontWeight="bold">🚂 TRAIN TRACK</text>
        <ellipse cx="350" cy="440" rx="40" ry="20" fill="#ef4444" opacity="0.5"/>
        <text x="350" y="444" textAnchor="middle" fontSize="11" fill="#fca5a5" fontWeight="bold">⚠ DAMAGED</text>
        <text x="720" y="430" textAnchor="middle" fontSize="28">🚂</text>

        {/* Arrow def */}
        <defs>
          <marker id="sub-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
          </marker>
        </defs>

        {/* ===== CADET'S SUBMITTED PATHS ===== */}
        {paths.map((path, idx) => (
          <polyline
            key={idx}
            points={(path.points || []).map(p => `${p.x},${p.y}`).join(' ')}
            stroke={path.color || '#22d3ee'}
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
            markerEnd="url(#sub-arrow)"
          />
        ))}

        {/* ===== CADET'S SUBMITTED MARKERS ===== */}
        {markers.map((m, idx) => (
          <g key={idx}>
            <circle cx={m.x} cy={m.y} r="18" fill={m.color || '#3b82f6'} fillOpacity="0.3" stroke={m.color || '#3b82f6'} strokeWidth="2"/>
            <text x={m.x} y={m.y + 6} textAnchor="middle" fontSize="18">{m.icon || '📍'}</text>
            <text x={m.x} y={m.y + 26} textAnchor="middle" fill="#f3f4f6" fontSize="9" fontWeight="bold">{m.label || ''}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AccessorPortal() {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [formData, setFormData] = useState({
    problemDescription: '',
    timeLimit: 30,
    volunteers: 4,
    fireTrucks: 1,
    waterPumps: 1
  });

  // Load existing sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sessions/my-sessions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (response.ok) setSessions(data.sessions || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    };
    fetchSessions();
  }, []);

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
        setFormData({ problemDescription: '', timeLimit: 30, volunteers: 4, fireTrucks: 1, waterPumps: 1 });
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setSessions(sessions.filter(s => s._id !== sessionId));
        if (selectedSession?._id === sessionId) {
          setSelectedSession(null);
          setSubmissions([]);
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const fetchSubmissions = async (session) => {
    setSelectedSession(session);
    setLoadingSubmissions(true);
    setSubmissions([]);
    setExpandedSubmission(null);
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${session._id}/submissions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) setSubmissions(data.submissions || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Session code "${code}" copied to clipboard!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>Accessor Portal</h1>
          <p style={{ color: 'var(--gray-400)' }}>Create exercises, share codes, and review cadet submissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>+ New Exercise Session</button>
      </div>

      {/* Create Session Form */}
      {showCreateForm && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Create New Session</h2>
          <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>Problem Description (Situation)</label>
              <textarea className="input" rows="4" value={formData.problemDescription}
                onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                placeholder="Explain the village fire scenario, train approach, etc." required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { key: 'timeLimit', label: 'Time Limit (Minutes)' },
                { key: 'fireTrucks', label: 'Fire Trucks' },
                { key: 'volunteers', label: 'Volunteers' },
                { key: 'waterPumps', label: 'Water Pumps' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>{label}</label>
                  <input type="number" className="input" value={formData[key]}
                    onChange={(e) => setFormData({...formData, [key]: parseInt(e.target.value) || 0})} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create & Generate Code</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions List */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Active Sessions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>No active sessions. Create one to begin.</p>
          ) : (
            sessions.map(session => (
              <div key={session._id} style={{
                padding: '1rem', background: 'var(--gray-800)', borderRadius: '0.5rem',
                border: selectedSession?._id === session._id ? '2px solid var(--primary)' : '1px solid var(--gray-700)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem',
                      borderRadius: '0.3rem', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.1em', fontFamily: 'monospace'
                    }}>{session.sessionCode}</span>
                    <button onClick={() => copyCode(session.sessionCode)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Copy code">📋</button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/simulation?sessionId=${session._id}`)}>🗺 Map</button>
                    <button className="btn btn-sm btn-primary" onClick={() => fetchSubmissions(session)}>📥 Submissions</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSession(session._id)}>🗑</button>
                  </div>
                </div>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>
                  {session.problemDescription?.substring(0, 80)}{session.problemDescription?.length > 80 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  <span>⏱ {session.timeLimit} min</span>
                  <span>🚒 {session.assignedResources?.fireTrucks || 0}</span>
                  <span>👥 {session.assignedResources?.volunteers || 0}</span>
                  <span>💧 {session.assignedResources?.waterPumps || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submissions Viewer */}
      {selectedSession && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title">
              📥 Submissions — <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedSession.sessionCode}</span>
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-secondary" onClick={() => fetchSubmissions(selectedSession)}>🔄 Refresh</button>
              <button className="btn btn-sm btn-secondary" onClick={() => { setSelectedSession(null); setSubmissions([]); }}>✕ Close</button>
            </div>
          </div>

          {loadingSubmissions ? (
            <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem' }}>Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
              <p>No submissions yet. Share the code with cadets.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Code: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1.1rem' }}>{selectedSession.sessionCode}</strong>
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.map((sub, idx) => (
                <div key={idx} style={{
                  padding: '1rem', background: 'var(--gray-800)', borderRadius: '0.5rem', border: '1px solid var(--gray-700)'
                }}>
                  {/* Submission header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '2rem', height: '2rem', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '0.75rem'
                      }}>{(sub.cadetName || 'C')[0].toUpperCase()}</div>
                      <span style={{ color: 'var(--gray-100)', fontWeight: '600' }}>{sub.cadetName || 'Cadet'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Just now'}
                      </span>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setExpandedSubmission(expandedSubmission === idx ? null : idx)}
                      >
                        {expandedSubmission === idx ? '🗺 Hide Map' : '🗺 View Map'}
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ padding: '0.4rem 0.8rem', background: 'var(--gray-700)', borderRadius: '0.3rem' }}>
                      📍 <strong>{sub.mapState?.markers?.length || 0}</strong> Resources Placed
                    </div>
                    <div style={{ padding: '0.4rem 0.8rem', background: 'var(--gray-700)', borderRadius: '0.3rem' }}>
                      🛤 <strong>{sub.mapState?.paths?.length || 0}</strong> Routes Drawn
                    </div>
                  </div>

                  {/* Resource breakdown badges */}
                  {sub.mapState?.markers?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      {(() => {
                        const counts = {};
                        sub.mapState.markers.forEach(m => {
                          const label = m.label || m.type || 'Resource';
                          counts[label] = (counts[label] || 0) + 1;
                        });
                        return Object.entries(counts).map(([label, count]) => (
                          <span key={label} style={{
                            padding: '0.2rem 0.6rem', background: 'rgba(59,130,246,0.15)',
                            borderRadius: '1rem', fontSize: '0.75rem', color: 'var(--primary)'
                          }}>{label} × {count}</span>
                        ));
                      })()}
                    </div>
                  )}

                  {/* Cadet's note */}
                  {sub.note && (
                    <div style={{
                      padding: '0.75rem', background: 'rgba(59,130,246,0.08)',
                      borderLeft: '3px solid var(--primary)', borderRadius: '0 0.3rem 0.3rem 0',
                      fontSize: '0.85rem', color: 'var(--gray-300)', fontStyle: 'italic', marginBottom: '0.75rem'
                    }}>💬 "{sub.note}"</div>
                  )}

                  {/* ===== EXPANDED MAP VIEW ===== */}
                  {expandedSubmission === idx && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                        🗺 Cadet's resource placement and routes on the scenario map:
                      </p>
                      <SubmissionMap
                        markers={sub.mapState?.markers || []}
                        paths={sub.mapState?.paths || []}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
