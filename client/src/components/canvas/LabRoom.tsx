import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function LabRoom() {
  // Procedural floor
  const floorSize = 20;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial 
          color="#e0e0e0" 
          roughness={0.1} 
          metalness={0.1}
        />
      </mesh>

      {/* Grid helper for that "lab" feel on the floor, slightly raised */}
      <gridHelper args={[floorSize, floorSize, 0x06b6d4, 0xcccccc]} position={[0, 0.01, 0]} />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#ffffff" emissive="#333333" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2, -floorSize / 2]}>
        <boxGeometry args={[floorSize, 4, 0.2]} />
        <meshStandardMaterial color="#f8f9fa" />
      </mesh>
      <mesh position={[0, 2, floorSize / 2]}>
        <boxGeometry args={[floorSize, 4, 0.2]} />
        <meshStandardMaterial color="#f8f9fa" />
      </mesh>
      <mesh position={[-floorSize / 2, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[floorSize, 4, 0.2]} />
        <meshStandardMaterial color="#f8f9fa" />
      </mesh>
      <mesh position={[floorSize / 2, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[floorSize, 4, 0.2]} />
        <meshStandardMaterial color="#f8f9fa" />
      </mesh>

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3.5, 0]} intensity={1} castShadow />
      <rectAreaLight width={10} height={10} color="#ffffff" intensity={2} position={[0, 4, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}
