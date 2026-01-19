import React from 'react';
import { Box, Text } from '@react-three/drei';

// Helper to generate coordinates for all 118 elements
const getElementData = () => {
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
    // Row 4
    { s: 'K', n: 19, x: 0, y: 3, c: '#fca5a5' }, { s: 'Ca', n: 20, x: 1, y: 3, c: '#fdba74' },
    { s: 'Sc', n: 21, x: 2, y: 3, c: '#bfdbfe' }, { s: 'Ti', n: 22, x: 3, y: 3, c: '#bfdbfe' },
    { s: 'V', n: 23, x: 4, y: 3, c: '#bfdbfe' }, { s: 'Cr', n: 24, x: 5, y: 3, c: '#bfdbfe' },
    { s: 'Mn', n: 25, x: 6, y: 3, c: '#bfdbfe' }, { s: 'Fe', n: 26, x: 7, y: 3, c: '#bfdbfe' },
    { s: 'Co', n: 27, x: 8, y: 3, c: '#bfdbfe' }, { s: 'Ni', n: 28, x: 9, y: 3, c: '#bfdbfe' },
    { s: 'Cu', n: 29, x: 10, y: 3, c: '#bfdbfe' }, { s: 'Zn', n: 30, x: 11, y: 3, c: '#bfdbfe' },
    { s: 'Ga', n: 31, x: 12, y: 3, c: '#e5e7eb' }, { s: 'Ge', n: 32, x: 13, y: 3, c: '#d1fae5' },
    { s: 'As', n: 33, x: 14, y: 3, c: '#d1fae5' }, { s: 'Se', n: 34, x: 15, y: 3, c: '#e2e8f0' },
    { s: 'Br', n: 35, x: 16, y: 3, c: '#e2e8f0' }, { s: 'Kr', n: 36, x: 17, y: 3, c: '#fef08a' },
    // Row 5
    { s: 'Rb', n: 37, x: 0, y: 4, c: '#fca5a5' }, { s: 'Sr', n: 38, x: 1, y: 4, c: '#fdba74' },
    { s: 'Y', n: 39, x: 2, y: 4, c: '#bfdbfe' }, { s: 'Zr', n: 40, x: 3, y: 4, c: '#bfdbfe' },
    { s: 'Nb', n: 41, x: 4, y: 4, c: '#bfdbfe' }, { s: 'Mo', n: 42, x: 5, y: 4, c: '#bfdbfe' },
    { s: 'Tc', n: 43, x: 6, y: 4, c: '#bfdbfe' }, { s: 'Ru', n: 44, x: 7, y: 4, c: '#bfdbfe' },
    { s: 'Rh', n: 45, x: 8, y: 4, c: '#bfdbfe' }, { s: 'Pd', n: 46, x: 9, y: 4, c: '#bfdbfe' },
    { s: 'Ag', n: 47, x: 10, y: 4, c: '#bfdbfe' }, { s: 'Cd', n: 48, x: 11, y: 4, c: '#bfdbfe' },
    { s: 'In', n: 49, x: 12, y: 4, c: '#e5e7eb' }, { s: 'Sn', n: 50, x: 13, y: 4, c: '#e5e7eb' },
    { s: 'Sb', n: 51, x: 14, y: 4, c: '#d1fae5' }, { s: 'Te', n: 52, x: 15, y: 4, c: '#d1fae5' },
    { s: 'I', n: 53, x: 16, y: 4, c: '#e2e8f0' }, { s: 'Xe', n: 54, x: 17, y: 4, c: '#fef08a' },
    // Row 6
    { s: 'Cs', n: 55, x: 0, y: 5, c: '#fca5a5' }, { s: 'Ba', n: 56, x: 1, y: 5, c: '#fdba74' },
    { s: 'Lu', n: 71, x: 2, y: 5, c: '#bfdbfe' }, { s: 'Hf', n: 72, x: 3, y: 5, c: '#bfdbfe' },
    { s: 'Ta', n: 73, x: 4, y: 5, c: '#bfdbfe' }, { s: 'W', n: 74, x: 5, y: 5, c: '#bfdbfe' },
    { s: 'Re', n: 75, x: 6, y: 5, c: '#bfdbfe' }, { s: 'Os', n: 76, x: 7, y: 5, c: '#bfdbfe' },
    { s: 'Ir', n: 77, x: 8, y: 5, c: '#bfdbfe' }, { s: 'Pt', n: 78, x: 9, y: 5, c: '#bfdbfe' },
    { s: 'Au', n: 79, x: 10, y: 5, c: '#bfdbfe' }, { s: 'Hg', n: 80, x: 11, y: 5, c: '#bfdbfe' },
    { s: 'Tl', n: 81, x: 12, y: 5, c: '#e5e7eb' }, { s: 'Pb', n: 82, x: 13, y: 5, c: '#e5e7eb' },
    { s: 'Bi', n: 83, x: 14, y: 5, c: '#e5e7eb' }, { s: 'Po', n: 84, x: 15, y: 5, c: '#d1fae5' },
    { s: 'At', n: 85, x: 16, y: 5, c: '#d1fae5' }, { s: 'Rn', n: 86, x: 17, y: 5, c: '#fef08a' },
    // Row 7
    { s: 'Fr', n: 87, x: 0, y: 6, c: '#fca5a5' }, { s: 'Ra', n: 88, x: 1, y: 6, c: '#fdba74' },
    { s: 'Lr', n: 103, x: 2, y: 6, c: '#bfdbfe' }, { s: 'Rf', n: 104, x: 3, y: 6, c: '#bfdbfe' },
    { s: 'Db', n: 105, x: 4, y: 6, c: '#bfdbfe' }, { s: 'Sg', n: 106, x: 5, y: 6, c: '#bfdbfe' },
    { s: 'Bh', n: 107, x: 6, y: 6, c: '#bfdbfe' }, { s: 'Hs', n: 108, x: 7, y: 6, c: '#bfdbfe' },
    { s: 'Mt', n: 109, x: 8, y: 6, c: '#bfdbfe' }, { s: 'Ds', n: 110, x: 9, y: 6, c: '#bfdbfe' },
    { s: 'Rg', n: 111, x: 10, y: 6, c: '#bfdbfe' }, { s: 'Cn', n: 112, x: 11, y: 6, c: '#bfdbfe' },
    { s: 'Nh', n: 113, x: 12, y: 6, c: '#e5e7eb' }, { s: 'Fl', n: 114, x: 13, y: 6, c: '#e5e7eb' },
    { s: 'Mc', n: 115, x: 14, y: 6, c: '#e5e7eb' }, { s: 'Lv', n: 116, x: 15, y: 6, c: '#e5e7eb' },
    { s: 'Ts', n: 117, x: 16, y: 6, c: '#e5e7eb' }, { s: 'Og', n: 118, x: 17, y: 6, c: '#fef08a' },
    // Lanthanides
    ...[57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70].map((n, i) => ({ s: `L${n}`, n, x: i + 3, y: 7.5, c: '#ddd6fe' })),
    // Actinides
    ...[89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102].map((n, i) => ({ s: `A${n}`, n, x: i + 3, y: 8.5, c: '#fbcfe8' })),
  ];
  return elements;
};

export function LabRoom() {
  const floorSize = 20;
  const elements = getElementData();

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
      {/* Floor with professional tiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.1} metalness={0.02} />
      </mesh>
      <gridHelper args={[floorSize, 40, 0x94a3b8, 0xe2e8f0]} position={[0, 0.01, 0]} />

      {/* Ceiling with structural details */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Industrial Ceiling Pipes */}
      <group position={[0, 3.8, 0]}>
        {[ -2, 0, 2 ].map((z) => (
          <mesh key={z} rotation={[0, 0, Math.PI / 2]} position={[0, 0, z]}>
            <cylinderGeometry args={[0.08, 0.08, floorSize]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[-3, 0.1, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.6]} />
          <meshStandardMaterial color="#475569" metalness={0.5} />
        </mesh>
      </group>

      {/* Walls with professional finish */}
      <group position={[0, 2, -floorSize / 2]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
        
        {/* Periodic Table Poster */}
        <group position={[0, 0.4, 0.15]}>
          <mesh>
            <boxGeometry args={[9.5, 3.8, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.1} />
          </mesh>
          <Text position={[0, 1.7, 0.03]} fontSize={0.12} color="#1e293b" fontWeight="bold">
            PERIODIC TABLE OF ELEMENTS
          </Text>
          
          <group position={[-4.3, 1.3, 0.03]}>
            {elements.map((el) => (
              <group key={el.s} position={[el.x * 0.5, el.y * -0.32, 0]}>
                <mesh>
                  <planeGeometry args={[0.45, 0.28]} />
                  <meshStandardMaterial color={el.c} />
                </mesh>
                <Text position={[0, -0.02, 0.01]} fontSize={0.1} color="#1e293b" fontWeight="bold">{el.s}</Text>
                <Text position={[-0.15, 0.08, 0.01]} fontSize={0.04} color="#1e293b">{el.n}</Text>
              </group>
            ))}
          </group>
        </group>
      </group>

      {/* Left Wall Poster Group */}
      <group position={[-floorSize / 2, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>

        <group position={[-4, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[3, 3, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.1} />
          </mesh>
          <Text position={[0, 1.3, 0.03]} fontSize={0.15} color="#1e293b" fontWeight="bold">pH SCALE</Text>
          
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
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.1} />
          </mesh>
          <Text position={[0, 1.3, 0.03]} fontSize={0.15} color="#1e293b" fontWeight="bold">LABORATORY FORMULAS</Text>
          <Text position={[-1.5, 0.8, 0.03]} fontSize={0.09} color="#334155" anchorX="left" lineHeight={1.5}>
            {"Molarity: M = n / V (L)\nMolality: m = n / mass solvent (kg)\nDensity: ρ = m / V\nSpecific Heat: q = mcΔT\nIdeal Gas Law: PV = nRT\npH = -log[H+]\nKw = [H+][OH-] = 1.0 x 10^-14"}
          </Text>
        </group>
      </group>

      {/* Right Wall */}
      <group position={[floorSize / 2, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
      </group>

      {/* Lighting Setup for Realism */}
      <ambientLight intensity={0.6} />
      
      {/* High-quality overhead panel lights */}
      <group position={[0, 3.9, 0]}>
        {[
          [-4, -4], [0, -4], [4, -4],
          [-4, 0], [0, 0], [4, 0],
          [-4, 4], [0, 4], [4, 4]
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh>
              <boxGeometry args={[1.5, 0.1, 0.8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
            </mesh>
            <rectAreaLight 
              width={1.5} 
              height={0.8} 
              intensity={2} 
              color="#ffffff" 
              position={[0, -0.1, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
            />
          </group>
        ))}
      </group>

      {/* Subtle environment probes for reflections */}
      <pointLight position={[0, 3, 0]} intensity={0.5} distance={15} color="#f8fafc" />
    </group>
  );
}
