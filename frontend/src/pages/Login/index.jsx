import { useState } from 'react';

const API = 'http://localhost:5000';

const BATCH_OPTIONS = [
  'NDA-156', 'NDA-157', 'NDA-158',
  'CDS-134', 'CDS-135', 'CDS-136',
  'CAPF-2025', 'CAPF-2026',
  'SSB-Direct', 'TGC-40', 'UES-34'
];

export default function Login({ onAccessorLogin, onCadetJoin }) {
  const [tab, setTab] = useState('cadet'); // 'accessor' | 'cadet'

  // Accessor fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Cadet fields
  const [chestNo, setChestNo] = useState('');
  const [name, setName] = useState('');
  const [cadetType, setCadetType] = useState('fresher');
  const [batch, setBatch] = useState('NDA-156');
  const [sessionCode, setSessionCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Accessor Login ──
  const handleAccessorLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        onAccessorLogin(data.token, data.user);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  // ── Cadet Join ──
  const handleCadetJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/auth/cadet-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chestNo: chestNo.trim(),
          name: name.trim(),
          cadetType,
          batch,
          sessionCode: sessionCode.trim().toUpperCase()
        })
      });
      const data = await response.json();
      if (response.ok) {
        onCadetJoin(data.token, data.user, data.session);
      } else {
        setError(data.error || 'Failed to join session');
      }
    } catch {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '1rem',
    border: 'none',
    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'Rajdhani, sans-serif',
    transition: 'all 0.25s ease',
    background: active ? 'rgba(14, 165, 233, 0.1)' : 'var(--gray-900)',
    color: active ? 'var(--primary)' : 'var(--gray-500)',
  });

  const inputLabel = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--gray-400)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '26rem', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4.5rem', height: '4.5rem',
            background: 'rgba(14, 165, 233, 0.1)',
            border: '2px solid var(--primary)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)',
            fontSize: '2rem', color: 'var(--primary)', fontWeight: '800', fontFamily: 'Rajdhani, sans-serif'
          }}>T</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
            OpSim GPE
          </h1>
          <p style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: '500' }}>Group Planning Exercise Platform</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderRadius: '0.5rem 0.5rem 0 0', overflow: 'hidden' }}>
          <button style={tabStyle(tab === 'cadet')} onClick={() => { setTab('cadet'); setError(''); }}>
            🎖 Cadet Entry
          </button>
          <button style={tabStyle(tab === 'accessor')} onClick={() => { setTab('accessor'); setError(''); }}>
            👨‍✈ Instructor Login
          </button>
        </div>

        {/* Form Card */}
        <div className="card" style={{ borderRadius: '0 0 0.75rem 0.75rem', padding: '1.75rem', borderTop: 'none' }}>

          {/* ── Cadet Tab ── */}
          {tab === 'cadet' && (
            <form onSubmit={handleCadetJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={inputLabel}>Chest No.</label>
                  <input className="input" placeholder="e.g. 42" value={chestNo} onChange={e => setChestNo(e.target.value)}
                    style={{ fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center' }} required />
                </div>
                <div>
                  <label style={inputLabel}>Full Name</label>
                  <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={inputLabel}>Type</label>
                  <select className="input" value={cadetType} onChange={e => setCadetType(e.target.value)}>
                    <option value="fresher">Fresher</option>
                    <option value="repeater">Repeater</option>
                  </select>
                </div>
                <div>
                  <label style={inputLabel}>Batch / Entry</label>
                  <select className="input" value={batch} onChange={e => setBatch(e.target.value)}>
                    {BATCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--gray-700)', paddingTop: '1rem' }}>
                <label style={inputLabel}>Session Code</label>
                <input className="input" placeholder="ENTER 6-DIGIT CODE"
                  value={sessionCode} onChange={e => setSessionCode(e.target.value)}
                  maxLength={6} required
                  style={{ fontSize: '1.4rem', textAlign: 'center', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: '800', fontFamily: 'monospace' }}
                />
              </div>

              {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

              <button type="submit" disabled={loading} className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontWeight: '700', fontSize: '1rem' }}>
                {loading ? '⏳ Joining...' : '🚀 Join Exercise'}
              </button>
            </form>
          )}

          {/* ── Accessor Tab ── */}
          {tab === 'accessor' && (
            <form onSubmit={handleAccessorLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={inputLabel}>Email Address</label>
                <input type="email" className="input" placeholder="email@gov.in" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label style={inputLabel}>Password</label>
                <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

              <button type="submit" disabled={loading} className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontWeight: '700', fontSize: '1rem' }}>
                {loading ? '⏳ Signing In...' : 'Sign In'}
              </button>

              <div style={{ padding: '0.75rem', background: 'var(--gray-800)', borderRadius: '0.5rem', border: '1px solid var(--gray-700)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.4rem', fontWeight: '600' }}>Instructor Accounts:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                  <p>IO: io@gov.in / io@12345</p>
                  <p>Psych: psych@gov.in / psych@12345</p>
                  <p>GTO: gto@gov.in / gto@12345</p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
