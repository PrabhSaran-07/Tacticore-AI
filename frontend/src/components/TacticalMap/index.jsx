import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix Leaflet default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function TacticalMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [units, setUnits] = useState([
    { id: 1, name: 'Alpha Squad', lat: 40.7128, lng: -74.006, team: 'blue', type: 'infantry' },
    { id: 2, name: 'Bravo Team', lat: 40.715, lng: -74.010, team: 'blue', type: 'support' },
    { id: 3, name: 'Enemy Force', lat: 40.720, lng: -73.995, team: 'red', type: 'enemy' },
  ]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.006], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    units.forEach(unit => {
      const color = unit.team === 'blue' ? '#3b82f6' : '#ef4444';
      const circle = L.circleMarker([unit.lat, unit.lng], {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstance.current);

      circle.bindPopup(`<div class="text-sm"><strong>${unit.name}</strong><br />${unit.type}</div>`);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg border border-slate-700"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
