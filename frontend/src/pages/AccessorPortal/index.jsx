import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSessionWizard from '../../components/CreateSessionWizard';
import SCENARIO_TEMPLATES from '../../data/scenarioTemplates';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Reuse the element renderer from PlanningMap (simplified inline version)
function renderSubmissionElement(el, idx) {
  switch (el.type) {
    case 'zone':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={8} fill={el.fill || '#7c6a4a'} opacity={0.8} />
          {el.label && <text x={el.x + el.w / 2} y={el.y + (el.labelY || -8)} textAnchor="middle" fill="#f3f4f6" fontSize="13" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'road':
      return <line key={idx} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#6b7280" strokeWidth={el.width || 18} />;
    case 'house':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width="40" height="38" rx="4" fill="#8b7355" stroke="#a0856e" strokeWidth="1.5" />
          <polygon points={`${el.x},${el.y} ${el.x+40},${el.y} ${el.x+20},${el.y-16}`} fill="#6b5a3a" />
        </g>
      );
    case 'fire':
      return (
        <g key={idx}>
          <ellipse cx={el.x} cy={el.y} rx="18" ry="22" fill="#ff4500" opacity="0.7" />
          <ellipse cx={el.x} cy={el.y} rx="10" ry="14" fill="#ffcc00" opacity="0.8" />
          <text x={el.x} y={el.y + 3} textAnchor="middle" fontSize="18">🔥</text>
        </g>
      );
    case 'river':
      return (
        <g key={idx}>
          <path d={el.path} stroke="#1e90ff" strokeWidth="30" fill="none" opacity="0.7" strokeLinecap="round" />
          {el.label && <text x={el.labelX || 400} y={el.labelY || 200} textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="bold" transform={el.labelRotate ? `rotate(${el.labelRotate},${el.labelX},${el.labelY})` : undefined}>{el.label}</text>}
        </g>
      );
    case 'track':
      return (
        <g key={idx}>
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#374151" strokeWidth="12" strokeDasharray="20,8" />
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#9ca3af" strokeWidth="3" strokeDasharray="4,24" strokeDashoffset="14" />
          <text x={(el.x1 + el.x2) / 2 + 200} y={(el.y1 + el.y2) / 2 + 10} fill="#f3f4f6" fontSize="12" fontWeight="bold">🚂 TRAIN TRACK</text>
        </g>
      );
    case 'danger_zone':
      return (
        <g key={idx}>
          <ellipse cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} fill="#ef4444" opacity="0.5" />
          <text x={el.cx} y={el.cy + 4} textAnchor="middle" fontSize="11" fill="#fca5a5" fontWeight="bold">{el.label}</text>
        </g>
      );
    case 'vehicle':
      return (
        <g key={idx}>
          <text x={el.x} y={el.y} textAnchor="middle" fontSize="28">{el.icon}</text>
          {el.sublabel && <text x={el.x} y={el.y + 15} textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">{el.sublabel}</text>}
        </g>
      );
    case 'building':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width={el.w || 80} height={el.h || 60} rx="4" fill={el.fill || '#8b7355'} stroke="#a0856e" strokeWidth="1.5" />
          {el.label && <text x={el.x + (el.w || 80) / 2} y={el.y - 8} textAnchor="middle" fill="#f3f4f6" fontSize="11" fontWeight="bold">{el.label}</text>}
          {el.sublabel && <text x={el.x + (el.w || 80) / 2} y={el.y + (el.h || 60) / 2 + 4} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">{el.sublabel}</text>}
        </g>
      );
    case 'poi':
      return (
        <g key={idx}>
          <text x={el.x} y={el.y} textAnchor="middle" fontSize="22">{el.icon}</text>
          {el.label && <text x={el.x} y={el.y + 18} textAnchor="middle" fill="#f3f4f6" fontSize="9" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'flood_zone':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="8" fill="rgba(30,144,255,0.25)" stroke="#1e90ff" strokeWidth="2" strokeDasharray="8,4" />
          {el.label && <text x={el.x + el.w / 2} y={el.y + el.h / 2} textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'bridge':
      return (
        <g key={idx}>
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#ef4444" strokeWidth="6" strokeDasharray="6,6" />
          {el.label && <text x={(el.x1 + el.x2) / 2} y={el.y1 - 8} textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'border_fence':
      return (
        <g key={idx}>
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#f59e0b" strokeWidth="4" strokeDasharray="12,6" />
          <line x1={el.x1} y1={el.y1 - 1} x2={el.x2} y2={el.y2 - 1} stroke="#fbbf24" strokeWidth="1" />
        </g>
      );
    case 'label':
      return <text key={idx} x={el.x} y={el.y} textAnchor="middle" fill={el.color || '#ccc'} fontSize="11" fontWeight="bold" letterSpacing="0.1em">{el.text}</text>;
    case 'checkpoint':
      return (
        <g key={idx}>
          <rect x={el.x - 15} y={el.y - 10} width="30" height="20" rx="3" fill="#f59e0b" opacity="0.8" />
          <text x={el.x} y={el.y - 15} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">{el.label}</text>
        </g>
      );
    case 'threat':
      return (
        <g key={idx}>
          <circle cx={el.x} cy={el.y} r="20" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3" />
          <text x={el.x} y={el.y + 5} textAnchor="middle" fontSize="18">{el.icon}</text>
          {el.label && <text x={el.x} y={el.y + 28} textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">{el.label}</text>}
          {el.sublabel && <text x={el.x} y={el.y + 38} textAnchor="middle" fill="#ef4444" fontSize="8">{el.sublabel}</text>}
        </g>
      );
    case 'vegetation':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="6" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" />
          {el.label && <text x={el.x + el.w / 2} y={el.y + el.h / 2 + 4} textAnchor="middle" fill="#86efac" fontSize="10">{el.label}</text>}
        </g>
      );
    case 'collapsed':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width="60" height="50" rx="3" fill="#78716c" stroke="#ef4444" strokeWidth="2" />
          <line x1={el.x} y1={el.y} x2={el.x + 60} y2={el.y + 50} stroke="#ef4444" strokeWidth="2" />
          <line x1={el.x + 60} y1={el.y} x2={el.x} y2={el.y + 50} stroke="#ef4444" strokeWidth="2" />
          {el.label && <text x={el.x + 30} y={el.y - 6} textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'hazard':
      return (
        <g key={idx}>
          <circle cx={el.x} cy={el.y} r="30" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3" />
          <text x={el.x} y={el.y + 5} textAnchor="middle" fontSize="22">{el.icon}</text>
          {el.label && <text x={el.x} y={el.y + 30} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">{el.label}</text>}
          {el.sublabel && <text x={el.x} y={el.y + 42} textAnchor="middle" fill="#f59e0b" fontSize="8">{el.sublabel}</text>}
        </g>
      );
    case 'road_blocked':
      return (
        <g key={idx}>
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#6b7280" strokeWidth={20} />
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="rgba(239,68,68,0.3)" strokeWidth={20} />
          {el.label && <text x={(el.x1 + el.x2) / 2 + 15} y={(el.y1 + el.y2) / 2} fill="#fca5a5" fontSize="9" fontWeight="bold">{el.label}</text>}
        </g>
      );
    default:
      return null;
  }
}

// Mini SVG map that renders a cadet's submitted markers and paths with scenario backdrop
function SubmissionMap({ markers = [], paths = [], scenarioId }) {
  const [step, setStep] = useState(-1);
  const W = 800, H = 550;
  const template = SCENARIO_TEMPLATES[scenarioId] || SCENARIO_TEMPLATES['village_fire'];

  const allActions = [
    ...markers.map(m => ({ ...m, _type: 'marker' })),
    ...paths.map(p => ({ ...p, _type: 'path' }))
  ].sort((a, b) => a.id - b.id);

  const totalSteps = allActions.length;
  const visibleActions = step === -1 || step >= totalSteps ? allActions : allActions.slice(0, step);

  const visibleMarkers = visibleActions.filter(a => a._type === 'marker');
  const visiblePaths = visibleActions.filter(a => a._type === 'path');

  const handleNext = () => setStep(prev => (prev === -1 ? totalSteps : prev) < totalSteps ? (prev === -1 ? 1 : prev + 1) : prev);
  const handlePrev = () => setStep(prev => prev === -1 ? totalSteps - 1 : prev > 0 ? prev - 1 : prev);
  const handleReset = () => setStep(0);
  const handleShowAll = () => setStep(-1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', background: 'var(--gray-800)', padding: '0.5rem', borderRadius: '0.5rem' }}>
        <button className="btn btn-sm btn-secondary" onClick={handleReset} disabled={step === 0}>⏮ Reset</button>
        <button className="btn btn-sm btn-secondary" onClick={handlePrev} disabled={step === 0}>◀ Prev</button>
        <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gray-300)', minWidth: '80px', justifyContent: 'center' }}>
          Step {step === -1 ? totalSteps : step} / {totalSteps}
        </span>
        <button className="btn btn-sm btn-secondary" onClick={handleNext} disabled={step === -1 || step === totalSteps}>Next ▶</button>
        <button className="btn btn-sm btn-primary" onClick={handleShowAll} disabled={step === -1 || step === totalSteps}>⏭ Show All</button>
      </div>
      <div style={{ width: '100%', minHeight: '250px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--gray-700)', background: template.terrain || '#3d6b47', display: 'flex', alignItems: 'center' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          <rect x="0" y="0" width={W} height={H} fill={template.terrain || '#3d6b47'} />

          {/* Scenario backdrop (faded) */}
          {template.elements.map((el, idx) => renderSubmissionElement(el, idx))}

          {/* Arrow def */}
          <defs>
            <marker id="sub-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
            </marker>
          </defs>

          {/* ===== CADET'S SUBMITTED PATHS ===== */}
          {visiblePaths.map((path, idx) => (
            <polyline key={idx} points={(path.points || []).map(p => `${p.x},${p.y}`).join(' ')}
              stroke={path.color || '#22d3ee'} strokeWidth="3" fill="none" strokeDasharray="8,4" markerEnd="url(#sub-arrow)" />
          ))}

          {/* ===== CADET'S SUBMITTED MARKERS ===== */}
          {visibleMarkers.map((m, idx) => (
            <g key={idx}>
              <circle cx={m.x} cy={m.y} r="18" fill={m.color || '#3b82f6'} fillOpacity="0.3" stroke={m.color || '#3b82f6'} strokeWidth="2"/>
              <text x={m.x} y={m.y + 6} textAnchor="middle" fontSize="18">{m.icon || '📍'}</text>
              <text x={m.x} y={m.y + 26} textAnchor="middle" fill="#f3f4f6" fontSize="9" fontWeight="bold">{m.label || ''}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function AccessorPortal() {
  const navigate = useNavigate();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  // Load existing sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API}/api/sessions/my-sessions`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (response.ok) setSessions(data.sessions || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    };
    fetchSessions();
  }, []);

  const handleSessionCreated = (session) => {
    setSessions([session, ...sessions]);
    setShowCreateWizard(false);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
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

  const handleDuplicateSession = async (sessionId) => {
    try {
      const response = await fetch(`${API}/api/sessions/${sessionId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok && data.session) {
        setSessions([data.session, ...sessions]);
      } else {
        alert(data.message || 'Failed to duplicate session');
      }
    } catch (err) {
      console.error('Error duplicating session:', err);
    }
  };

  const fetchSubmissions = async (session) => {
    setSelectedSession(session);
    setLoadingSubmissions(true);
    setSubmissions([]);
    setExpandedSubmission(null);
    try {
      const response = await fetch(`${API}/api/sessions/${session._id}/submissions`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
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
        <button className="btn btn-primary" onClick={() => setShowCreateWizard(true)}>+ New Exercise Session</button>
      </div>

      {/* Create Session Wizard */}
      {showCreateWizard && (
        <CreateSessionWizard
          onCreated={handleSessionCreated}
          onCancel={() => setShowCreateWizard(false)}
        />
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
                    <span style={{
                      background: session.phase === 'waiting' ? 'rgba(245,158,11,0.15)' : session.phase === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                      color: session.phase === 'waiting' ? 'var(--warning)' : session.phase === 'completed' ? 'var(--success)' : 'var(--primary)',
                      padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase'
                    }}>{session.phase || 'waiting'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>👥 {session.participants?.length || 0}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-success" onClick={() => navigate(`/simulation?sessionId=${session._id}`)}>▶ Enter Session</button>
                    <button className="btn btn-sm btn-primary" onClick={() => fetchSubmissions(session)}>📥 Submissions</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleDuplicateSession(session._id)} title="Duplicate session">📋 Duplicate</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSession(session._id)}>🗑</button>
                  </div>
                </div>
                {session.title && (
                  <p style={{ color: 'var(--gray-200)', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem' }}>{session.title}</p>
                )}
                <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>
                  {session.problemDescription?.substring(0, 80)}{session.problemDescription?.length > 80 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)', alignItems: 'center' }}>
                  <span>⏱ {session.timeLimit} min</span>
                  <span>🚒 {session.assignedResources?.fireTrucks || 0}</span>
                  <span>👥 {session.assignedResources?.volunteers || 0}</span>
                  <span>💧 {session.assignedResources?.waterPumps || 0}</span>
                  {session.difficulty && (
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase',
                      background: session.difficulty === 'hard' ? 'rgba(239,68,68,0.15)' : session.difficulty === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                      color: session.difficulty === 'hard' ? 'var(--danger)' : session.difficulty === 'medium' ? 'var(--warning)' : 'var(--success)'
                    }}>{session.difficulty}</span>
                  )}
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
                      {sub.olqAnalysis && (
                        <span style={{ 
                          background: sub.olqAnalysis.overallScore >= 8 ? 'rgba(16,185,129,0.2)' : sub.olqAnalysis.overallScore >= 5 ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)', 
                          color: sub.olqAnalysis.overallScore >= 8 ? 'var(--success)' : sub.olqAnalysis.overallScore >= 5 ? 'var(--primary)' : 'var(--warning)', 
                          padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' 
                        }}>
                          OLQ: {sub.olqAnalysis.overallScore}/10
                        </span>
                      )}
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
                        scenarioId={selectedSession?.scenarioId}
                      />
                      {/* Detailed OLQ Report */}
                      {sub.olqAnalysis && (
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--gray-100)', marginBottom: '0.5rem', borderBottom: '1px solid var(--gray-700)', paddingBottom: '0.5rem' }}>
                            AI Performance Analysis
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.3)', padding: '1rem' }}>
                              <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Overall Score</p>
                              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>
                                {sub.olqAnalysis.overallScore} <span style={{ fontSize: '1rem', color: 'var(--gray-500)' }}>/ 10</span>
                              </div>
                            </div>
                            
                            <div className="card" style={{ padding: '1rem' }}>
                              <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Top Strengths</p>
                              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
                                {sub.olqAnalysis.strengths?.map((s, i) => (
                                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                                    <span>✓ {s.name}</span>
                                    <strong>{s.score}</strong>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="card" style={{ padding: '1rem' }}>
                              <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Areas for Growth</p>
                              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
                                {sub.olqAnalysis.improvements?.map((s, i) => (
                                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--warning)' }}>
                                    <span>⚠ {s.name}</span>
                                    <strong>{s.score}</strong>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="card" style={{ padding: '1rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--gray-100)', marginBottom: '1rem' }}>Detailed OLQ Rubric Breakdown</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                              {sub.olqAnalysis.details?.map((detail, i) => (
                                <div key={i} style={{ padding: '0.75rem', background: 'var(--gray-800)', borderRadius: '0.5rem', borderLeft: `3px solid ${detail.score >= 8 ? 'var(--success)' : detail.score >= 5 ? 'var(--primary)' : 'var(--danger)'}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--gray-200)', fontSize: '0.85rem' }}>{detail.name}</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: detail.score >= 8 ? 'var(--success)' : detail.score >= 5 ? 'var(--primary)' : 'var(--danger)' }}>
                                      {detail.score}
                                    </span>
                                  </div>
                                  <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem', lineHeight: '1.4' }}>{detail.evidence}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
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
