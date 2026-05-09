import { useState } from 'react';

export default function ResourcePanel() {
  const [resources] = useState([
    { name: 'Personnel', current: 45, max: 50, icon: '👥' },
    { name: 'Ammunition', current: 78, max: 100, icon: '💣' },
    { name: 'Medical', current: 92, max: 100, icon: '🏥' },
    { name: 'Fuel', current: 65, max: 100, icon: '⛽' },
  ]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Resources</h3>
      </div>
      
      <div className="space-y-4">
        {resources.map((resource, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <span className="text-lg">{resource.icon}</span>
                {resource.name}
              </label>
              <span className="text-sm font-semibold text-blue-400">
                {resource.current}/{resource.max}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  resource.current / resource.max > 0.5 ? 'bg-green-500' :
                  resource.current / resource.max > 0.25 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(resource.current / resource.max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <button className="btn btn-secondary w-full btn-sm">
          ⚠️ Request Resupply
        </button>
      </div>
    </div>
  );
}
