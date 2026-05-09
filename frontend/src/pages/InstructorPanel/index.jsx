import { useState } from 'react';

export default function InstructorPanel() {
  const [students] = useState([
    { id: 1, name: 'Aman', status: 'in-progress', scenario: 'Village Fire', progress: 65 },
    { id: 2, name: 'Ravi', status: 'completed', scenario: 'Flood Rescue', progress: 100 },
    { id: 3, name: 'Sameer', status: 'in-progress', scenario: 'Bridge Rescue', progress: 42 },
    { id: 4, name: 'Mohit', status: 'completed', scenario: 'Fire Containment', progress: 100 },
  ]);

  const [scenarios] = useState([
    { id: 1, name: 'Village Fire Exercise', difficulty: 'Medium', duration: '45min', students: 24 },
    { id: 2, name: 'Flood Rescue Exercise', difficulty: 'Hard', duration: '50min', students: 18 },
    { id: 3, name: 'Emergency Evacuation', difficulty: 'Medium', duration: '40min', students: 31 },
    { id: 4, name: 'Fire Containment Plan', difficulty: 'Hard', duration: '55min', students: 12 },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: 'var(--gray-100)',
          marginBottom: '0.5rem'
        }}>Instructor Control Panel</h1>
        <p style={{ color: 'var(--gray-400)' }}>Manage students, scenarios, and performance tracking</p>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button className="btn btn-primary">
          + Create Scenario
        </button>
        <button className="btn btn-secondary">
          📊 View Reports
        </button>
        <button className="btn btn-secondary">
          🎓 Manage Students
        </button>
        <button className="btn btn-secondary">
          ⚙️ AI Settings
        </button>
      </div>

      {/* Students Overview */}
      <div className="card">
        <div className="card-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 className="card-title">Active Students</h2>
          <span className="badge badge-info">{students.length} Active</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {students.map(student => (
            <div key={student.id} style={{
              padding: '1rem',
              background: 'var(--gray-800)',
              borderRadius: '0.5rem',
              border: '1px solid var(--gray-700)',
              transition: 'border-color 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <p style={{
                    color: 'var(--gray-100)',
                    fontWeight: '600'
                  }}>{student.name}</p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--gray-400)'
                  }}>{student.scenario}</p>
                </div>
                <span className={`badge ${
                  student.status === 'completed' ? 'badge-success' : 'badge-info'
                }`}>
                  {student.status === 'completed' ? '✓ Completed' : '⊙ Active'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: '100%',
                    background: 'var(--gray-700)',
                    borderRadius: '9999px',
                    height: '0.5rem'
                  }}>
                    <div style={{
                      background: 'var(--primary)',
                      height: '0.5rem',
                      borderRadius: '9999px',
                      width: `${student.progress}%`
                    }}></div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--gray-300)',
                  minWidth: 'fit-content'
                }}>{student.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenarios Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Available Scenarios</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {scenarios.map(scenario => (
            <div key={scenario.id} style={{
              padding: '1rem',
              background: 'var(--gray-800)',
              borderRadius: '0.5rem',
              border: '1px solid var(--gray-700)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <h3 style={{
                    color: 'var(--gray-100)',
                    fontWeight: '600'
                  }}>{scenario.name}</h3>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--gray-400)',
                    marginTop: '0.25rem'
                  }}>Duration: {scenario.duration}</p>
                </div>
                <span className={`badge ${
                  scenario.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {scenario.difficulty}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--gray-700)'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--gray-400)'
                }}>{scenario.students} students enrolled</span>
                <button className="btn btn-sm btn-secondary">Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="stat-box">
          <div className="stat-value">156</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">4</div>
          <div className="stat-label">Active Scenarios</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">93.2%</div>
          <div className="stat-label">Avg. Accuracy</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">847</div>
          <div className="stat-label">Simulations Run</div>
        </div>
      </div>
    </div>
  );
}
