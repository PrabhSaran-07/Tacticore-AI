import { useState, useEffect } from 'react';
import ChatPanel from '../../components/ChatPanel';
import PlanningMap from '../../components/PlanningMap';
import ResourcePanel from '../../components/ResourcePanel';
import TeamBoard from '../../components/TeamBoard';
import ScoreCard from '../../components/ScoreCard';
import socket from '../../services/socket';

export default function SimulationRoom() {
  const [isRunning, setIsRunning] = useState(false);
  const [scenario] = useState('Village Fire Emergency');
  const [time, setTime] = useState(0);
  const [showBriefing, setShowBriefing] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeMode, setActiveMode] = useState('view');
  const roomId = 'room-1';

  useEffect(() => {
    socket.emit('joinRoom', roomId);
    socket.on('simulationStateChange', (data) => setIsRunning(data.isRunning));
    return () => socket.off('simulationStateChange');
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleSimulation = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    socket.emit('simulationStateChange', { roomId, isRunning: newState });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', height: '100vh' }}>
      {/* Briefing Modal */}
      {showBriefing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '650px', width: '100%', boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.75rem' }}>Situation Briefing: {scenario}</h2>
            <div style={{ color: 'var(--gray-300)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong>The Situation:</strong> A fire has broken out in the village houses. A passenger train is approaching, but the tracks are damaged.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Resources:</strong> 1 Emergency Vehicle, 4 Volunteers.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Objectives:</strong> 
                1. Extinguish the fire.
                2. Signal the train to stop before the damaged section.
              </p>
              <p style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--gray-800)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary)' }}>
                <strong>Instructions:</strong> Use the Planning Map to coordinate. Place resources simultaneously and draw routes. Discuss with your group in real-time.
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => setShowBriefing(false)}>
              Start Planning Phase
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
                <span>Communication Score</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>92/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--gray-800)', borderRadius: '0.5rem' }}>
                <span>Time Management</span>
                <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Good</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
              The group has demonstrated effective coordination in the first {Math.floor(time / 60)} minutes.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowAnalytics(false)}>Close Reports</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>{scenario}</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Group Planning Exercise - Real-time Collaboration</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={toggleSimulation} className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}>
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowAnalytics(true)}>📊 Analytics</button>
          <button className="btn btn-secondary" onClick={() => setShowBriefing(true)}>📋 Situation</button>
        </div>
      </div>

      {/* Control Bar for 3D Map */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--gray-800)', padding: '0.5rem', borderRadius: '0.5rem' }}>
        <button className={`btn btn-sm ${activeMode === 'view' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode('view')}>View Mode</button>
        <button className={`btn btn-sm ${activeMode === 'add_truck' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode('add_truck')}>+ Fire Truck</button>
        <button className={`btn btn-sm ${activeMode === 'add_person' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode('add_person')}>+ Volunteer</button>
        <button className={`btn btn-sm ${activeMode === 'draw_path' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMode('draw_path')}>Draw Route</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Planning Map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <PlanningMap roomId={roomId} activeMode={activeMode} />
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Exercise Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Time Elapsed</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <ScoreCard title="Team Coordination" value="8.5/10" />
            </div>
          </div>
          <ResourcePanel />
          <TeamBoard />
        </div>
      </div>

      <div style={{ height: '30%' }}>
        <ChatPanel roomId={roomId} />
      </div>
    </div>
  );
}
