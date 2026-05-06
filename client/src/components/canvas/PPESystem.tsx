import React, { useState } from 'react';
import { Interactive } from '@react-three/xr';
import { Box, Cylinder, Sphere, Text } from '@react-three/drei';
import { useLabTraining } from '../../lib/labTrainingSystem';
import * as THREE from 'three';

export function SafetyGoggles({ position }: { position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const { gogglesOn, setGoggles } = useLabTraining();

  const handleSelect = () => {
    if (!gogglesOn) {
      setGoggles(true);
    }
  };

  return (
    <Interactive
      onSelectStart={handleSelect}
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <group 
        position={position}
        onClick={handleSelect}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Large visible clickable box */}
        <mesh>
          <boxGeometry args={[0.3, 0.3, 0.2]} />
          <meshStandardMaterial 
            color={gogglesOn ? '#22d3ee' : '#fbbf24'} 
            emissive={gogglesOn ? '#22d3ee' : '#fbbf24'}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        <Text position={[0, 0.2, 0.11]} fontSize={0.08} color="#000" anchorX="center" fontWeight="bold">
          GOGGLES
        </Text>
        
        {gogglesOn && (
          <Text position={[0, -0.2, 0.11]} fontSize={0.06} color="#0f0" anchorX="center">
            ✓ WORN
          </Text>
        )}
      </group>
    </Interactive>
  );
}

export function LabCoat({ position }: { position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const { labCoatOn, setLabCoat } = useLabTraining();

  const handleSelect = () => {
    if (!labCoatOn) {
      setLabCoat(true);
    }
  };

  return (
    <Interactive
      onSelectStart={handleSelect}
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <group 
        position={position}
        onClick={handleSelect}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Large visible clickable box */}
        <mesh>
          <boxGeometry args={[0.3, 0.3, 0.2]} />
          <meshStandardMaterial 
            color={labCoatOn ? '#22d3ee' : '#f8fafc'} 
            emissive={labCoatOn ? '#22d3ee' : '#ffffff'}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        <Text position={[0, 0.2, 0.11]} fontSize={0.08} color="#000" anchorX="center" fontWeight="bold">
          COAT
        </Text>
        
        {labCoatOn && (
          <Text position={[0, -0.2, 0.11]} fontSize={0.06} color="#0f0" anchorX="center">
            ✓ WORN
          </Text>
        )}
      </group>
    </Interactive>
  );
}

export function LabGloves({ position }: { position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const { glovesOn, setGloves } = useLabTraining();

  const handleSelect = () => {
    if (!glovesOn) {
      setGloves(true);
    }
  };

  return (
    <Interactive
      onSelectStart={handleSelect}
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <group 
        position={position}
        onClick={handleSelect}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Large visible clickable box */}
        <mesh>
          <boxGeometry args={[0.3, 0.3, 0.2]} />
          <meshStandardMaterial 
            color={glovesOn ? '#22d3ee' : '#a855f7'} 
            emissive={glovesOn ? '#22d3ee' : '#a855f7'}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        <Text position={[0, 0.2, 0.11]} fontSize={0.08} color="#000" anchorX="center" fontWeight="bold">
          GLOVES
        </Text>
        
        {glovesOn && (
          <Text position={[0, -0.2, 0.11]} fontSize={0.06} color="#0f0" anchorX="center">
            ✓ WORN
          </Text>
        )}
      </group>
    </Interactive>
  );
}

export function PPEStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table surface */}
      <Box args={[1.5, 0.05, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </Box>
      
      {/* Table legs */}
      {[[-0.65, -0.4, -0.25], [0.65, -0.4, -0.25], [-0.65, -0.4, 0.25], [0.65, -0.4, 0.25]].map((pos, i) => (
        <Cylinder key={i} args={[0.03, 0.03, 0.8]} position={pos as [number, number, number]}>
          <meshStandardMaterial color="#334155" />
        </Cylinder>
      ))}
      
      {/* PPE Items laying on table */}
      <SafetyGoggles position={[-0.5, 0.05, 0]} />
      <LabGloves position={[0, 0.05, 0]} />
      <LabCoat position={[0.5, 0.05, 0]} />
      
      {/* Sign on table */}
      <Box args={[1.2, 0.2, 0.02]} position={[0, 0.15, -0.25]}>
        <meshStandardMaterial color="#fbbf24" />
      </Box>
      <Text position={[0, 0.15, -0.24]} fontSize={0.06} color="#1e293b" anchorX="center" fontWeight="bold">
        PPE REQUIRED
      </Text>
      <Text position={[0, 0.08, -0.24]} fontSize={0.03} color="#1e293b" anchorX="center">
        Click items to wear
      </Text>
    </group>
  );
}
