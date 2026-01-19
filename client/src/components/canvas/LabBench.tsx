import React from 'react';
import { Box, Cylinder, Sphere } from '@react-three/drei';

interface LabBenchProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  showSink?: boolean;
}

export function LabBench({ position, rotation = [0, 0, 0], length = 2.5, showSink = false }: LabBenchProps) {
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

      {showSink && <Sink />}
    </group>
  );
}

function Sink() {
  return (
    <group position={[0.6, 0.9, 0]}>
      <Box args={[0.6, 0.4, 0.5]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#374151" metalness={0.8} />
      </Box>
      <group position={[0, 0.05, -0.2]}>
        <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.15, 0]}>
          <meshStandardMaterial color="#9ca3af" metalness={0.9} />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 0.1]} position={[0, 0.3, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#9ca3af" metalness={0.9} />
        </Cylinder>
      </group>
    </group>
  );
}

export function FumeHood({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box args={[2, 2.5, 1]} position={[0, 1.25, 0]} castShadow>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
      <Box args={[1.8, 1.2, 0.02]} position={[0, 1.2, 0.5]} castShadow>
        <meshPhysicalMaterial color="#94a3b8" transparent opacity={0.3} transmission={0.9} />
      </Box>
      <Box args={[1.8, 0.05, 0.9]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#111827" />
      </Box>
    </group>
  );
}

export function Microscope({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box args={[0.15, 0.02, 0.2]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#1f2937" />
      </Box>
      <Cylinder args={[0.02, 0.02, 0.25]} position={[0, 0.15, -0.05]}>
        <meshStandardMaterial color="#4b5563" />
      </Cylinder>
      <Cylinder args={[0.015, 0.015, 0.1]} position={[0, 0.25, 0.05]} rotation={[0.5, 0, 0]}>
        <meshStandardMaterial color="#111827" />
      </Cylinder>
    </group>
  );
}

export function SafetyStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box args={[1.5, 0.05, 0.4]} position={[0, 1.2, 0.2]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      <group position={[-0.4, 0.8, 0.3]}>
        <Box args={[0.4, 0.8, 0.1]} castShadow>
          <meshStandardMaterial color="white" roughness={1} />
        </Box>
      </group>
      {/* Emergency Shower and Eye Wash */}
      <group position={[0.4, 0.5, 0.2]}>
        <Cylinder args={[0.03, 0.03, 2.5]} position={[0, 1, 0]}>
           <meshStandardMaterial color="#9ca3af" metalness={0.9} />
        </Cylinder>
        <Cylinder args={[0.2, 0.1, 0.1]} position={[0, 2.2, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
           <meshStandardMaterial color="#16a34a" />
        </Cylinder>
        {/* Eye Wash Station */}
        <group position={[0, 0.6, 0.3]}>
          <Box args={[0.4, 0.1, 0.3]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#16a34a" />
          </Box>
          <Cylinder args={[0.01, 0.01, 0.1]} position={[-0.1, 0.1, 0]}>
            <meshStandardMaterial color="#9ca3af" />
          </Cylinder>
          <Cylinder args={[0.01, 0.01, 0.1]} position={[0.1, 0.1, 0]}>
            <meshStandardMaterial color="#9ca3af" />
          </Cylinder>
        </group>
      </group>
    </group>
  );
}

export function ComputerStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
       <Box args={[1.2, 0.05, 0.6]} position={[0, 0.75, 0]}>
         <meshStandardMaterial color="#1f2937" />
       </Box>
       {/* Monitor */}
       <group position={[0, 0.95, -0.2]}>
         <Box args={[0.6, 0.4, 0.02]}>
           <meshStandardMaterial color="#111827" emissive="#06b6d4" emissiveIntensity={0.2} />
         </Box>
         <Box args={[0.02, 0.15, 0.02]} position={[0, -0.2, 0]}>
           <meshStandardMaterial color="#374151" />
         </Box>
       </group>
       {/* Keyboard */}
       <Box args={[0.4, 0.02, 0.15]} position={[0, 0.77, 0.1]}>
         <meshStandardMaterial color="#111827" />
       </Box>
    </group>
  );
}
