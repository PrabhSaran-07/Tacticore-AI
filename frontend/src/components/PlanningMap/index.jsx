import { useEffect, useRef, useState } from 'react';
import socket from '../../services/socket';

// Custom 2D SVG-based planning map - Village Fire Scenario
const SCENARIO_ELEMENTS = {
  terrain: { color: '#4a7c59', label: 'Open Ground' },
  village: { color: '#8b7355', label: 'Village Area' },
  road: { color: '#9ca3af', label: 'Road' },
  water: { color: '#1e90ff', label: 'River/Water' },
  fire: { color: '#ef4444', label: 'Fire Zone' },
  train_track: { color: '#374151', label: 'Train Track' },
  train_danger: { color: '#f59e0b', label: 'Danger Zone' },
};

const RESOURCE_ICONS = {
  add_truck: { icon: '🚒', label: 'Fire Truck', color: '#ef4444' },
  add_person: { icon: '👷', label: 'Volunteer', color: '#3b82f6' },
  add_pump: { icon: '💧', label: 'Water Pump', color: '#06b6d4' },
};

export default function PlanningMap({ roomId, activeMode }) {
  const canvasRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [paths, setPaths] = useState([]);
  const [drawingPath, setDrawingPath] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Fixed scenario layout (grid-based)
  const MAP_W = 800;
  const MAP_H = 550;

  useEffect(() => {
    socket.on('mapUpdate', (data) => {
      if (data.roomId !== roomId) return;
      if (data.type === 'marker') setMarkers(prev => [...prev, data.marker]);
      if (data.type === 'path') setPaths(prev => [...prev, data.path]);
      if (data.type === 'clear') { setMarkers([]); setPaths([]); }
    });
    return () => socket.off('mapUpdate');
  }, [roomId]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeMode === 'view') return;

    if (activeMode === 'draw_path') {
      if (!drawingPath) {
        setDrawingPath({ points: [{ x, y }] });
      } else {
        const newPoints = [...drawingPath.points, { x, y }];
        setDrawingPath({ points: newPoints });
      }
      return;
    }

    if (activeMode === 'finish_path' && drawingPath) {
      const newPath = { id: Date.now(), points: drawingPath.points, color: '#22d3ee' };
      setPaths(prev => [...prev, newPath]);
      socket.emit('mapUpdate', { roomId, type: 'path', path: newPath });
      setDrawingPath(null);
      return;
    }

    const resourceInfo = RESOURCE_ICONS[activeMode];
    if (resourceInfo) {
      const newMarker = {
        id: Date.now(),
        x, y,
        type: activeMode,
        icon: resourceInfo.icon,
        label: resourceInfo.label,
        color: resourceInfo.color,
      };
      setMarkers(prev => [...prev, newMarker]);
      socket.emit('mapUpdate', { roomId, type: 'marker', marker: newMarker });
    }
  };

  const handleClear = () => {
    setMarkers([]);
    setPaths([]);
    setDrawingPath(null);
    socket.emit('mapUpdate', { roomId, type: 'clear' });
  };

  const getCursor = () => {
    if (activeMode === 'view') return 'default';
    return 'crosshair';
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a', position: 'relative' }}>
      {/* Map Canvas */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: getCursor() }}
        onClick={handleCanvasClick}
        ref={canvasRef}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ display: 'block' }}
        >
          {/* Background - terrain */}
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#3d6b47" />

          {/* Village area (center-left) */}
          <rect x="80" y="80" width="320" height="280" rx="8" fill="#7c6a4a" opacity="0.8" />
          <text x="240" y="72" textAnchor="middle" fill="#f3f4f6" fontSize="13" fontWeight="bold">🏘 VILLAGE</text>

          {/* Roads */}
          <rect x="0" y="195" width={MAP_W} height="18" fill="#6b7280" />  {/* horizontal */}
          <rect x="240" y="0" width="18" height={MAP_H} fill="#6b7280" />  {/* vertical */}

          {/* Houses */}
          {[
            [100,100],[160,100],[220,100],
            [100,170],[160,170],[220,170],
            [100,240],[160,240],[220,240],
          ].map(([hx, hy], i) => (
            <g key={i}>
              <rect x={hx} y={hy} width="40" height="38" rx="4" fill="#8b7355" stroke="#a0856e" strokeWidth="1.5"/>
              <polygon points={`${hx},${hy} ${hx+40},${hy} ${hx+20},${hy-16}`} fill="#6b5a3a"/>
            </g>
          ))}

          {/* Fire zones (on some houses) */}
          {[[100,100],[160,100],[100,170]].map(([fx, fy], i) => (
            <g key={i}>
              <ellipse cx={fx+20} cy={fy-5} rx="18" ry="22" fill="#ff4500" opacity="0.7"/>
              <ellipse cx={fx+20} cy={fy-5} rx="10" ry="14" fill="#ffcc00" opacity="0.8"/>
              <text x={fx+20} y={fy-2} textAnchor="middle" fontSize="18">🔥</text>
            </g>
          ))}

          {/* River */}
          <path d={`M 500 0 Q 520 120 490 200 Q 460 280 510 ${MAP_H}`} stroke="#1e90ff" strokeWidth="30" fill="none" opacity="0.7" strokeLinecap="round"/>
          <text x="510" y="140" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="bold" transform="rotate(15,510,140)">🌊 RIVER</text>

          {/* Train track */}
          <line x1="0" y1="460" x2={MAP_W} y2="400" stroke="#374151" strokeWidth="12" strokeDasharray="20,8"/>
          <line x1="0" y1="460" x2={MAP_W} y2="400" stroke="#9ca3af" strokeWidth="3" strokeDasharray="4,24" strokeDashoffset="14"/>
          <text x="640" y="450" fill="#f3f4f6" fontSize="12" fontWeight="bold">🚂 TRAIN TRACK</text>

          {/* Damaged section */}
          <ellipse cx="350" cy="440" rx="40" ry="20" fill="#ef4444" opacity="0.5"/>
          <text x="350" y="444" textAnchor="middle" fontSize="11" fill="#fca5a5" fontWeight="bold">⚠ DAMAGED</text>

          {/* Approaching train */}
          <text x="720" y="430" textAnchor="middle" fontSize="28">🚂</text>
          <text x="720" y="448" textAnchor="middle" fill="#fbbf24" fontSize="10">APPROACHING</text>

          {/* Legend box */}
          <rect x="560" y="60" width="220" height="130" rx="6" fill="rgba(15,23,42,0.85)" stroke="#374151" strokeWidth="1"/>
          <text x="670" y="82" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">SCENARIO LEGEND</text>
          {[
            { color: '#ef4444', label: '🔥 Fire Zone' },
            { color: '#fbbf24', label: '⚠ Damaged Track' },
            { color: '#1e90ff', label: '🌊 River' },
            { color: '#6b7280', label: '🛤 Road' },
            { color: '#7c6a4a', label: '🏘 Village' },
          ].map(({ color, label }, i) => (
            <g key={i}>
              <rect x="570" y={96 + i * 18} width="12" height="12" fill={color} rx="2"/>
              <text x="590" y={107 + i * 18} fill="#d1d5db" fontSize="11">{label}</text>
            </g>
          ))}

          {/* Paths drawn by user */}
          {paths.map(path => (
            <polyline
              key={path.id}
              points={path.points.map(p => `${p.x},${p.y}`).join(' ')}
              stroke={path.color || '#22d3ee'}
              strokeWidth="3"
              fill="none"
              strokeDasharray="8,4"
              markerEnd="url(#arrow)"
            />
          ))}

          {/* Arrow marker for paths */}
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
            </marker>
          </defs>

          {/* In-progress path */}
          {drawingPath && drawingPath.points.length > 1 && (
            <polyline
              points={drawingPath.points.map(p => `${p.x},${p.y}`).join(' ')}
              stroke="#22d3ee"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6,3"
              opacity="0.7"
            />
          )}

          {/* Resource Markers */}
          {markers.map(marker => (
            <g key={marker.id}>
              <circle cx={marker.x} cy={marker.y} r="18" fill={marker.color} fillOpacity="0.25" stroke={marker.color} strokeWidth="2"/>
              <text x={marker.x} y={marker.y + 6} textAnchor="middle" fontSize="18">{marker.icon}</text>
              <text x={marker.x} y={marker.y + 26} textAnchor="middle" fill="#f3f4f6" fontSize="9" fontWeight="bold">{marker.label}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.4rem 1rem',
        background: 'rgba(15,23,42,0.95)',
        borderTop: '1px solid var(--gray-700)',
        fontSize: '0.75rem',
        color: 'var(--gray-400)'
      }}>
        <span>
          {activeMode === 'view' && '👁 View Mode — Switch mode above to place resources'}
          {activeMode === 'add_truck' && '🚒 Click anywhere on the map to place a Fire Truck'}
          {activeMode === 'add_person' && '👷 Click anywhere on the map to place a Volunteer'}
          {activeMode === 'add_pump' && '💧 Click anywhere on the map to place a Water Pump'}
          {activeMode === 'draw_path' && `✏ Drawing route — ${drawingPath ? `${drawingPath.points.length} points` : 'Click to start'}`}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeMode === 'draw_path' && drawingPath && (
            <button
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                if (drawingPath) {
                  const newPath = { id: Date.now(), points: drawingPath.points, color: '#22d3ee' };
                  setPaths(prev => [...prev, newPath]);
                  socket.emit('mapUpdate', { roomId, type: 'path', path: newPath });
                  setDrawingPath(null);
                }
              }}
            >
              ✅ Finish Route
            </button>
          )}
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
          >
            🗑 Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
