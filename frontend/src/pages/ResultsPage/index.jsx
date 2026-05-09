import { useState } from 'react';

export default function ResultsPage() {
  const [selectedMetric, setSelectedMetric] = useState('accuracy');

  const [analyticsData] = useState([
    { scenario: 'Village Fire', accuracy: 96.2, time: '45m 32s', score: 9850 },
    { scenario: 'Broken Bridge', accuracy: 92.1, time: '38m 15s', score: 8920 },
    { scenario: 'Rescue Operation', accuracy: 94.5, time: '52m 08s', score: 9650 },
    { scenario: 'Evacuation Plan', accuracy: 91.8, time: '41m 22s', score: 8750 },
  ]);

  const [aiMetrics] = useState({
    modelAccuracy: 94.7,
    responseTime: 0.23,
    decisionQuality: 96.2,
    patternRecognition: 93.8,
    riskAssessment: 95.1,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: 'var(--gray-100)',
          marginBottom: '0.5rem'
        }}>Performance Analytics</h1>
        <p style={{ color: 'var(--gray-400)' }}>Comprehensive evaluation reports and AI analysis</p>
      </div>

      {/* AI Metrics Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="stat-box">
          <div className="stat-value">{aiMetrics.modelAccuracy.toFixed(1)}%</div>
          <div className="stat-label">Model Accuracy</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{aiMetrics.responseTime.toFixed(2)}s</div>
          <div className="stat-label">Response Time</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{aiMetrics.decisionQuality.toFixed(1)}%</div>
          <div className="stat-label">Decision Quality</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{aiMetrics.patternRecognition.toFixed(1)}%</div>
          <div className="stat-label">Pattern Recognition</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{aiMetrics.riskAssessment.toFixed(1)}%</div>
          <div className="stat-label">Risk Assessment</div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Simulation Results</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--gray-700)' }}>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  color: 'var(--gray-300)',
                  fontWeight: '600'
                }}>Scenario</th>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  color: 'var(--gray-300)',
                  fontWeight: '600'
                }}>Accuracy</th>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  color: 'var(--gray-300)',
                  fontWeight: '600'
                }}>Duration</th>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  color: 'var(--gray-300)',
                  fontWeight: '600'
                }}>Score</th>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  color: 'var(--gray-300)',
                  fontWeight: '600'
                }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((result, idx) => (
                <tr key={idx} style={{
                  borderBottom: '1px solid var(--gray-800)',
                  transition: 'background-color 0.2s ease'
                }}>
                  <td style={{
                    padding: '0.75rem 1rem',
                    color: 'var(--gray-100)'
                  }}>{result.scenario}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '6rem',
                        background: 'var(--gray-700)',
                        borderRadius: '9999px',
                        height: '0.5rem'
                      }}>
                        <div style={{
                          background: 'var(--success)',
                          height: '0.5rem',
                          borderRadius: '9999px',
                          width: `${result.accuracy}%`
                        }}></div>
                      </div>
                      <span style={{
                        color: 'var(--gray-300)',
                        fontSize: '0.875rem'
                      }}>{result.accuracy.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    color: 'var(--gray-300)'
                  }}>{result.time}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      color: 'var(--primary)',
                      fontWeight: '600'
                    }}>{result.score}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge badge-success">✓ Completed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Key Findings</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem'
            }}>
              <span style={{
                color: 'var(--success)',
                fontSize: '1.25rem'
              }}>✓</span>
              <p style={{ color: 'var(--gray-300)' }}>
                <strong>High Accuracy Rate:</strong> Average 93.7% across all scenarios
              </p>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem'
            }}>
              <span style={{
                color: 'var(--warning)',
                fontSize: '1.25rem'
              }}>⚠</span>
              <p style={{ color: 'var(--gray-300)' }}>
                <strong>Complex Scenarios:</strong> Village Defense showed lower accuracy - recommend enhancement
              </p>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem'
            }}>
              <span style={{
                color: 'var(--primary)',
                fontSize: '1.25rem'
              }}>💡</span>
              <p style={{ color: 'var(--gray-300)' }}>
                <strong>Improvement Trend:</strong> Performance improving 0.8% per week
              </p>
            </li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recommendations</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.125rem' }}>1.</span>
              <p style={{ color: 'var(--gray-300)' }}>Increase training data for village scenario patterns</p>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.125rem' }}>2.</span>
              <p style={{ color: 'var(--gray-300)' }}>Optimize decision tree for time-critical decisions</p>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.125rem' }}>3.</span>
              <p style={{ color: 'var(--gray-300)' }}>Implement reinforcement learning for adaptive responses</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
