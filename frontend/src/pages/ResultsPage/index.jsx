import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sessions/my-results', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (response.ok) {
          setResults(data.results || []);
          if (data.results?.length > 0) {
            setSelectedResult(data.results[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--gray-400)' }}>Analyzing your performance...</div>;
  }

  if (results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--gray-500)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--gray-300)', marginBottom: '0.5rem' }}>No Analysis Available</h2>
        <p>You haven't submitted any exercise solutions yet.</p>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/cadet')}>
          Join a Session
        </button>
      </div>
    );
  }

  const analysis = selectedResult?.submission?.olqAnalysis;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>
            AI Performance Analysis
          </h1>
          <p style={{ color: 'var(--gray-400)' }}>SSB Officer Like Qualities (OLQ) Evaluation</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select 
            className="input" 
            style={{ minWidth: '200px' }}
            onChange={(e) => setSelectedResult(results.find(r => r.sessionId === e.target.value))}
            value={selectedResult?.sessionId || ''}
          >
            {results.map(r => (
              <option key={r.sessionId} value={r.sessionId}>Session: {r.sessionCode}</option>
            ))}
          </select>
        </div>
      </div>

      {analysis ? (
        <>
          {/* Top Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', border: '1px solid rgba(59,130,246,0.3)' }}>
              <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Overall OLQ Score</p>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gray-100)' }}>
                {analysis.overallScore} <span style={{ fontSize: '1.5rem', color: 'var(--gray-500)' }}>/ 10</span>
              </div>
            </div>
            
            <div className="card">
              <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Top Strengths</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
                {analysis.strengths?.map((s, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                    <span>✓ {s.name}</span>
                    <strong>{s.score}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Areas for Growth</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
                {analysis.improvements?.map((s, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--warning)' }}>
                    <span>⚠ {s.name}</span>
                    <strong>{s.score}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--gray-200)', marginBottom: '0.5rem' }}>AI Assessor Recommendation</h3>
            <p style={{ color: 'var(--gray-400)', lineHeight: '1.6' }}>{analysis.recommendation}</p>
          </div>

          {/* Detailed OLQ Breakdowns */}
          <h2 style={{ fontSize: '1.5rem', color: 'var(--gray-100)', marginTop: '1rem', borderBottom: '1px solid var(--gray-800)', paddingBottom: '0.5rem' }}>
            Factor Analysis (15 OLQs)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(analysis.categories || {}).map(([categoryName, categoryData]) => (
              <div key={categoryName} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{categoryName}</h3>
                  <span style={{ background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', color: 'var(--primary)' }}>
                    Avg: {categoryData.average}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {categoryData.qualities.map(q => (
                    <div key={q.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: 'var(--gray-300)' }}>{q.name}</span>
                        <span style={{ color: 'var(--gray-400)', fontWeight: 'bold' }}>{q.score} / 10</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--gray-800)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${(q.score / 10) * 100}%`,
                          background: q.score >= 8 ? 'var(--success)' : q.score >= 5 ? 'var(--primary)' : 'var(--warning)',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submission Stats */}
          <div className="card" style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--gray-200)', marginBottom: '1rem' }}>Execution Metrics</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Resources Placed</p>
                <p style={{ fontSize: '1.5rem', color: 'var(--gray-100)', fontWeight: 'bold' }}>{analysis.metrics?.totalMarkers}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Routes Drawn</p>
                <p style={{ fontSize: '1.5rem', color: 'var(--gray-100)', fontWeight: 'bold' }}>{analysis.metrics?.totalPaths}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Resource Utilization</p>
                <p style={{ fontSize: '1.5rem', color: 'var(--gray-100)', fontWeight: 'bold' }}>{analysis.metrics?.resourceUtilization}%</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Map Distribution</p>
                <p style={{ fontSize: '1.5rem', color: 'var(--gray-100)', fontWeight: 'bold' }}>{analysis.metrics?.spatialDistribution}%</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
          Select a session to view its analysis.
        </div>
      )}
    </div>
  );
}
