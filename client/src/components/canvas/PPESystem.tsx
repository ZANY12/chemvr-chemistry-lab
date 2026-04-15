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
      <group position={position}>
        {hovered && (
          <Text position={[0, 0.15, 0]} fontSize={0.04} color="cyan" anchorX="center">
            {gogglesOn ? '✓ Goggles Worn' : 'Click to Wear Goggles'}
          </Text>
        )}
        
        {/* Goggles frame */}
        <group>
          {/* Left lens */}
          <Cylinder args={[0.04, 0.04, 0.01]} position={[-0.05, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color={gogglesOn ? '#22d3ee' : '#cbd5e1'}
              transparent
              opacity={0.3}
              emissive={gogglesOn ? '#22d3ee' : '#000000'}
              emissiveIntensity={gogglesOn ? 0.3 : 0}
            />
          </Cylinder>
          
          {/* Right lens */}
          <Cylinder args={[0.04, 0.04, 0.01]} position={[0.05, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color={gogglesOn ? '#22d3ee' : '#cbd5e1'}
              transparent
              opacity={0.3}
              emissive={gogglesOn ? '#22d3ee' : '#000000'}
              emissiveIntensity={gogglesOn ? 0.3 : 0}
            />
          </Cylinder>
          
          {/* Bridge */}
          <Box args={[0.02, 0.01, 0.01]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#1e293b" />
          </Box>
          
          {/* Strap */}
          <Cylinder args={[0.005, 0.005, 0.15]} position={[0, 0, -0.05]} rotation={[0, Math.PI / 2, 0]}>
            <meshStandardMaterial color="#334155" />
          </Cylinder>
        </group>

        {gogglesOn && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#22d3ee" wireframe />
          </mesh>
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
      <group position={position}>
        {hovered && (
          <Text position={[0, 0.5, 0]} fontSize={0.04} color="cyan" anchorX="center">
            {labCoatOn ? '✓ Lab Coat Worn' : 'Click to Wear Lab Coat'}
          </Text>
        )}
        
        {/* Lab coat representation */}
        <Box args={[0.4, 0.8, 0.1]} position={[0, 0.4, 0]}>
          <meshStandardMaterial
            color={labCoatOn ? '#22d3ee' : '#f8fafc'}
            roughness={0.9}
            emissive={labCoatOn ? '#22d3ee' : '#000000'}
            emissiveIntensity={labCoatOn ? 0.2 : 0}
          />
        </Box>
        
        {/* Buttons */}
        {[0.3, 0.4, 0.5].map((y, i) => (
          <Sphere key={i} args={[0.015, 8, 8]} position={[0, y, 0.051]}>
            <meshStandardMaterial color="#334155" />
          </Sphere>
        ))}
        
        {/* Collar */}
        <Box args={[0.15, 0.05, 0.02]} position={[0, 0.78, 0.04]}>
          <meshStandardMaterial color={labCoatOn ? '#22d3ee' : '#f8fafc'} roughness={0.9} />
        </Box>

        {labCoatOn && (
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.5, 0.9, 0.15]} />
            <meshBasicMaterial color="#22d3ee" wireframe />
          </mesh>
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
      <group position={position}>
        {hovered && (
          <Text position={[0, 0.15, 0]} fontSize={0.04} color="cyan" anchorX="center">
            {glovesOn ? '✓ Gloves Worn' : 'Click to Wear Gloves'}
          </Text>
        )}
        
        {/* Left glove */}
        <group position={[-0.06, 0, 0]}>
          <Box args={[0.04, 0.08, 0.02]} position={[0, 0.04, 0]}>
            <meshStandardMaterial
              color={glovesOn ? '#22d3ee' : '#a855f7'}
              emissive={glovesOn ? '#22d3ee' : '#000000'}
              emissiveIntensity={glovesOn ? 0.3 : 0}
            />
          </Box>
          {/* Fingers */}
          {[-0.015, -0.005, 0.005, 0.015].map((x, i) => (
            <Box key={i} args={[0.008, 0.03, 0.015]} position={[x, 0.095, 0]}>
              <meshStandardMaterial
                color={glovesOn ? '#22d3ee' : '#a855f7'}
                emissive={glovesOn ? '#22d3ee' : '#000000'}
                emissiveIntensity={glovesOn ? 0.3 : 0}
              />
            </Box>
          ))}
        </group>
        
        {/* Right glove */}
        <group position={[0.06, 0, 0]}>
          <Box args={[0.04, 0.08, 0.02]} position={[0, 0.04, 0]}>
            <meshStandardMaterial
              color={glovesOn ? '#22d3ee' : '#a855f7'}
              emissive={glovesOn ? '#22d3ee' : '#000000'}
              emissiveIntensity={glovesOn ? 0.3 : 0}
            />
          </Box>
          {/* Fingers */}
          {[-0.015, -0.005, 0.005, 0.015].map((x, i) => (
            <Box key={i} args={[0.008, 0.03, 0.015]} position={[x, 0.095, 0]}>
              <meshStandardMaterial
                color={glovesOn ? '#22d3ee' : '#a855f7'}
                emissive={glovesOn ? '#22d3ee' : '#000000'}
                emissiveIntensity={glovesOn ? 0.3 : 0}
              />
            </Box>
          ))}
        </group>

        {glovesOn && (
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.15, 0.12, 0.05]} />
            <meshBasicMaterial color="#22d3ee" wireframe />
          </mesh>
        )}
      </group>
    </Interactive>
  );
}

export function PPEStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Wall-mounted board */}
      <Box args={[1.2, 0.05, 0.5]}>
        <meshStandardMaterial color="#334155" />
      </Box>
      
      {/* Hooks */}
      {[-0.4, 0, 0.4].map((x, i) => (
        <Cylinder key={i} args={[0.01, 0.01, 0.08]} position={[x, 0.04, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </Cylinder>
      ))}
      
      {/* PPE Items */}
      <SafetyGoggles position={[-0.4, 0, 0.3]} />
      <LabCoat position={[0, -0.3, 0.3]} />
      <LabGloves position={[0.4, 0, 0.3]} />
      
      {/* Sign */}
      <Box args={[0.8, 0.15, 0.02]} position={[0, 0.35, 0.26]}>
        <meshStandardMaterial color="#fbbf24" />
      </Box>
      <Text position={[0, 0.35, 0.27]} fontSize={0.05} color="#1e293b" anchorX="center" fontWeight="bold">
        PPE REQUIRED
      </Text>
    </group>
  );
}
