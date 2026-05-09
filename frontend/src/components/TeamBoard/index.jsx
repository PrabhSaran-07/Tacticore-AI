import { useState } from 'react';

export default function TeamBoard() {
  const [units] = useState([
    { id: 1, name: 'Planning Group 1', leader: 'Adams', strength: 10, morale: 'High', status: 'active' },
    { id: 2, name: 'Planning Group 2', leader: 'Chen', strength: 8, morale: 'Good', status: 'active' },
    { id: 3, name: 'Planning Group 3', leader: 'Davis', strength: 6, morale: 'Good', status: 'ready' },
  ]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Team Status</h3>
      </div>
      
      <div className="space-y-3">
        {units.map(unit => (
          <div key={unit.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-100">{unit.name}</p>
                <p className="text-xs text-slate-400">{unit.leader}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                unit.status === 'active' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
              }`}>
                {unit.status === 'active' ? '●' : '◐'} {unit.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>{unit.strength}/10 Personnel</span>
              <span>Morale: {unit.morale}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${(unit.strength / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-700 text-center">
        <p className="text-xs text-slate-400">Total Strength</p>
        <p className="text-2xl font-bold text-blue-400">24/28</p>
      </div>
    </div>
  );
}
