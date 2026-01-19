import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { Text, Cylinder, Sphere, Box, Sparkles, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface DraggableItemProps {
  position: [number, number, number];
  color: string;
  type: 'flask' | 'beaker' | 'cube';
  name: string;
  onSelect?: () => void;
}

export function DraggableItem({ position: initialPos, color, type, name, onSelect }: DraggableItemProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  
  const onSelectStart = () => {
    setSelected(true);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 2000);
    onSelect?.();
  };
  
  const onSelectEnd = () => {
    setSelected(false);
  };

  return (
    <Interactive 
      onSelectStart={onSelectStart} 
      onSelectEnd={onSelectEnd}
      onHover={() => setHovered(true)} 
      onBlur={() => setHovered(false)}
    >
      <group position={initialPos} ref={meshRef}>
        {showSparkles && <Sparkles count={50} scale={0.5} size={2} speed={0.4} color="#06b6d4" />}
        {hovered && (
          <Text
            position={[0, 0.35, 0]}
            fontSize={0.06}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {name}
            <meshBasicMaterial color="#111827" transparent opacity={0.8} depthTest={false} />
          </Text>
        )}

        {selected && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#06b6d4" wireframe />
          </mesh>
        )}

        {type === 'beaker' && (
          <group>
            <Cylinder args={[0.08, 0.08, 0.2, 32]} position={[0, 0.1, 0]} castShadow>
              <MeshTransmissionMaterial 
                backside
                samples={16}
                thickness={0.1}
                chromaticAberration={0.05}
                anisotropy={0.1}
                distortion={0.1}
                distortionScale={0.1}
                temporalDistortion={0.1}
                clearcoat={1}
                attenuationDistance={0.5}
                attenuationColor="#ffffff"
                color="#e2e8f0"
              />
            </Cylinder>
            <Cylinder args={[0.078, 0.078, 0.15, 32]} position={[0, 0.08, 0]}>
               <meshStandardMaterial color={color} transparent opacity={0.7} roughness={0.1} metalness={0.1} />
            </Cylinder>
          </group>
        )}

        {type === 'flask' && (
          <group>
            <Cylinder args={[0.02, 0.04, 0.1, 32]} position={[0, 0.2, 0]} castShadow>
               <MeshTransmissionMaterial 
                backside
                samples={16}
                thickness={0.1}
                chromaticAberration={0.05}
                anisotropy={0.1}
                distortion={0.1}
                distortionScale={0.1}
                temporalDistortion={0.1}
                clearcoat={1}
                attenuationDistance={0.5}
                attenuationColor="#ffffff"
                color="#e2e8f0"
              />
            </Cylinder>
            <Sphere args={[0.1, 32, 32]} position={[0, 0.05, 0]} scale={[1, 0.8, 1]} castShadow>
              <MeshTransmissionMaterial 
                backside
                samples={16}
                thickness={0.1}
                chromaticAberration={0.05}
                anisotropy={0.1}
                distortion={0.1}
                distortionScale={0.1}
                temporalDistortion={0.1}
                clearcoat={1}
                attenuationDistance={0.5}
                attenuationColor="#ffffff"
                color="#e2e8f0"
              />
            </Sphere>
             <Sphere args={[0.098, 32, 32]} position={[0, 0.05, 0]} scale={[1, 0.8, 1]}>
               <meshStandardMaterial color={color} transparent opacity={0.7} roughness={0.1} metalness={0.1} />
            </Sphere>
          </group>
        )}
        
        {type === 'cube' && (
          <Box args={[0.15, 0.15, 0.15]} position={[0, 0.075, 0]} castShadow>
             <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
          </Box>
        )}
      </group>
    </Interactive>
  );
}

export function BunsenBurner({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (flameRef.current) {
       flameRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 10) * 0.2;
       flameRef.current.scale.x = 1 + Math.cos(clock.elapsedTime * 15) * 0.1;
    }
  });

  return (
    <group position={position}>
       <Cylinder args={[0.05, 0.08, 0.05, 16]} position={[0, 0.025, 0]}>
         <meshStandardMaterial color="#4b5563" metalness={0.8} />
       </Cylinder>
       <Cylinder args={[0.015, 0.015, 0.15, 16]} position={[0, 0.12, 0]}>
          <meshStandardMaterial color="#9ca3af" metalness={0.9} />
       </Cylinder>
       <mesh ref={flameRef} position={[0, 0.22, 0]}>
         <coneGeometry args={[0.02, 0.08, 8]} />
         <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
       </mesh>
       <pointLight position={[0, 0.25, 0]} color="#3b82f6" intensity={0.5} distance={1} />
    </group>
  );
}

export function MagneticStirrer({ position }: { position: [number, number, number] }) {
  const plateRef = useRef<THREE.Group>(null);
  const [active, setActive] = useState(false);

  useFrame((state, delta) => {
    if (active && plateRef.current) {
      plateRef.current.rotation.y += delta * 10;
    }
  });

  return (
    <group position={position}>
      <Box args={[0.25, 0.08, 0.25]} position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#f1f5f9" metalness={0.1} roughness={0.2} />
      </Box>
      <Interactive onSelectStart={() => setActive(!active)}>
        <group position={[0, 0.08, 0]} ref={plateRef}>
          <Cylinder args={[0.08, 0.08, 0.01, 32]}>
            <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.1} />
          </Cylinder>
          {active && <Box args={[0.04, 0.01, 0.01]} position={[0, 0.01, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>}
        </group>
      </Interactive>
      <Text position={[0, 0.04, 0.13]} rotation={[-Math.PI / 4, 0, 0]} fontSize={0.02} color="#475569">
        {active ? "ON" : "STIRRER"}
      </Text>
    </group>
  );
}

export function VortexMixer({ position }: { position: [number, number, number] }) {
  const headRef = useRef<THREE.Group>(null);
  const [active, setActive] = useState(false);

  useFrame((state, delta) => {
    if (active && headRef.current) {
      headRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.005;
      headRef.current.position.z = Math.cos(state.clock.elapsedTime * 50) * 0.005;
    }
  });

  return (
    <group position={position}>
      <Cylinder args={[0.1, 0.12, 0.15, 16]} position={[0, 0.075, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.5} />
      </Cylinder>
      <Interactive onSelectStart={() => setActive(!active)}>
        <group position={[0, 0.15, 0]} ref={headRef}>
          <Cylinder args={[0.04, 0.03, 0.03, 16]}>
            <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.8} />
          </Cylinder>
        </group>
      </Interactive>
      <Text position={[0, 0.05, 0.13]} rotation={[-Math.PI / 4, 0, 0]} fontSize={0.02} color="#f8fafc">
        VORTEX
      </Text>
    </group>
  );
}

export function Whiteboard({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <Plane args={[2.5, 1.5]} position={[0, 0, 0]}>
        <MeshTransmissionMaterial 
          samples={8}
          thickness={0.05}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0}
          clearcoat={1}
          attenuationDistance={1}
          attenuationColor="#ffffff"
          color="#ffffff"
          transparent
          opacity={0.3}
        />
      </Plane>
      <Box args={[2.6, 0.05, 0.05]} position={[0, 0.775, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </Box>
      <Box args={[2.6, 0.05, 0.05]} position={[0, -0.775, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </Box>
      <group position={[-0.8, 0.3, 0.01]}>
        <Text fontSize={0.08} color="#1e293b" anchorX="left" anchorY="top">
          {"Experiment: Synthesis Alpha\n- Heat to 80°C\n- Add Catalyst B\n- Filter precipitate"}
        </Text>
      </group>
      <group position={[0.5, -0.2, 0.01]}>
        <Box args={[0.4, 0.4, 0.01]}>
          <meshBasicMaterial color="#3b82f6" wireframe />
        </Box>
        <Text position={[0, -0.25, 0]} fontSize={0.04} color="#3b82f6">Molecular Map</Text>
      </group>
    </group>
  );
}

export function BotanicalSample({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder args={[0.05, 0.05, 0.15, 32]} position={[0, 0.075, 0]}>
        <MeshTransmissionMaterial 
          samples={8}
          thickness={0.05}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0.1}
          clearcoat={1}
          attenuationDistance={1}
          attenuationColor="#ffffff"
          color="#e2e8f0"
        />
      </Cylinder>
      <group position={[0, 0.05, 0]}>
        <mesh>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
        <Box args={[0.005, 0.08, 0.005]} position={[0, 0.04, 0]}>
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </Box>
      </group>
    </group>
  );
}
