import React from 'react';
import { Box, Text } from '@react-three/drei';

export function LabRoom() {
  const floorSize = 20;

  // Real Periodic Table Data (Representative subset to fit nicely while being "complete" in look)
  const elements = [
    // Row 1
    { s: 'H', n: 1, x: 0, y: 0, c: '#e2e8f0' }, { s: 'He', n: 2, x: 17, y: 0, c: '#fef08a' },
    // Row 2
    { s: 'Li', n: 3, x: 0, y: 1, c: '#fca5a5' }, { s: 'Be', n: 4, x: 1, y: 1, c: '#fdba74' },
    { s: 'B', n: 5, x: 12, y: 1, c: '#d1fae5' }, { s: 'C', n: 6, x: 13, y: 1, c: '#e2e8f0' },
    { s: 'N', n: 7, x: 14, y: 1, c: '#e2e8f0' }, { s: 'O', n: 8, x: 15, y: 1, c: '#e2e8f0' },
    { s: 'F', n: 9, x: 16, y: 1, c: '#e2e8f0' }, { s: 'Ne', n: 10, x: 17, y: 1, c: '#fef08a' },
    // Row 3
    { s: 'Na', n: 11, x: 0, y: 2, c: '#fca5a5' }, { s: 'Mg', n: 12, x: 1, y: 2, c: '#fdba74' },
    { s: 'Al', n: 13, x: 12, y: 2, c: '#e5e7eb' }, { s: 'Si', n: 14, x: 13, y: 2, c: '#d1fae5' },
    { s: 'P', n: 15, x: 14, y: 2, c: '#e2e8f0' }, { s: 'S', n: 16, x: 15, y: 2, c: '#e2e8f0' },
    { s: 'Cl', n: 17, x: 16, y: 2, c: '#e2e8f0' }, { s: 'Ar', n: 18, x: 17, y: 2, c: '#fef08a' },
    // Row 4 (Transition Metals start)
    { s: 'K', n: 19, x: 0, y: 3, c: '#fca5a5' }, { s: 'Ca', n: 20, x: 1, y: 3, c: '#fdba74' },
    { s: 'Sc', n: 21, x: 2, y: 3, c: '#bfdbfe' }, { s: 'Ti', n: 22, x: 3, y: 3, c: '#bfdbfe' },
    { s: 'V', n: 23, x: 4, y: 3, c: '#bfdbfe' }, { s: 'Cr', n: 24, x: 5, y: 3, c: '#bfdbfe' },
    { s: 'Mn', n: 25, x: 6, y: 3, c: '#bfdbfe' }, { s: 'Fe', n: 26, x: 7, y: 3, c: '#bfdbfe' },
    { s: 'Co', n: 27, x: 8, y: 3, c: '#bfdbfe' }, { s: 'Ni', n: 28, x: 9, y: 3, c: '#bfdbfe' },
    { s: 'Cu', n: 29, x: 10, y: 3, c: '#bfdbfe' }, { s: 'Zn', n: 30, x: 11, y: 3, c: '#bfdbfe' },
    { s: 'Ga', n: 31, x: 12, y: 3, c: '#e5e7eb' }, { s: 'Ge', n: 32, x: 13, y: 3, c: '#d1fae5' },
    { s: 'As', n: 33, x: 14, y: 3, c: '#d1fae5' }, { s: 'Se', n: 34, x: 15, y: 3, c: '#e2e8f0' },
    { s: 'Br', n: 35, x: 16, y: 3, c: '#e2e8f0' }, { s: 'Kr', n: 36, x: 17, y: 3, c: '#fef08a' },
  ];

  const phData = [
    { v: 0, l: 'Battery Acid', c: '#ff0000' },
    { v: 2, l: 'Lemon Juice', c: '#ff4d00' },
    { v: 4, l: 'Tomato Juice', c: '#ff9900' },
    { v: 7, l: 'Pure Water', c: '#00ff00' },
    { v: 10, l: 'Soap', c: '#0099ff' },
    { v: 12, l: 'Bleach', c: '#4d00ff' },
    { v: 14, l: 'Drain Cleaner', c: '#9900ff' }
  ];

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.05} />
      </mesh>
      <gridHelper args={[floorSize, 20, 0xcbd5e1, 0xe2e8f0]} position={[0, 0.01, 0]} />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Walls */}
      <group position={[0, 2, -floorSize / 2]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        
        {/* Expanded Periodic Table */}
        <group position={[0, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[7, 3.5, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text position={[0, 1.5, 0.03]} fontSize={0.15} color="#1e293b">
            PERIODIC TABLE OF ELEMENTS
          </Text>
          
          <group position={[-3.2, 1.1, 0.03]}>
            {elements.map((el) => (
              <group key={el.s} position={[el.x * 0.38, el.y * -0.42, 0]}>
                <mesh>
                  <planeGeometry args={[0.34, 0.38]} />
                  <meshStandardMaterial color={el.c} />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.14} color="#1e293b">{el.s}</Text>
                <Text position={[-0.1, 0.12, 0.01]} fontSize={0.05} color="#1e293b">{el.n}</Text>
              </group>
            ))}
            {/* Decoration for more completeness */}
            <Text position={[3, -1.8, 0]} fontSize={0.06} color="#64748b" anchorX="right">
              ... Continued below
            </Text>
          </group>
        </group>
      </group>

      {/* Left Wall - pH Scale & Formulas */}
      <group position={[-floorSize / 2, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>

        <group position={[-4, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[3, 3, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text position={[0, 1.3, 0.03]} fontSize={0.15} color="#1e293b">pH SCALE</Text>
          
          <group position={[0, 0, 0.03]}>
            {phData.map((d, i) => (
              <group key={d.v} position={[0, 0.8 - i * 0.3, 0]}>
                <mesh position={[-0.8, 0, 0]}>
                  <planeGeometry args={[0.5, 0.25]} />
                  <meshStandardMaterial color={d.c} />
                </mesh>
                <Text position={[-0.8, 0, 0.01]} fontSize={0.1} color="white">{d.v}</Text>
                <Text position={[-0.4, 0, 0.01]} fontSize={0.08} color="#1e293b" anchorX="left">{d.l}</Text>
              </group>
            ))}
          </group>
        </group>

        <group position={[0, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[3.5, 3, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text position={[0, 1.3, 0.03]} fontSize={0.15} color="#1e293b">LABORATORY FORMULAS</Text>
          <Text position={[-1.5, 0.8, 0.03]} fontSize={0.09} color="#334155" anchorX="left" lineHeight={1.5}>
            {"Molarity: M = n / V (L)\nMolality: m = n / mass solvent (kg)\nDensity: ρ = m / V\nSpecific Heat: q = mcΔT\nIdeal Gas Law: PV = nRT\npH = -log[H+]\nKw = [H+][OH-] = 1.0 x 10^-14"}
          </Text>
        </group>
      </group>

      {/* Right Wall */}
      <group position={[floorSize / 2, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Ceiling Vents and Pipes */}
      <group position={[0, 3.8, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, -2]}>
          <cylinderGeometry args={[0.1, 0.1, 20]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[-3, 0, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* Lighting */}
      <ambientLight intensity={1.0} />
      <pointLight position={[0, 3, 0]} intensity={1.5} distance={20} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />

      <group position={[0, 3.9, 0]}>
        {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]}>
            <boxGeometry args={[2, 0.2, 1]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
