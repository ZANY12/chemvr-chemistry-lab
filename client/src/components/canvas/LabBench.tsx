import React from 'react';
import { Box, Cylinder } from '@react-three/drei';

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

      {/* Cabinet Doors/Drawers (Visual Details) */}
      {Array.from({ length: Math.floor(length) }).map((_, i) => (
        <group key={i} position={[(i - (length - 1) / 2) * 0.8, 0.45, 0.41]}>
          <Box args={[0.7, 0.8, 0.02]}>
            <meshStandardMaterial color="#e5e7eb" />
          </Box>
          {/* Handle */}
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
          {/* Basin cutout area */}
          <Box args={[0.5, 0.1, 0.5]} position={[0, -0.05, 0]}>
            <meshStandardMaterial color="#374151" metalness={0.8} />
          </Box>
          {/* Tap */}
          <group position={[0, 0.05, -0.2]}>
            <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.15, 0]}>
              <meshStandardMaterial color="#9ca3af" metalness={0.9} />
            </Cylinder>
            <Cylinder args={[0.02, 0.02, 0.1]} position={[0, 0.3, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#9ca3af" metalness={0.9} />
            </Cylinder>
          </group>
        </group>
      )}
    </group>
  );
}
