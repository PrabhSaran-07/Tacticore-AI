import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import socket from '../../services/socket';

// Fix Leaflet default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function TacticalMap({ roomId = 'room-1' }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const pathsRef = useRef([]);
  const currentPathRef = useRef(null);
  
  const [mode, setMode] = useState('view'); // 'view', 'add_marker', 'draw_path'

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.006], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Click on map
    mapInstance.current.on('click', (e) => {
      if (mode === 'add_marker') {
        const newUnit = {
          id: Date.now().toString(),
          name: 'New Unit',
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          team: 'blue',
          type: 'infantry'
        };
        addMarkerToMap(newUnit);
        socket.emit('mapUpdate', { roomId, unit: newUnit, action: 'add' });
      } else if (mode === 'draw_path') {
        if (!currentPathRef.current) {
          currentPathRef.current = L.polyline([e.latlng], { color: 'red' }).addTo(mapInstance.current);
        } else {
          currentPathRef.current.addLatLng(e.latlng);
          const latlngs = currentPathRef.current.getLatLngs();
          socket.emit('drawPath', { roomId, path: latlngs });
        }
      }
    });

    socket.on('mapUpdate', (data) => {
      if (data.action === 'add' || data.action === 'move') {
        addMarkerToMap(data.unit);
      }
    });

    socket.on('drawPath', (data) => {
      L.polyline(data.path, { color: 'red' }).addTo(mapInstance.current);
    });

    // Initial dummy units
    const initialUnits = [
      { id: '1', name: 'Alpha Squad', lat: 40.7128, lng: -74.006, team: 'blue', type: 'infantry' },
      { id: '2', name: 'Bravo Team', lat: 40.715, lng: -74.010, team: 'blue', type: 'support' },
      { id: '3', name: 'Enemy Force', lat: 40.720, lng: -73.995, team: 'red', type: 'enemy' },
    ];
    initialUnits.forEach(addMarkerToMap);

    return () => {
      socket.off('mapUpdate');
      socket.off('drawPath');
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mode, roomId]);

  const addMarkerToMap = (unit) => {
    if (markersRef.current[unit.id]) {
      markersRef.current[unit.id].setLatLng([unit.lat, unit.lng]);
      return;
    }

    const color = unit.team === 'blue' ? '#3b82f6' : '#ef4444';
    const marker = L.circleMarker([unit.lat, unit.lng], {
      radius: 8,
      fillColor: color,
      color: color,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
      draggable: true // simulate draggable by handling events if it was a real marker
    }).addTo(mapInstance.current);

    // CircleMarker doesn't support draggable natively, so using standard marker for draggable
    const realMarker = L.marker([unit.lat, unit.lng], { draggable: true }).addTo(mapInstance.current);
    realMarker.bindPopup(`<div class="text-sm"><strong>${unit.name}</strong><br />${unit.type}</div>`);

    realMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      const updatedUnit = { ...unit, lat: pos.lat, lng: pos.lng };
      socket.emit('mapUpdate', { roomId, unit: updatedUnit, action: 'move' });
    });

    markersRef.current[unit.id] = realMarker;
    // remove circlemarker
    mapInstance.current.removeLayer(marker);
  };

  const endPath = () => {
    currentPathRef.current = null;
    setMode('view');
  };

  return (
    <div className="w-full h-full relative" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0.5rem', background: 'var(--gray-800)', display: 'flex', gap: '0.5rem' }}>
        <button className={`btn btn-sm ${mode === 'view' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('view')}>View</button>
        <button className={`btn btn-sm ${mode === 'add_marker' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('add_marker')}>Add Marker</button>
        <button className={`btn btn-sm ${mode === 'draw_path' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('draw_path')}>Draw Path</button>
        {mode === 'draw_path' && (
          <button className="btn btn-sm btn-danger" onClick={endPath}>Finish Path</button>
        )}
      </div>
      <div
        ref={mapRef}
        className="w-full h-full rounded-b-lg border-x border-b border-slate-700"
        style={{ minHeight: '400px', flex: 1 }}
      />
    </div>
  );
}
