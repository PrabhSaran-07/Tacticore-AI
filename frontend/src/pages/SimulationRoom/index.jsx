import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatPanel from '../../components/ChatPanel';
import PlanningMap from '../../components/PlanningMap';
import ResourcePanel from '../../components/ResourcePanel';
import TeamBoard from '../../components/TeamBoard';
import ScoreCard from '../../components/ScoreCard';
import socket from '../../services/socket';

export default function SimulationRoom() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('sessionId') || 'default-session';
  
  const [session, setSession] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [showBriefing, setShowBriefing] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeMode, setActiveMode] = useState('view');

  useEffect(() => {
    // Fetch session data
    const fetchSession = async () => {
      try {
        console.log('Fetching session for ID:', sessionId);
        const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        console.log('Session response:', data);
        if (response.ok) {
          setSession(data.session);
          setTime(data.session.timeLimit * 60 || 0);
        } else {
          console.error('Session fetch failed:', data.message);
        }
      } catch (err) {
        console.error('Network error fetching session:', err);
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
    } else if (time === 0) {
      setIsRunning(false);
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, time]);

  const toggleSimulation = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    socket.emit('simulationStateChange', { roomId: sessionId, isRunning: newState });
  };

  const saveOptimumSolution = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/optimum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          optimumSolution: {
            // we would gather markers/paths here
          }
        })
      });
      if (response.ok) alert('Optimum solution saved successfully!');
    } catch (err) {
      console.error('Failed to save optimum solution:', err);
    }
  };

  if (!session) return <div className="flex items-center justify-center h-screen text-slate-400">Loading exercise data...</div>;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAccessor = user.role === 'accessor' && session.accessor?._id === user._id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', height: '100vh', padding: '1rem' }}>
      {/* Briefing Modal */}
      {showBriefing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '650px', width: '100%', boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.75rem' }}>
              Situation Briefing
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
                    <li>🚒 {session.assignedResources.fireTrucks} Fire Trucks</li>
                    <li>👥 {session.assignedResources.volunteers} Volunteers</li>
                    <li>💧 {session.assignedResources.waterPumps} Water Pumps</li>
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

              <p style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary)' }}>
                <strong>Instructions:</strong> Coordinate with your group to find the optimum solution. Use the map to place resources and draw routes.
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => setShowBriefing(false)}>
              Start Exercise
            </button>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <h2 className="card-title" style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Planning Analytics</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--gray-800)', borderRadius: '0.5rem' }}>
                <span>Resource Allocation</span>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Optimal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--gray-800)', borderRadius: '0.5rem' }}>
                <span>Coordination Score</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>92/100</span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowAnalytics(false)}>Close Reports</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>Planning Room</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Session: {session.sessionCode} | Assessor: {session.accessor?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isAccessor && (
            <button className="btn btn-primary" onClick={saveOptimumSolution}>💾 Save Optimum Solution</button>
          )}
          <button onClick={toggleSimulation} className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}>
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowAnalytics(true)}>📊 Analytics</button>
          <button className="btn btn-secondary" onClick={() => setShowBriefing(true)}>📋 Situation</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--gray-800)', padding: '0.5rem', borderRadius: '0.5rem' }}>
        <button className={`btn btn-sm ${activeMode === 'view' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode('view')}>View</button>
        <button className={`btn btn-sm ${activeMode === 'add_truck' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode('add_truck')}>+ Fire Truck</button>
        <button className={`btn btn-sm ${activeMode === 'add_person' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode('add_person')}>+ Volunteer</button>
        <button className={`btn btn-sm ${activeMode === 'draw_path' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode('draw_path')}>Draw Route</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <PlanningMap roomId={sessionId} activeMode={activeMode} />
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
            <ScoreCard title="Coordination" value="8.5/10" />
          </div>
          <ResourcePanel resources={session.assignedResources} />
          <TeamBoard />
        </div>
      </div>

      <div style={{ height: '25%' }}>
        <ChatPanel roomId={sessionId} />
      </div>
    </div>
  );
}
