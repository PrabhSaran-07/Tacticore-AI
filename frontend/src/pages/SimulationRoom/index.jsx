import { useState } from 'react';
import ChatPanel from '../../components/ChatPanel';
import TacticalMap from '../../components/TacticalMap';
import ResourcePanel from '../../components/ResourcePanel';
import TeamBoard from '../../components/TeamBoard';
import ScoreCard from '../../components/ScoreCard';

export default function SimulationRoom() {
  const [isRunning, setIsRunning] = useState(false);
  const [scenario] = useState('Urban Combat Training');
  const [time, setTime] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            onClick={() => setIsRunning(!isRunning)}
            className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
          >
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button className="btn btn-secondary">📊 Stats</button>
          <button className="btn btn-secondary">⚙️ Settings</button>
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
            <TacticalMap />
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
          <ChatPanel />
        </div>

        {/* Team Board */}
        <div>
          <TeamBoard />
        </div>
      </div>
    </div>
  );
}
