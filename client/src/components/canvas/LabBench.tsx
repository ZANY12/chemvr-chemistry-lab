import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import * as THREE from 'three';

interface LabBenchProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  showSink?: boolean;
}

export function LabBench({ position, rotation = [0, 0, 0], length = 2.5, showSink = false }: LabBenchProps) {
  const [waterTemp, setWaterTemp] = useState<'none' | 'hot' | 'cold'>('none');
  const waterRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (waterRef.current && waterTemp !== 'none') {
      waterRef.current.children.forEach((child: any, i) => {
        child.position.y -= 0.05;
        if (child.position.y < -0.4) {
          child.position.y = 0;
          child.position.x = (Math.random() - 0.5) * 0.02;
          child.position.z = (Math.random() - 0.5) * 0.02;
        }
      });
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Cabinet Base */}
      <Box args={[length, 0.9, 0.8]} position={[0, 0.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f3f4f6" roughness={0.3} />
      </Box>

      {/* Cabinet Doors/Drawers */}
      {Array.from({ length: Math.floor(length) }).map((_, i) => (
        <group key={i} position={[(i - (length - 1) / 2) * 0.8, 0.45, 0.41]}>
          <Box args={[0.7, 0.8, 0.02]}>
            <meshStandardMaterial color="#e5e7eb" />
          </Box>
          <Box args={[0.1, 0.02, 0.03]} position={[0, 0.3, 0.01]}>
            <meshStandardMaterial color="#9ca3af" metalness={0.8} />
          </Box>
        </group>
      ))}

      {/* Counter Top */}
      <Box args={[length + 0.1, 0.05, 0.9]} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.5} />
      </Box>

      {/* Sink Component */}
      {showSink && (
        <group position={[length / 2 - 0.6, 0.9, 0]}>
          {/* Basin */}
          <Box args={[0.6, 0.4, 0.5]} position={[0, -0.2, 0]}>
            <meshStandardMaterial color="#374151" metalness={0.8} />
          </Box>
          
          {/* Tap Structure */}
          <group position={[0, 0.05, -0.2]}>
            <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.15, 0]}>
              <meshStandardMaterial color="#9ca3af" metalness={0.9} />
            </Cylinder>
            <Cylinder args={[0.02, 0.02, 0.1]} position={[0, 0.3, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#9ca3af" metalness={0.9} />
            </Cylinder>

            {/* Hot Button */}
            <Interactive onSelect={() => setWaterTemp(prev => prev === 'hot' ? 'none' : 'hot')}>
              <mesh position={[-0.08, 0.05, 0.05]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.02]} />
                <meshStandardMaterial color={waterTemp === 'hot' ? '#ef4444' : '#991b1b'} />
              </mesh>
            </Interactive>

            {/* Cold Button */}
            <Interactive onSelect={() => setWaterTemp(prev => prev === 'cold' ? 'none' : 'cold')}>
              <mesh position={[0.08, 0.05, 0.05]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.02]} />
                <meshStandardMaterial color={waterTemp === 'cold' ? '#3b82f6' : '#1e3a8a'} />
              </mesh>
            </Interactive>

            {/* Water Flow Simulation */}
            {waterTemp !== 'none' && (
              <group ref={waterRef} position={[0, 0.28, 0.1]}>
                {Array.from({ length: 15 }).map((_, i) => (
                  <Sphere key={i} args={[0.01, 8, 8]} position={[0, -Math.random() * 0.4, 0]}>
                    <meshBasicMaterial 
                      color={waterTemp === 'hot' ? '#ff9999' : '#99ccff'} 
                      transparent 
                      opacity={0.6} 
                    />
                  </Sphere>
                ))}
              </group>
            )}
          </group>
        </group>
      )}
    </group>
  );
}

export function SafetyStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Wall Rack */}
      <Box args={[1.5, 0.05, 0.4]} position={[0, 1.2, 0.2]}>
        <meshStandardMaterial color="#374151" />
      </Box>

      {/* Lab Coat (Simplified) */}
      <group position={[-0.4, 0.8, 0.3]}>
        <Box args={[0.4, 0.8, 0.1]} castShadow>
          <meshStandardMaterial color="white" roughness={1} />
        </Box>
        <Box args={[0.1, 0.6, 0.1]} position={[-0.2, 0.1, 0]} rotation={[0, 0, 0.2]}>
          <meshStandardMaterial color="white" />
        </Box>
        <Box args={[0.1, 0.6, 0.1]} position={[0.2, 0.1, 0]} rotation={[0, 0, -0.2]}>
          <meshStandardMaterial color="white" />
        </Box>
      </group>

      {/* Goggles */}
      <group position={[0.1, 1.25, 0.3]}>
        <Box args={[0.2, 0.08, 0.05]} castShadow>
          <meshPhysicalMaterial color="#94a3b8" transparent opacity={0.4} transmission={0.9} />
        </Box>
        <Cylinder args={[0.005, 0.005, 0.2]} position={[0.1, 0, -0.05]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="black" />
        </Cylinder>
        <Cylinder args={[0.005, 0.005, 0.2]} position={[-0.1, 0, -0.05]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="black" />
        </Cylinder>
      </group>

      {/* Gloves */}
      <group position={[0.5, 1.25, 0.3]}>
        <Box args={[0.15, 0.2, 0.02]} rotation={[0, 0, 0.2]} castShadow>
          <meshStandardMaterial color="#60a5fa" roughness={0.5} />
        </Box>
        <Box args={[0.15, 0.2, 0.02]} position={[0.1, 0, 0.01]} rotation={[0, 0, -0.2]} castShadow>
          <meshStandardMaterial color="#60a5fa" roughness={0.5} />
        </Box>
      </group>
    </group>
  );
}
