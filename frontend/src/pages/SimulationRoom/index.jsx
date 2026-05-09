import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatPanel from '../../components/ChatPanel';
import PlanningMap from '../../components/PlanningMap';
import ResourcePanel from '../../components/ResourcePanel';
import socket from '../../services/socket';
import SCENARIO_TEMPLATES from '../../data/scenarioTemplates';

const API = 'http://localhost:5000';
const getToken = () => sessionStorage.getItem('token');

export default function SimulationRoom({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('sessionId') || '';

  const mapRef = useRef(null);

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitNote, setSubmitNote] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeMode, setActiveMode] = useState('view');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [currentMarkers, setCurrentMarkers] = useState([]);

  const isCadet = user?.role === 'cadet';
  const isAccessor = user?.role === 'accessor';

  // Fetch session data
  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const response = await fetch(`${API}/api/sessions/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await response.json();
        if (response.ok) {
          setSession(data.session);
          setTime(data.session.timeLimit * 60 || 0);
          setParticipants(data.session.participants || []);
          if (data.session.phase === 'completed') {
            setSessionEnded(true);
          } else if (data.session.phase !== 'waiting') {
            setIsRunning(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
      }
    };
    fetchSession();

    // Join socket room
    socket.emit('joinRoom', {
      roomId: sessionId,
      chestNo: user?.chestNo || null,
      userName: user?.name || 'User'
    });

    // Listen for phase changes
    socket.on('sessionPhaseChange', (data) => {
      setSession(prev => prev ? { ...prev, phase: data.phase, status: data.status } : prev);
      if (data.phase === 'group_discussion' || data.phase === 'individual_planning') {
        setIsRunning(true);
        setShowBriefing(true);
      }
      if (data.phase === 'completed') {
        setSessionEnded(true);
        setIsRunning(false);
      }
    });

    socket.on('sessionEnded', () => {
      setSessionEnded(true);
      setIsRunning(false);
    });

    socket.on('simulationStateChange', (data) => setIsRunning(data.isRunning));

    socket.on('userJoined', () => {
      // Refresh participants
      fetch(`${API}/api/sessions/${sessionId}/participants`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }).then(r => r.json()).then(d => {
        if (d.participants) setParticipants(d.participants);
      }).catch(() => {});
    });

    return () => {
      socket.off('sessionPhaseChange');
      socket.off('sessionEnded');
      socket.off('simulationStateChange');
      socket.off('userJoined');
      socket.emit('leaveRoom', sessionId);
    };
  }, [sessionId]);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0 && session?.phase !== 'waiting') {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0 && isRunning && isCadet && submitStatus !== 'success') {
      handleSubmitAnswer('timeOver');
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, time, session?.phase]);

  // Start session (accessor)
  const handleStartSession = async () => {
    try {
      const response = await fetch(`${API}/api/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setIsRunning(true);
      }
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  // End session (accessor)
  const handleEndSession = async () => {
    if (!confirm('End session for all cadets? This cannot be undone.')) return;
    try {
      await fetch(`${API}/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      socket.emit('endSession', { roomId: sessionId });
      setSessionEnded(true);
      setIsRunning(false);
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const toggleSimulation = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    socket.emit('simulationStateChange', { roomId: sessionId, isRunning: newState });
  };

  // Submit answer (cadet)
  const handleSubmitAnswer = async (submitType = 'manual') => {
    if (!mapRef.current) return;
    setSubmitStatus('submitting');
    const { markers, paths } = mapRef.current.getMapState();
    try {
      const response = await fetch(`${API}/api/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ markers, paths, note: submitNote })
      });
      if (response.ok) {
        setSubmitStatus('success');
        if (isCadet) {
          const resultStatus = submitType === 'timeOver' ? 'timeOver' : 'submitted';
          setTimeout(() => {
            navigate(`/cadet-session-results?status=${resultStatus}&sessionId=${sessionId}`);
          }, 500);
        }
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  // ── WAITING ROOM (cadet sees this before session starts) ──
  if (session && session.phase === 'waiting' && isCadet) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', gap: '2rem', padding: '2rem', position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <button onClick={() => { if (onLogout) onLogout(); }} style={{
            padding: '0.5rem 1rem', background: 'var(--gray-700)', border: '1px solid var(--gray-600)',
            borderRadius: '0.4rem', color: 'var(--gray-300)', cursor: 'pointer', fontSize: '0.8rem'
          }}>Logout</button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>⏳</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>
            Waiting for Instructor
          </h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '1rem', marginBottom: '1rem' }}>
            The session will begin once the Instructor starts it.
          </p>
        </div>

        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Session Code</p>
              <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace', letterSpacing: '0.15em' }}>{session.sessionCode}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Your Chest No</p>
              <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)', fontFamily: 'monospace' }}>{user?.chestNo || '—'}</p>
            </div>
          </div>

          <div style={{ background: 'var(--gray-800)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>Cadets Joined</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {participants.length === 0 ? (
                <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Waiting for cadets...</p>
              ) : participants.map((p, idx) => (
                <span key={idx} style={{
                  padding: '0.3rem 0.7rem', background: 'rgba(59,130,246,0.15)', borderRadius: '1rem',
                  fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600'
                }}>
                  {p.chestNo || p.name}
                </span>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
            {session.title && <><strong>{session.title}</strong> · </>}
            ⏱ {session.timeLimit} min
          </p>
        </div>

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </div>
    );
  }

  // ── SESSION ENDED SCREEN ──
  if (sessionEnded) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', gap: '1.5rem', padding: '2rem'
      }}>
        <div style={{ fontSize: '5rem' }}>🏁</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>Session Ended</h1>
        <p style={{ color: 'var(--gray-400)', fontSize: '1.1rem', maxWidth: '500px', textAlign: 'center' }}>
          {isCadet
            ? 'The session has been ended by the Instructor. Your work has been recorded.'
            : 'Session completed. You can review submissions from the Instructor Portal.'}
        </p>
        <button className="btn btn-primary" onClick={() => {
          if (isCadet && onLogout) onLogout();
          else navigate('/accessor');
        }}>
          {isCadet ? 'Exit' : 'Back to Portal'}
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--gray-400)' }}>
        Loading exercise data...
      </div>
    );
  }

  // ── ACCESSOR WAITING VIEW (sees participants joining) ──
  if (session.phase === 'waiting' && isAccessor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>
              {session.title || 'Session'} — <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{session.sessionCode}</span>
            </h1>
            <p style={{ color: 'var(--gray-400)' }}>Waiting for cadets to join. Share the code above.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-success" onClick={handleStartSession} disabled={participants.length === 0}
              style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
              ▶ Start Session ({participants.length} cadets)
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/accessor')}>← Back</button>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Cadets Joined ({participants.length})</h2>
          {participants.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
              No cadets have joined yet. Share the session code: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1.25rem' }}>{session.sessionCode}</strong>
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {participants.map((p, idx) => (
                <div key={idx} style={{
                  padding: '1rem', background: 'var(--gray-800)', borderRadius: '0.5rem',
                  border: '1px solid var(--gray-700)', display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                  <div style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), #1d4ed8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold', fontSize: '0.9rem'
                  }}>{p.chestNo || '?'}</div>
                  <div>
                    <p style={{ color: 'var(--gray-100)', fontWeight: '600', fontSize: '0.9rem' }}>{p.name}</p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.7rem' }}>
                      {p.batch} · {p.cadetType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN PLANNING ROOM ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', minHeight: 'calc(100vh - 8rem)', padding: '0.5rem' }}>

      {/* Briefing Modal */}
      {showBriefing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '650px', width: '100%', boxShadow: '0 0 40px rgba(59,130,246,0.3)' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.75rem' }}>📋 Situation Briefing</h2>
            <div style={{ color: 'var(--gray-300)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              <div style={{ marginBottom: '1.5rem', background: 'var(--gray-800)', padding: '1rem', borderRadius: '0.5rem' }}>
                <strong>The Situation:</strong>
                <p style={{ marginTop: '0.5rem' }}>{session.problemDescription}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Resources:</strong>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                    <li>🚒 {session.assignedResources?.fireTrucks || 0} Fire Trucks</li>
                    <li>👥 {session.assignedResources?.volunteers || 0} Volunteers</li>
                    <li>💧 {session.assignedResources?.waterPumps || 0} Water Pumps</li>
                  </ul>
                </div>
                <div>
                  <strong>Info:</strong>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                    <li>⏱ {session.timeLimit} Minutes</li>
                    <li>🎖 Chest No: {user?.chestNo || 'N/A'}</li>
                  </ul>
                </div>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} onClick={() => setShowBriefing(false)}>
              Begin Planning
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirm Modal */}
      {showSubmitConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            {submitStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: 'var(--success)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Answer Submitted!</h2>
                <p style={{ color: 'var(--gray-400)' }}>Redirecting...</p>
              </div>
            ) : (
              <>
                <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>📤 Submit Your Answer</h2>
                <p style={{ color: 'var(--gray-400)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  This will send your current map placement to the Instructor.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>
                    Reasoning (optional)
                  </label>
                  <textarea className="input" rows="3" placeholder="Explain your plan..."
                    value={submitNote} onChange={(e) => setSubmitNote(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                {submitStatus === 'error' && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚠ Failed to submit. Try again.</p>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmitAnswer} disabled={submitStatus === 'submitting'}>
                    {submitStatus === 'submitting' ? '⏳ Submitting...' : '📤 Confirm Submit'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setShowSubmitConfirm(false); setSubmitStatus(null); }} disabled={submitStatus === 'submitting'}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>Planning Room</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Session: {session.sessionCode}
            {isCadet && <> | Chest No: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user?.chestNo}</span></>}
            {isAccessor && <> | Role: <span style={{ color: 'var(--primary)' }}>Instructor</span></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isCadet && (
            <button className="btn btn-success" onClick={() => setShowSubmitConfirm(true)}>📤 Submit Answer</button>
          )}
          {isAccessor && (
            <>
              <button onClick={toggleSimulation} className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}>
                {isRunning ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button className="btn btn-danger" onClick={handleEndSession}>🏁 End Session</button>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => setShowBriefing(true)}>📋 Situation</button>
          {isCadet && (
            <button className="btn btn-secondary" onClick={() => { if (onLogout) onLogout(); }}>Logout</button>
          )}
        </div>
      </div>

      {/* Mode Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--gray-800)', padding: '0.5rem', borderRadius: '0.5rem' }}>
        {[
          { mode: 'view', label: '👁 View' },
          { mode: 'add_truck', label: '🚒 Fire Truck' },
          { mode: 'add_person', label: '👷 Volunteer' },
          { mode: 'add_pump', label: '💧 Water Pump' },
          { mode: 'draw_path', label: '✏ Draw Route' },
        ].map(({ mode, label }) => (
          <button key={mode} className={`btn btn-sm ${activeMode === mode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode(mode)}>
            {label}
          </button>
        ))}
      </div>

      {/* Map + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', flex: 1, minHeight: '250px' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <PlanningMap 
            ref={mapRef} 
            roomId={sessionId} 
            activeMode={activeMode} 
            user={user} 
            scenarioId={session?.scenarioId} 
            assignedResources={session?.assignedResources}
            onMarkersChange={setCurrentMarkers}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          {/* Map Legend */}
          {session?.scenarioId && SCENARIO_TEMPLATES[session.scenarioId]?.legend && (
            <div className="card">
              <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Map Legend</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {SCENARIO_TEMPLATES[session.scenarioId].legend.map(({ color, label }, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '1rem', height: '1rem', background: color, borderRadius: '0.2rem' }}></div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-300)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Exercise Status</h3>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Time Remaining</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: time < 300 ? 'var(--danger)' : time < 600 ? 'var(--warning)' : 'var(--primary)' }}>
                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          <ResourcePanel resources={session?.assignedResources} currentMarkers={currentMarkers} />
          {/* Participants */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Cadets ({participants.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {participants.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', background: 'var(--gray-800)', borderRadius: '0.3rem' }}>
                  <span style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.75rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {p.chestNo || '?'}
                  </span>
                  <span style={{ color: 'var(--gray-300)', fontSize: '0.8rem' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div style={{ height: '25%' }}>
        <ChatPanel roomId={sessionId} user={user} />
      </div>
    </div>
  );
}
