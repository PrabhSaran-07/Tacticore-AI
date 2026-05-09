import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import socket from '../../services/socket';
import villageMapImg from '../../assets/village_map.png';
import fireTruckIconImg from '../../assets/fire_truck.png';
import personIconImg from '../../assets/person.png';

// Custom Icons
const fireTruckIcon = L.icon({
  iconUrl: fireTruckIconImg,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const personIcon = L.icon({
  iconUrl: personIconImg,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

export default function PlanningMap({ roomId = 'room-1', activeMode }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const resourcesRef = useRef({});
  const [resources, setResources] = useState([]);
  const currentPathRef = useRef(null);

  // Initialize Map Only Once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 2,
    });

    const bounds = [[0, 0], [1000, 1000]];
    L.imageOverlay(villageMapImg, bounds).addTo(mapInstance.current);
    mapInstance.current.fitBounds(bounds);

    socket.on('mapUpdate', (data) => {
      if (data.action === 'add' || data.action === 'move') {
        addResourceToMap(data.resource);
      }
    });

    socket.on('drawPath', (data) => {
      L.polyline(data.path, { color: '#f59e0b', weight: 4, dashArray: '10, 10' }).addTo(mapInstance.current);
    });

    return () => {
      socket.off('mapUpdate');
      socket.off('drawPath');
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // Run once on mount

  // Handle Mode-Dependent Click Logic
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove previous click handlers to prevent duplicates
    mapInstance.current.off('click');

    mapInstance.current.on('click', (e) => {
      if (activeMode === 'add_truck' || activeMode === 'add_person') {
        const type = activeMode === 'add_truck' ? 'truck' : 'person';
        const newResource = {
          id: Date.now().toString(),
          name: type === 'truck' ? 'Fire Truck' : 'Volunteer',
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          type: type
        };
        addResourceToMap(newResource);
        socket.emit('mapUpdate', { roomId, resource: newResource, action: 'add' });
      } else if (activeMode === 'draw_path') {
        if (!currentPathRef.current) {
          currentPathRef.current = L.polyline([e.latlng], { color: '#f59e0b', weight: 4, dashArray: '10, 10' }).addTo(mapInstance.current);
        } else {
          currentPathRef.current.addLatLng(e.latlng);
          const latlngs = currentPathRef.current.getLatLngs();
          socket.emit('drawPath', { roomId, path: latlngs });
        }
      }
    });

    // Reset path if switching modes
    if (activeMode !== 'draw_path') {
      currentPathRef.current = null;
    }
  }, [activeMode, roomId]);

  const addResourceToMap = (resource) => {
    if (!mapInstance.current) return;
    
    // Check if it already exists
    if (resourcesRef.current[resource.id]) {
      resourcesRef.current[resource.id].setLatLng([resource.lat, resource.lng]);
      return;
    }

    const icon = resource.type === 'truck' ? fireTruckIcon : personIcon;
    const marker = L.marker([resource.lat, resource.lng], { 
      icon: icon,
      draggable: true 
    }).addTo(mapInstance.current);

    marker.bindPopup(`<div class="text-sm"><strong>${resource.name}</strong></div>`);

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      const updatedResource = { ...resource, lat: pos.lat, lng: pos.lng };
      socket.emit('mapUpdate', { roomId, resource: updatedResource, action: 'move' });
    });

    resourcesRef.current[resource.id] = marker;
  };

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapRef}
        className="w-full h-full bg-slate-900"
        style={{ minHeight: '400px' }}
      />
      <div style={{
        position: 'absolute', bottom: '10px', right: '10px',
        background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '5px',
        fontSize: '0.75rem', zIndex: 1000, pointerEvents: 'none'
      }}>
        Mode: {activeMode.replace('_', ' ').toUpperCase()}
      </div>
    </div>
  );
}
