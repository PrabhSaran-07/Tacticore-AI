import { useState, useEffect } from 'react';
import ChatPanel from '../../components/ChatPanel';
import TacticalMap from '../../components/TacticalMap';
import ResourcePanel from '../../components/ResourcePanel';
import TeamBoard from '../../components/TeamBoard';
import ScoreCard from '../../components/ScoreCard';
import socket from '../../services/socket';

export default function SimulationRoom() {
  const [isRunning, setIsRunning] = useState(false);
  const [scenario] = useState('Urban Combat Training');
  const [time, setTime] = useState(0);
  const [showBriefing, setShowBriefing] = useState(true);
  const roomId = 'room-1'; // Hardcoded for now

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('simulationStateChange', (data) => {
      setIsRunning(data.isRunning);
    });

    return () => {
      socket.off('simulationStateChange');
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const toggleSimulation = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    socket.emit('simulationStateChange', { roomId, isRunning: newState });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      {/* Briefing Modal */}
      {showBriefing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Mission Briefing: {scenario}</h2>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Objective:</strong> You are tasked with coordinating a tactical operation in a dense urban environment. Alpha Squad and Bravo Team have been deployed.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Intelligence:</strong> Enemy forces have been spotted in sector 4. Your goal is to secure the perimeter and extract the VIP without civilian casualties.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Instructions:</strong> Use the Tactical Map to place markers, move units, and draw execution paths. Coordinate with your team using the real-time chat. Click 'Start' when ready to begin the simulation.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowBriefing(false)}>
              Acknowledge & Begin Planning
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: 'var(--gray-100)'
          }}>{scenario}</h1>
          <p style={{ color: 'var(--gray-400)' }}>Live tactical simulation in progress</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={toggleSimulation}
            className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
          >
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button className="btn btn-secondary" onClick={() => alert('Stats view coming soon!')}>📊 Stats</button>
          <button className="btn btn-secondary" onClick={() => setShowBriefing(true)}>📋 Briefing</button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {/* Map (Left/Top) - 2 columns */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{
            padding: 0,
            overflow: 'hidden',
            height: '31.25rem'
          }}>
            <TacticalMap roomId={roomId} />
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Score Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '1.125rem' }}>Scenario Status</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.25rem'
                }}>Time Elapsed</p>
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--primary)'
                }}>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</p>
              </div>
              <div style={{
                height: '1px',
                background: 'var(--gray-700)',
                margin: '0.5rem 0'
              }}></div>
              <div>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}>Mission Status</p>
                <span className={`badge ${isRunning ? 'badge-success' : 'badge-warning'}`}>
                  {isRunning ? '● Running' : '⊚ Paused'}
                </span>
              </div>
              <div style={{
                height: '1px',
                background: 'var(--gray-700)',
                margin: '0.5rem 0'
              }}></div>
              <ScoreCard title="Current Score" value="8,750" />
            </div>
          </div>

          {/* Resource Panel */}
          <ResourcePanel />
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {/* Chat Panel */}
        <div style={{ gridColumn: 'span 2' }}>
          <ChatPanel roomId={roomId} />
        </div>

        {/* Team Board */}
        <div>
          <TeamBoard />
        </div>
      </div>
    </div>
  );
}
