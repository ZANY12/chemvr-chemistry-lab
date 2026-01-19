import React from 'react';
import { Box, Text } from '@react-three/drei';

export function LabRoom() {
  const floorSize = 20;

  return (
    <group>
      {/* Floor - High quality tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.05} 
          metalness={0.05}
        />
      </mesh>

      {/* Grid lines for floor tiles */}
      <gridHelper args={[floorSize, 20, 0xcccccc, 0xeeeeee]} position={[0, 0.01, 0]} />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Walls - Professional Off-White with baseboard trim */}
      {/* Back Wall (North) */}
      <group position={[0, 2, -floorSize / 2]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#f0f2f5" />
        </mesh>
        {/* Baseboard */}
        <mesh position={[0, -1.9, 0.11]}>
          <boxGeometry args={[floorSize, 0.2, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        
        {/* Periodic Table Chart */}
        <group position={[0, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[4, 2.5, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text
            position={[0, 1.1, 0.03]}
            fontSize={0.15}
            color="#1e293b"
            anchorX="center"
          >
            PERIODIC TABLE OF ELEMENTS
          </Text>
          {/* Simple visual representation of grid */}
          {Array.from({ length: 18 }).map((_, x) => (
            Array.from({ length: 7 }).map((_, y) => (
              <mesh key={`${x}-${y}`} position={[(x - 8.5) * 0.2, (3 - y) * 0.25 - 0.2, 0.03]}>
                <planeGeometry args={[0.18, 0.22]} />
                <meshStandardMaterial color={((x+y) % 5 === 0) ? "#ef4444" : "#3b82f6"} opacity={0.7} transparent />
              </mesh>
            ))
          ))}
        </group>
      </group>

      {/* Left Wall (West) - Formulas and pH Scale */}
      <group position={[-floorSize / 2, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#f0f2f5" />
        </mesh>
        <mesh position={[0, -1.9, 0.11]}>
          <boxGeometry args={[floorSize, 0.2, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>

        {/* pH Scale Chart */}
        <group position={[-3, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[2.5, 2, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text position={[0, 0.8, 0.03]} fontSize={0.12} color="#1e293b">pH SCALE</Text>
          {/* pH Colors */}
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={i} position={[0, (7-i) * 0.1 - 0.1, 0.03]}>
              <planeGeometry args={[2, 0.08]} />
              <meshStandardMaterial color={`hsl(${(i/14) * 280}, 70%, 50%)`} />
            </mesh>
          ))}
        </group>

        {/* Common Formulas Chart */}
        <group position={[3, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[2.5, 2, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text position={[0, 0.8, 0.03]} fontSize={0.12} color="#1e293b">COMMON FORMULAS</Text>
          <Text position={[-0.9, 0.4, 0.03]} fontSize={0.08} color="#334155" anchorX="left">
            {"n = m / M\nc = n / V\nPV = nRT\npH = -log[H+]\nE = mc²"}
          </Text>
        </group>
      </group>

      {/* Right Wall (East) */}
      <group position={[floorSize / 2, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#f0f2f5" />
        </mesh>
        <mesh position={[0, -1.9, 0.11]}>
          <boxGeometry args={[floorSize, 0.2, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Lighting - Professional Setup */}
      <ambientLight intensity={0.4} />
      
      {/* Key Lights (Fluorescent Style) */}
      <group position={[0, 3.9, 0]}>
        <RectLight pos={[0, 0, 0]} />
        <RectLight pos={[-5, 0, -5]} />
        <RectLight pos={[5, 0, -5]} />
        <RectLight pos={[-5, 0, 5]} />
        <RectLight pos={[5, 0, 5]} />
      </group>

      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
    </group>
  );
}

function RectLight({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      <pointLight intensity={0.5} distance={10} />
    </group>
  );
}
