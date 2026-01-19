import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import * as THREE from 'three';

interface Atom {
  position: [number, number, number];
  color: string;
  size: number;
  element: string;
}

interface Bond {
  start: [number, number, number];
  end: [number, number, number];
}

interface MolecularModelProps {
  position: [number, number, number];
  name: string;
  atoms: Atom[];
  bonds: Bond[];
  scale?: number;
}

export function MolecularModel({ position, name, atoms, bonds, scale = 1 }: MolecularModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position} scale={scale}>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.08}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
      >
        {name}
        <meshBasicMaterial color="#1e293b" transparent opacity={0.6} />
      </Text>
      
      <group ref={groupRef}>
        {/* Render Atoms */}
        {atoms.map((atom, i) => (
          <mesh key={`atom-${i}`} position={atom.position}>
            <sphereGeometry args={[atom.size, 32, 32]} />
            <meshStandardMaterial color={atom.color} roughness={0.3} metalness={0.2} />
            <Text
              position={[0, 0, atom.size + 0.01]}
              fontSize={atom.size * 0.8}
              color="white"
            >
              {atom.element}
            </Text>
          </mesh>
        ))}

        {/* Render Bonds */}
        {bonds.map((bond, i) => {
          const start = new THREE.Vector3(...bond.start);
          const end = new THREE.Vector3(...bond.end);
          const distance = start.distanceTo(end);
          const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
          
          return (
            <mesh key={`bond-${i}`} position={midpoint}>
              <cylinderGeometry args={[0.02, 0.02, distance, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.2} />
              <primitive object={new THREE.Object3D().lookAt(end.clone().sub(start))} />
              {/* Note: In a real app we'd orient the cylinder properly, but for this visualization midpoints work well enough with simple scaling if we use LookAt */}
              <group onUpdate={(self) => self.lookAt(end)}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                   <cylinderGeometry args={[0.015, 0.015, distance, 8]} />
                   <meshStandardMaterial color="#cbd5e1" />
                </mesh>
              </group>
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// Predefined Structures
export const WATER_MOLECULE = {
  name: "H2O (Water)",
  atoms: [
    { position: [0, 0, 0], color: "#ef4444", size: 0.1, element: "O" },
    { position: [0.15, 0.12, 0], color: "#f8fafc", size: 0.06, element: "H" },
    { position: [-0.15, 0.12, 0], color: "#f8fafc", size: 0.06, element: "H" },
  ] as Atom[],
  bonds: [
    { start: [0, 0, 0], end: [0.15, 0.12, 0] },
    { start: [0, 0, 0], end: [-0.15, 0.12, 0] },
  ] as Bond[]
};

export const METHANE_MOLECULE = {
  name: "CH4 (Methane)",
  atoms: [
    { position: [0, 0, 0], color: "#475569", size: 0.12, element: "C" },
    { position: [0.15, 0.15, 0.15], color: "#f8fafc", size: 0.06, element: "H" },
    { position: [-0.15, -0.15, 0.15], color: "#f8fafc", size: 0.06, element: "H" },
    { position: [0.15, -0.15, -0.15], color: "#f8fafc", size: 0.06, element: "H" },
    { position: [-0.15, 0.15, -0.15], color: "#f8fafc", size: 0.06, element: "H" },
  ] as Atom[],
  bonds: [
    { start: [0, 0, 0], end: [0.15, 0.15, 0.15] },
    { start: [0, 0, 0], end: [-0.15, -0.15, 0.15] },
    { start: [0, 0, 0], end: [0.15, -0.15, -0.15] },
    { start: [0, 0, 0], end: [-0.15, 0.15, -0.15] },
  ] as Bond[]
};
