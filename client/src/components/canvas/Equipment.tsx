import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { Text, Cylinder, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

interface DraggableItemProps {
  position: [number, number, number];
  color: string;
  type: 'flask' | 'beaker' | 'cube';
  name: string;
  onSelect?: () => void;
}

export function DraggableItem({ position: initialPos, color, type, name, onSelect }: DraggableItemProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  
  const onSelectStart = () => {
    setSelected(true);
    onSelect?.();
  };
  
  const onSelectEnd = () => {
    setSelected(false);
  };

  return (
    <Interactive 
      onSelectStart={onSelectStart} 
      onSelectEnd={onSelectEnd}
      onHover={() => setHovered(true)} 
      onBlur={() => setHovered(false)}
    >
      <group position={initialPos} ref={meshRef}>
        {hovered && (
          <Text
            position={[0, 0.35, 0]}
            fontSize={0.06}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {name}
            <meshBasicMaterial color="#111827" transparent opacity={0.8} depthTest={false} />
          </Text>
        )}

        {selected && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#06b6d4" wireframe />
          </mesh>
        )}

        {type === 'beaker' && (
          <group>
            <Cylinder args={[0.08, 0.08, 0.2, 16]} position={[0, 0.1, 0]} castShadow>
              <meshPhysicalMaterial 
                color="#e2e8f0" 
                transparent 
                opacity={0.6} 
                transmission={0.5} 
                roughness={0.05}
                thickness={0.1}
                ior={1.5}
                reflectivity={1}
                clearcoat={1}
              />
            </Cylinder>
            <Cylinder args={[0.07, 0.07, 0.15, 16]} position={[0, 0.08, 0]}>
               <meshStandardMaterial color={color} transparent opacity={0.8} />
            </Cylinder>
          </group>
        )}

        {type === 'flask' && (
          <group>
            <Cylinder args={[0.02, 0.04, 0.1, 16]} position={[0, 0.2, 0]} castShadow>
               <meshPhysicalMaterial 
                color="#e2e8f0" 
                transparent 
                opacity={0.6} 
                transmission={0.5} 
                roughness={0.05}
                reflectivity={1}
                clearcoat={1}
              />
            </Cylinder>
            <Sphere args={[0.1, 16, 16]} position={[0, 0.05, 0]} scale={[1, 0.8, 1]} castShadow>
              <meshPhysicalMaterial 
                color="#e2e8f0" 
                transparent 
                opacity={0.6} 
                transmission={0.5} 
                roughness={0.05}
                reflectivity={1}
                clearcoat={1}
              />
            </Sphere>
             <Sphere args={[0.09, 16, 16]} position={[0, 0.05, 0]} scale={[1, 0.8, 1]}>
               <meshStandardMaterial color={color} transparent opacity={0.8} />
            </Sphere>
          </group>
        )}
        
        {type === 'cube' && (
          <Box args={[0.15, 0.15, 0.15]} position={[0, 0.075, 0]} castShadow>
             <meshStandardMaterial color={color} />
          </Box>
        )}
      </group>
    </Interactive>
  );
}

export function BunsenBurner({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (flameRef.current) {
       flameRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 10) * 0.2;
       flameRef.current.scale.x = 1 + Math.cos(clock.elapsedTime * 15) * 0.1;
    }
  });

  return (
    <group position={position}>
       <Cylinder args={[0.05, 0.08, 0.05, 16]} position={[0, 0.025, 0]}>
         <meshStandardMaterial color="#4b5563" metalness={0.8} />
       </Cylinder>
       <Cylinder args={[0.015, 0.015, 0.15, 16]} position={[0, 0.12, 0]}>
          <meshStandardMaterial color="#9ca3af" metalness={0.9} />
       </Cylinder>
       <mesh ref={flameRef} position={[0, 0.22, 0]}>
         <coneGeometry args={[0.02, 0.08, 8]} />
         <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
       </mesh>
       <pointLight position={[0, 0.25, 0]} color="#3b82f6" intensity={0.5} distance={1} />
    </group>
  );
}
