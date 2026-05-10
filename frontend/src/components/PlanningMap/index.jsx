import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import socket from '../../services/socket';
import SCENARIO_TEMPLATES from '../../data/scenarioTemplates';

const RESOURCE_ICONS = {
  add_truck: { icon: '🚒', label: 'Fire Truck', color: '#ef4444' },
  add_person: { icon: '👷', label: 'Volunteer', color: '#3b82f6' },
  add_pump: { icon: '💧', label: 'Water Pump', color: '#06b6d4' },
};

// ── SVG renderers for each element type ──
function renderElement(el, idx) {
  switch (el.type) {
    case 'zone':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={8} fill={el.fill || '#7c6a4a'} opacity={0.8} />
          {el.label && <text x={el.x + el.w / 2} y={el.y + (el.labelY || -8)} textAnchor="middle" fill="#f3f4f6" fontSize="13" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'road':
      return <line key={idx} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#6b7280" strokeWidth={el.width || 18} />;
    case 'house':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width="40" height="38" rx="4" fill="#8b7355" stroke="#a0856e" strokeWidth="1.5" />
          <polygon points={`${el.x},${el.y} ${el.x+40},${el.y} ${el.x+20},${el.y-16}`} fill="#6b5a3a" />
        </g>
      );
    case 'fire':
      return (
        <g key={idx}>
          <ellipse cx={el.x} cy={el.y} rx="18" ry="22" fill="#ff4500" opacity="0.7" />
          <ellipse cx={el.x} cy={el.y} rx="10" ry="14" fill="#ffcc00" opacity="0.8" />
          <text x={el.x} y={el.y + 3} textAnchor="middle" fontSize="18">🔥</text>
        </g>
      );
    case 'river':
      return (
        <g key={idx}>
          <path d={el.path} stroke="#1e90ff" strokeWidth="30" fill="none" opacity="0.7" strokeLinecap="round" />
          {el.label && <text x={el.labelX || 400} y={el.labelY || 200} textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="bold" transform={el.labelRotate ? `rotate(${el.labelRotate},${el.labelX},${el.labelY})` : undefined}>{el.label}</text>}
        </g>
      );
    case 'track':
      return (
        <g key={idx}>
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#374151" strokeWidth="12" strokeDasharray="20,8" />
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#9ca3af" strokeWidth="3" strokeDasharray="4,24" strokeDashoffset="14" />
          <text x={(el.x1 + el.x2) / 2 + 200} y={(el.y1 + el.y2) / 2 + 10} fill="#f3f4f6" fontSize="12" fontWeight="bold">🚂 TRAIN TRACK</text>
        </g>
      );
    case 'danger_zone':
      return (
        <g key={idx}>
          <ellipse cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} fill="#ef4444" opacity="0.5" />
          <text x={el.cx} y={el.cy + 4} textAnchor="middle" fontSize="11" fill="#fca5a5" fontWeight="bold">{el.label}</text>
        </g>
      );
    case 'vehicle':
      return (
        <g key={idx}>
          <text x={el.x} y={el.y} textAnchor="middle" fontSize="28">{el.icon}</text>
          {el.sublabel && <text x={el.x} y={el.y + 18} textAnchor="middle" fill="#fbbf24" fontSize="10">{el.sublabel}</text>}
        </g>
      );
    case 'building':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width={el.w || 80} height={el.h || 60} rx="4" fill={el.fill || '#8b7355'} stroke="#a0856e" strokeWidth="1.5" />
          {el.label && <text x={el.x + (el.w || 80) / 2} y={el.y - 8} textAnchor="middle" fill="#f3f4f6" fontSize="11" fontWeight="bold">{el.label}</text>}
          {el.sublabel && <text x={el.x + (el.w || 80) / 2} y={el.y + (el.h || 60) / 2 + 4} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">{el.sublabel}</text>}
        </g>
      );
    case 'poi':
      return (
        <g key={idx}>
          <text x={el.x} y={el.y} textAnchor="middle" fontSize="22">{el.icon}</text>
          {el.label && <text x={el.x} y={el.y + 18} textAnchor="middle" fill="#f3f4f6" fontSize="9" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'flood_zone':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="8" fill="rgba(30,144,255,0.25)" stroke="#1e90ff" strokeWidth="2" strokeDasharray="8,4" />
          {el.label && <text x={el.x + el.w / 2} y={el.y + el.h / 2} textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'bridge':
      return (
        <g key={idx}>
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#ef4444" strokeWidth="6" strokeDasharray="6,6" />
          {el.label && <text x={(el.x1 + el.x2) / 2} y={el.y1 - 8} textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'border_fence':
      return (
        <g key={idx}>
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#f59e0b" strokeWidth="4" strokeDasharray="12,6" />
          <line x1={el.x1} y1={el.y1 - 1} x2={el.x2} y2={el.y2 - 1} stroke="#fbbf24" strokeWidth="1" />
        </g>
      );
    case 'label':
      return <text key={idx} x={el.x} y={el.y} textAnchor="middle" fill={el.color || '#ccc'} fontSize="11" fontWeight="bold" letterSpacing="0.1em">{el.text}</text>;
    case 'checkpoint':
      return (
        <g key={idx}>
          <rect x={el.x - 15} y={el.y - 10} width="30" height="20" rx="3" fill="#f59e0b" opacity="0.8" />
          <text x={el.x} y={el.y - 15} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">{el.label}</text>
        </g>
      );
    case 'threat':
      return (
        <g key={idx}>
          <circle cx={el.x} cy={el.y} r="20" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3" />
          <text x={el.x} y={el.y + 5} textAnchor="middle" fontSize="18">{el.icon}</text>
          {el.label && <text x={el.x} y={el.y + 28} textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">{el.label}</text>}
          {el.sublabel && <text x={el.x} y={el.y + 38} textAnchor="middle" fill="#ef4444" fontSize="8">{el.sublabel}</text>}
        </g>
      );
    case 'vegetation':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="6" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" />
          {el.label && <text x={el.x + el.w / 2} y={el.y + el.h / 2 + 4} textAnchor="middle" fill="#86efac" fontSize="10">{el.label}</text>}
        </g>
      );
    case 'collapsed':
      return (
        <g key={idx}>
          <rect x={el.x} y={el.y} width="60" height="50" rx="3" fill="#78716c" stroke="#ef4444" strokeWidth="2" />
          <line x1={el.x} y1={el.y} x2={el.x + 60} y2={el.y + 50} stroke="#ef4444" strokeWidth="2" />
          <line x1={el.x + 60} y1={el.y} x2={el.x} y2={el.y + 50} stroke="#ef4444" strokeWidth="2" />
          {el.label && <text x={el.x + 30} y={el.y - 6} textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">{el.label}</text>}
        </g>
      );
    case 'hazard':
      return (
        <g key={idx}>
          <circle cx={el.x} cy={el.y} r="30" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3" />
          <text x={el.x} y={el.y + 5} textAnchor="middle" fontSize="22">{el.icon}</text>
          {el.label && <text x={el.x} y={el.y + 30} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">{el.label}</text>}
          {el.sublabel && <text x={el.x} y={el.y + 42} textAnchor="middle" fill="#f59e0b" fontSize="8">{el.sublabel}</text>}
        </g>
      );
    case 'road_blocked':
      return (
        <g key={idx}>
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#6b7280" strokeWidth={20} />
          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="rgba(239,68,68,0.3)" strokeWidth={20} />
          {el.label && <text x={(el.x1 + el.x2) / 2 + 15} y={(el.y1 + el.y2) / 2} fill="#fca5a5" fontSize="9" fontWeight="bold">{el.label}</text>}
        </g>
      );
    default:
      return null;
  }
}



const PlanningMap = forwardRef(function PlanningMap({ roomId, activeMode, user, scenarioId, assignedResources, onMarkersChange }, ref) {
  const svgRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [paths, setPaths] = useState([]);
  const [drawingPath, setDrawingPath] = useState(null);

  // Zoom and Pan states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  // Get the scenario template
  const template = SCENARIO_TEMPLATES[scenarioId] || SCENARIO_TEMPLATES['village_fire'];

  // Expose map state to parent via ref
  useImperativeHandle(ref, () => ({
    getMapState: () => ({ markers, paths })
  }), [markers, paths]);

  const MAP_W = 800;
  const MAP_H = 550;

  useEffect(() => {
    socket.on('mapUpdate', (data) => {
      if (data.roomId !== roomId) return;
      if (data.type === 'marker') setMarkers(prev => [...prev, data.marker]);
      if (data.type === 'path') setPaths(prev => [...prev, data.path]);
      if (data.type === 'undo') {
         if (data.targetType === 'marker') setMarkers(prev => prev.filter(m => m.id !== data.targetId));
         if (data.targetType === 'path') setPaths(prev => prev.filter(p => p.id !== data.targetId));
      }
      if (data.type === 'clear') { setMarkers([]); setPaths([]); }
    });
    return () => socket.off('mapUpdate');
  }, [roomId]);

  useEffect(() => {
    if (onMarkersChange) {
      onMarkersChange(markers);
    }
  }, [markers, onMarkersChange]);

  const getMousePosition = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const handlePointerDown = (e) => {
    if (activeMode === 'view' || e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    const { x, y } = getMousePosition(e);

    if (activeMode === 'draw_path') {
      if (!drawingPath) {
        setDrawingPath({ points: [{ x, y }] });
      } else {
        const newPoints = [...drawingPath.points, { x, y }];
        setDrawingPath({ points: newPoints });
      }
      return;
    }

    if (activeMode === 'finish_path' && drawingPath) return;

    const resourceInfo = RESOURCE_ICONS[activeMode];
    if (resourceInfo) {
      if (assignedResources) {
        const typeCount = markers.filter(m => m.type === activeMode).length;
        let limit = 0;
        if (activeMode === 'add_truck') limit = assignedResources.fireTrucks || 0;
        else if (activeMode === 'add_person') limit = assignedResources.volunteers || 0;
        else if (activeMode === 'add_pump') limit = assignedResources.waterPumps || 0;

        if (typeCount >= limit) {
          alert(`Limit reached for ${resourceInfo.label}`);
          return;
        }
      }

      const newMarker = {
        id: Date.now(),
        x, y,
        type: activeMode,
        icon: resourceInfo.icon,
        label: resourceInfo.label,
        color: resourceInfo.color,
        placedBy: user?.chestNo || user?.name || 'Unknown',
      };
      setMarkers(prev => [...prev, newMarker]);
      socket.emit('mapUpdate', { roomId, type: 'marker', marker: newMarker, userId: user?._id, chestNo: user?.chestNo });
    }
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      const ctm = svgRef.current.getScreenCTM();
      setPan(prev => ({ x: prev.x - dx / ctm.a, y: prev.y - dy / ctm.d }));
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = () => { setIsPanning(false); };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    newZoom = Math.min(Math.max(0.5, newZoom), 5);
    setZoom(newZoom);
  };

  const handleClear = () => {
    setMarkers([]);
    setPaths([]);
    setDrawingPath(null);
    socket.emit('mapUpdate', { roomId, type: 'clear', userId: user?._id, chestNo: user?.chestNo });
  };

  const handleUndo = () => {
    // If currently drawing a path, cancel it first
    if (drawingPath) {
      setDrawingPath(null);
      return;
    }

    // Collect all items with their type for chronological undo
    const allItems = [
      ...markers.map(m => ({ ...m, _kind: 'marker' })),
      ...paths.map(p => ({ ...p, _kind: 'path' }))
    ];
    if (allItems.length === 0) return;

    // Find the most recent item by id (timestamp-based)
    const latest = allItems.reduce((max, item) => (item.id > max.id ? item : max), allItems[0]);

    if (latest._kind === 'marker') {
      setMarkers(prev => prev.filter(m => m.id !== latest.id));
      socket.emit('mapUpdate', { roomId, type: 'undo', targetId: latest.id, targetType: 'marker' });
    } else {
      setPaths(prev => prev.filter(p => p.id !== latest.id));
      socket.emit('mapUpdate', { roomId, type: 'undo', targetId: latest.id, targetType: 'path' });
    }
  };

  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (activeMode === 'view') return 'grab';
    return 'crosshair';
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a', position: 'relative' }}>

      {/* Zoom Controls */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(15,23,42,0.8)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--gray-700)' }}>
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 5))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>➕</button>
        <button onClick={() => { setZoom(1); setPan({x: 0, y: 0}); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>🔄</button>
        <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.5))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>➖</button>
      </div>

      {/* Scenario name badge */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(15,23,42,0.85)', padding: '0.35rem 0.75rem', borderRadius: '0.4rem', border: '1px solid var(--gray-700)', fontSize: '0.75rem', color: 'var(--gray-300)' }}>
        {template.thumbnail} {template.name}
      </div>

      {/* Map Canvas */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: getCursor() }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`${pan.x} ${pan.y} ${MAP_W / zoom} ${MAP_H / zoom}`}
          style={{ display: 'block', touchAction: 'none' }}
        >
          {/* Background terrain */}
          <rect x="-1000" y="-1000" width="3000" height="3000" fill={template.terrain || '#3d6b47'} />

          {/* Render all scenario elements from template data */}
          {template.elements.map((el, idx) => renderElement(el, idx))}

          {/* Arrow marker for paths */}
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
            </marker>
          </defs>

          {/* Completed paths */}
          {paths.map(path => (
            <g key={path.id}>
              <polyline
                points={path.points.map(p => `${p.x},${p.y}`).join(' ')}
                stroke={path.color || '#22d3ee'}
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                markerEnd="url(#arrow)"
              />
              {path.drawnBy && (
                <text x={path.points[0]?.x || 0} y={(path.points[0]?.y || 0) - 8} fill="#22d3ee" fontSize="8" fontWeight="bold">by {path.drawnBy}</text>
              )}
            </g>
          ))}

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
              <circle cx={marker.x} cy={marker.y} r="18" fill={marker.color} fillOpacity="0.25" stroke={marker.color} strokeWidth="2" />
              <text x={marker.x} y={marker.y + 6} textAnchor="middle" fontSize="18">{marker.icon}</text>
              <text x={marker.x} y={marker.y + 26} textAnchor="middle" fill="#f3f4f6" fontSize="9" fontWeight="bold">{marker.label}</text>
              {marker.placedBy && (
                <text x={marker.x} y={marker.y + 36} textAnchor="middle" fill="#60a5fa" fontSize="7">by {marker.placedBy}</text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.4rem 1rem', background: 'rgba(15,23,42,0.95)',
        borderTop: '1px solid var(--gray-700)', fontSize: '0.75rem', color: 'var(--gray-400)'
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
                  const newPath = { id: Date.now(), points: drawingPath.points, color: '#22d3ee', drawnBy: user?.chestNo || user?.name || 'Unknown' };
                  setPaths(prev => [...prev, newPath]);
                  socket.emit('mapUpdate', { roomId, type: 'path', path: newPath, userId: user?._id, chestNo: user?.chestNo });
                  setDrawingPath(null);
                }
              }}
            >
              ✅ Finish Route
            </button>
          )}
          <button
            className="btn btn-sm btn-secondary"
            onClick={(e) => { e.stopPropagation(); handleUndo(); }}
          >
            ↩ Undo
          </button>
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
});

export default PlanningMap;
