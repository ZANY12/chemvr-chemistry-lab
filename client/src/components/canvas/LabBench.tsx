import React from 'react';
import { Box } from '@react-three/drei';

interface LabBenchProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function LabBench({ position, rotation = [0, 0, 0] }: LabBenchProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Table Top */}
      <Box args={[2.5, 0.1, 1]} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1f2937" roughness={0.2} metalness={0.8} />
      </Box>

      {/* Legs */}
      <Box args={[0.1, 0.9, 0.1]} position={[-1.15, 0.45, -0.4]} castShadow>
        <meshStandardMaterial color="#9ca3af" metalness={0.9} />
      </Box>
      <Box args={[0.1, 0.9, 0.1]} position={[1.15, 0.45, -0.4]} castShadow>
        <meshStandardMaterial color="#9ca3af" metalness={0.9} />
      </Box>
      <Box args={[0.1, 0.9, 0.1]} position={[-1.15, 0.45, 0.4]} castShadow>
        <meshStandardMaterial color="#9ca3af" metalness={0.9} />
      </Box>
      <Box args={[0.1, 0.9, 0.1]} position={[1.15, 0.45, 0.4]} castShadow>
        <meshStandardMaterial color="#9ca3af" metalness={0.9} />
      </Box>
    </group>
  );
}
