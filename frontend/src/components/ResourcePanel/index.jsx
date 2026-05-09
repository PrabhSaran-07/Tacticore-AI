import { useState } from 'react';

export default function ResourcePanel() {
  const [resources] = useState([
    { name: 'Volunteers', current: 4, max: 4, icon: '👥' },
    { name: 'Fire Truck', current: 1, max: 1, icon: '🚒' },
    { name: 'Water Pump', current: 1, max: 1, icon: '💧' },
  ]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Available Resources</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {resources.map((resource, idx) => (
          <div key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--gray-300)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem' }}>{resource.icon}</span>
                {resource.name}
              </label>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>
                {resource.current}/{resource.max}
              </span>
            </div>
            <div style={{ width: '100%', background: 'var(--gray-700)', borderRadius: '9999px', height: '0.5rem' }}>
              <div 
                style={{ 
                  height: '0.5rem', 
                  borderRadius: '9999px', 
                  transition: 'all 0.3s ease',
                  width: `${(resource.current / resource.max) * 100}%`,
                  background: 'var(--success)'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-700)' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
          * Allocate resources via the Planning Map to coordinate the response.
        </p>
      </div>
    </div>
  );
}
