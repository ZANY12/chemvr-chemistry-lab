import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

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

      {/* Walls with trim */}
      {/* Back Wall */}
      <group position={[0, 2, -floorSize / 2]}>
        <Box args={[floorSize, 4, 0.2]} castShadow receiveShadow>
          <meshStandardMaterial color="#f3f4f6" />
        </Box>
        {/* Poster Placeholder */}
        <Box args={[2, 3, 0.05]} position={[0, 0.5, 0.15]}>
          <meshStandardMaterial color="#e5e7eb" />
        </Box>
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
      <Box args={[2, 0.1, 1]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </Box>
      <pointLight intensity={0.5} distance={10} />
    </group>
  );
}

function Box(props: any) {
  return (
    <mesh {...props}>
      <boxGeometry args={props.args} />
      {props.children}
    </mesh>
  );
}
