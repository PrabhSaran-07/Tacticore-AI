import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Billboard, Text, Sphere, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import socket from '../../services/socket';
import villageMapImg from '../../assets/village_map.png';
import fireTruckImg from '../../assets/fire_truck.png';
import personImg from '../../assets/person.png';

// 3D Resource Component
function Resource3D({ resource, onDrag }) {
  const texture = useLoader(THREE.TextureLoader, resource.type === 'truck' ? fireTruckImg : personImg);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[resource.x, 2, resource.z]}>
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <mesh 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[15, 15]} />
          <meshBasicMaterial map={texture} transparent={true} />
        </mesh>
      </Billboard>
      <Text
        position={[0, 10, 0]}
        fontSize={4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {resource.name}
      </Text>
    </group>
  );
}

// Map Surface with Click Handler
function MapSurface({ onMapClick }) {
  const villageTexture = useLoader(THREE.TextureLoader, villageMapImg);
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      onPointerDown={(e) => {
        e.stopPropagation();
        onMapClick(e.point);
      }}
    >
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial map={villageTexture} />
    </mesh>
  );
}

// Path Line Component
function PlanningPath({ path }) {
  if (path.length < 2) return null;
  const points = path.map(p => new THREE.Vector3(p.x, 1, p.z));
  return <Line points={points} color="#f59e0b" lineWidth={3} dashed={true} dashScale={0.5} />;
}

export default function PlanningMap3D({ roomId = 'room-1', activeMode }) {
  const [resources, setResources] = useState([]);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  
  useEffect(() => {
    socket.on('mapUpdate', (data) => {
      if (data.action === 'add') {
        setResources(prev => [...prev, data.resource]);
      } else if (data.action === 'move') {
        setResources(prev => prev.map(r => r.id === data.resource.id ? data.resource : r));
      }
    });

    socket.on('drawPath', (data) => {
      setPaths(prev => [...prev, data.path]);
    });

    return () => {
      socket.off('mapUpdate');
      socket.off('drawPath');
    };
  }, []);

  const handleMapClick = (point) => {
    if (activeMode === 'add_truck' || activeMode === 'add_person') {
      const type = activeMode === 'add_truck' ? 'truck' : 'person';
      const newResource = {
        id: Date.now().toString(),
        name: type === 'truck' ? 'Fire Truck' : 'Volunteer',
        x: point.x,
        z: point.z,
        type: type
      };
      setResources(prev => [...prev, newResource]);
      socket.emit('mapUpdate', { roomId, resource: newResource, action: 'add' });
    } else if (activeMode === 'draw_path') {
      const newPoint = { x: point.x, z: point.z };
      setCurrentPath(prev => {
        const updated = [...prev, newPoint];
        if (updated.length > 1) {
          socket.emit('drawPath', { roomId, path: updated });
        }
        return updated;
      });
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 300, 300], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[100, 200, 100]} intensity={2} />
        <Suspense fallback={null}>
          <MapSurface onMapClick={handleMapClick} />
          {resources.map(res => (
            <Resource3D key={res.id} resource={res} />
          ))}
          {paths.map((path, idx) => (
            <PlanningPath key={idx} path={path} />
          ))}
          {currentPath.length > 0 && <PlanningPath path={currentPath} />}
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
      
      {/* Help Overlay */}
      <div style={{
        position: 'absolute', bottom: '10px', right: '10px',
        background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '5px',
        fontSize: '0.75rem', pointerEvents: 'none'
      }}>
        Left Click: Place/Action | Right Click: Rotate | Scroll: Zoom
      </div>
    </div>
  );
}
