import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatPanel from '../../components/ChatPanel';
import PlanningMap from '../../components/PlanningMap';
import ResourcePanel from '../../components/ResourcePanel';
import TeamBoard from '../../components/TeamBoard';
import ScoreCard from '../../components/ScoreCard';
import socket from '../../services/socket';

export default function SimulationRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('sessionId') || 'default-session';
  
  const mapRef = useRef(null);

  const [session, setSession] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [showBriefing, setShowBriefing] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitNote, setSubmitNote] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'submitting' | 'success' | 'error'
  const [activeMode, setActiveMode] = useState('view');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCadet = user.role === 'cadet';
  const isAccessor = user.role === 'accessor';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (response.ok) {
          setSession(data.session);
          setTime(data.session.timeLimit * 60 || 0);
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
      }
    };

    fetchSession();
    socket.emit('joinRoom', sessionId);
    socket.on('simulationStateChange', (data) => setIsRunning(data.isRunning));
    
    return () => {
      socket.off('simulationStateChange');
      socket.emit('leaveRoom', sessionId);
    };
  }, [sessionId]);

  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);
      if (isCadet && submitStatus !== 'success') {
        handleSubmitAnswer();
        alert("Time is up! Your answer has been automatically submitted.");
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, time, isCadet, submitStatus]);

  const toggleSimulation = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    socket.emit('simulationStateChange', { roomId: sessionId, isRunning: newState });
  };

  // === SUBMIT ANSWER (Cadet only) ===
  const handleSubmitAnswer = async () => {
    if (!mapRef.current) return;
    setSubmitStatus('submitting');

    const { markers, paths } = mapRef.current.getMapState();
    
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ markers, paths, note: submitNote })
      });

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        const data = await response.json();
        console.error('Submit failed:', data.message);
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitStatus('error');
    }
  };

  // === SAVE OPTIMUM SOLUTION (Accessor only) ===
  const saveOptimumSolution = async () => {
    if (!mapRef.current) return;
    const { markers, paths } = mapRef.current.getMapState();

    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/optimum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ optimumSolution: { markers, paths } })
      });
      if (response.ok) alert('Optimum solution saved!');
    } catch (err) {
      console.error('Failed to save optimum solution:', err);
    }
  };

  if (!session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--gray-400)' }}>
        Loading exercise data...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', height: 'calc(100vh - 8rem)', padding: '0.5rem' }}>

      {/* ===== BRIEFING MODAL ===== */}
      {showBriefing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '650px', width: '100%', boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.75rem' }}>
              📋 Situation Briefing
            </h2>
            <div style={{ color: 'var(--gray-300)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              <div style={{ marginBottom: '1.5rem', background: 'var(--gray-800)', padding: '1rem', borderRadius: '0.5rem' }}>
                <strong>The Situation:</strong>
                <p style={{ marginTop: '0.5rem' }}>{session.problemDescription}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <strong>Resources:</strong>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                    <li>🚒 {session.assignedResources?.fireTrucks || 0} Fire Trucks</li>
                    <li>👥 {session.assignedResources?.volunteers || 0} Volunteers</li>
                    <li>💧 {session.assignedResources?.waterPumps || 0} Water Pumps</li>
                  </ul>
                </div>
                <div>
                  <strong>Constraints:</strong>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                    <li>⏱ {session.timeLimit} Minutes Total</li>
                    <li>📍 Session Code: {session.sessionCode}</li>
                  </ul>
                </div>
              </div>
              <p style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary)' }}>
                <strong>Instructions:</strong> Place resources on the map and draw routes to solve this scenario. 
                {isCadet && ' When you are done, click "Submit Answer" to send your solution to the Assessor.'}
                {isAccessor && ' You can save your optimum solution for future comparison.'}
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} onClick={() => {
              setShowBriefing(false);
              setIsRunning(true);
            }}>
              Start Exercise
            </button>
          </div>
        </div>
      )}

      {/* ===== SUBMIT CONFIRMATION MODAL (Cadet) ===== */}
      {showSubmitConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            {submitStatus === 'success' ? (
              <>
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                  <h2 style={{ color: 'var(--success)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Answer Submitted!</h2>
                  <p style={{ color: 'var(--gray-400)' }}>Your solution has been sent to the Assessor for review.</p>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setShowSubmitConfirm(false); setSubmitStatus(null); }}>
                  Back to Planning Room
                </button>
              </>
            ) : (
              <>
                <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                  📤 Submit Your Answer
                </h2>
                <p style={{ color: 'var(--gray-400)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  This will send your current map placement (all markers and routes) to the Assessor. You can re-submit to update your answer.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>
                    Note (optional) — explain your reasoning
                  </label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="E.g. I sent 2 volunteers to the train track while the fire truck handles the village..."
                    value={submitNote}
                    onChange={(e) => setSubmitNote(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                {submitStatus === 'error' && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    ⚠ Failed to submit. Please try again.
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={handleSubmitAnswer}
                    disabled={submitStatus === 'submitting'}
                  >
                    {submitStatus === 'submitting' ? '⏳ Submitting...' : '📤 Confirm Submit'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setShowSubmitConfirm(false); setSubmitStatus(null); }}
                    disabled={submitStatus === 'submitting'}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>Planning Room</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            Session: {session.sessionCode} | Assessor: {session.accessor?.name} | Role: <span style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Cadet: Submit Answer */}
          {isCadet && (
            <button className="btn btn-success" onClick={() => setShowSubmitConfirm(true)}>
              📤 Submit Answer
            </button>
          )}
          {/* Accessor: Save Optimum */}
          {isAccessor && (
            <button className="btn btn-primary" onClick={saveOptimumSolution}>
              💾 Save Optimum Solution
            </button>
          )}
          {/* Accessor: Toggle Global Simulation State */}
          {isAccessor && (
            <button onClick={toggleSimulation} className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}>
              {isRunning ? '⏸ Pause' : '▶ Start'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setShowBriefing(true)}>📋 Situation</button>
        </div>
      </div>

      {/* ===== MODE TOOLBAR ===== */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--gray-800)', padding: '0.5rem', borderRadius: '0.5rem' }}>
        {[
          { mode: 'view', label: '👁 View' },
          { mode: 'add_truck', label: '🚒 Fire Truck' },
          { mode: 'add_person', label: '👷 Volunteer' },
          { mode: 'add_pump', label: '💧 Water Pump' },
          { mode: 'draw_path', label: '✏ Draw Route' },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            className={`btn btn-sm ${activeMode === mode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== MAP + SIDEBAR ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <PlanningMap ref={mapRef} roomId={sessionId} activeMode={activeMode} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Exercise Status</h3>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Time Remaining</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: time < 300 ? 'var(--danger)' : 'var(--primary)' }}>
                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          <ResourcePanel resources={session.assignedResources} />
          <TeamBoard />
        </div>
      </div>

      {/* ===== CHAT ===== */}
      <div style={{ height: '25%' }}>
        <ChatPanel roomId={sessionId} />
      </div>
    </div>
  );
}
