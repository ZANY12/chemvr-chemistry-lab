import React from 'react';
import { Text, Box } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import { useLabTraining } from '../../lib/labTrainingSystem';
import { titrationExperimentInfo } from '../../lib/titrationExperiment';

export function ExperimentStarter({ position }: { position: [number, number, number] }) {
  const { startExperiment, currentExperiment } = useLabTraining();
  const [hovered, setHovered] = React.useState(false);

  const handleStart = () => {
    if (!currentExperiment) {
      startExperiment(titrationExperimentInfo.id, titrationExperimentInfo.steps);
    }
  };

  if (currentExperiment) return null; // Hide once experiment started

  return (
    <Interactive
      onSelectStart={handleStart}
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <group 
        position={position}
        onClick={handleStart}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Large clickable button */}
        <mesh>
          <boxGeometry args={[0.6, 0.4, 0.2]} />
          <meshStandardMaterial 
            color={hovered ? '#22d3ee' : '#10b981'} 
            emissive={hovered ? '#22d3ee' : '#10b981'}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        <Text position={[0, 0.1, 0.11]} fontSize={0.08} color="#000" anchorX="center" fontWeight="bold">
          START
        </Text>
        <Text position={[0, 0, 0.11]} fontSize={0.06} color="#000" anchorX="center" fontWeight="bold">
          TITRATION
        </Text>
        <Text position={[0, -0.1, 0.11]} fontSize={0.05} color="#000" anchorX="center">
          EXPERIMENT
        </Text>
      </group>
    </Interactive>
  );
}
