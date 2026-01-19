import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Text, MeshTransmissionMaterial, Sphere } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import * as THREE from 'three';

interface LabBenchProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  showSink?: boolean;
}

export function LabBench({ position, rotation = [0, 0, 0], length = 2.5, showSink = false }: LabBenchProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Cabinet Body with subtle beveling/details */}
      <Box args={[length, 0.9, 0.8]} position={[0, 0.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f3f4f6" roughness={0.3} metalness={0.05} />
      </Box>

      {/* Drawers and Handles */}
      {Array.from({ length: Math.floor(length / 0.8) }).map((_, i) => (
        <group key={i} position={[(i - (Math.floor(length / 0.8) - 1) / 2) * 0.8, 0.45, 0.41]}>
          <Box args={[0.75, 0.85, 0.02]}>
            <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
          </Box>
          <Box args={[0.12, 0.02, 0.04]} position={[0, 0.35, 0.02]}>
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </Box>
        </group>
      ))}

      {/* Countertop with high-gloss finish */}
      <Box args={[length + 0.05, 0.06, 0.9]} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#0f172a" roughness={0.05} metalness={0.2} />
      </Box>

      {showSink && <Sink />}
    </group>
  );
}

function Sink() {
  const [waterOn, setWaterOn] = useState(false);
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterRef.current && waterOn) {
      waterRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 25) * 0.15;
      waterRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 25) * 0.15;
      waterRef.current.rotation.y += 0.1;
    }
  });

  return (
    <group position={[0.6, 0.9, 0]}>
      {/* Sink Basin - Deep Metallic */}
      <Box args={[0.6, 0.4, 0.5]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[0.55, 0.01, 0.45]} position={[0, -0.38, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={1} roughness={0.1} />
      </Box>

      {/* Faucet - Chromed Finish */}
      <group position={[0, 0.05, -0.2]}>
        <Cylinder args={[0.03, 0.03, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.05} />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 0.35]} position={[0, 0.17, 0]}>
          <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.05} />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 0.18]} position={[0, 0.34, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.05} />
        </Cylinder>
        <Cylinder args={[0.018, 0.018, 0.06]} position={[0, 0.31, 0.18]}>
          <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.05} />
        </Cylinder>

        {/* Interactive Knobs */}
        <Interactive onSelectStart={() => setWaterOn(!waterOn)}>
          <group position={[-0.1, 0.05, 0]}>
            <Sphere args={[0.025, 16, 16]}>
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={waterOn ? 0.5 : 0} />
            </Sphere>
            <Text position={[0, 0.06, 0]} fontSize={0.025} color="#ef4444" fontWeight="bold">HOT</Text>
          </group>
        </Interactive>
        <Interactive onSelectStart={() => setWaterOn(!waterOn)}>
          <group position={[0.1, 0.05, 0]}>
            <Sphere args={[0.025, 16, 16]}>
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={waterOn ? 0.5 : 0} />
            </Sphere>
            <Text position={[0, 0.06, 0]} fontSize={0.025} color="#3b82f6" fontWeight="bold">COLD</Text>
          </group>
        </Interactive>

        {/* Advanced Water Stream */}
        {waterOn && (
          <mesh ref={waterRef} position={[0, 0.05, 0.18]}>
            <cylinderGeometry args={[0.01, 0.012, 0.4]} />
            <MeshTransmissionMaterial 
              samples={4}
              thickness={0.1}
              chromaticAberration={0.1}
              distortion={0.5}
              distortionScale={1}
              color="#bae6fd"
              ior={1.33}
              transmission={1}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function FumeHood({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box args={[2, 2.6, 1.1]} position={[0, 1.3, 0]} castShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </Box>
      <Box args={[1.8, 1.3, 0.05]} position={[0, 1.25, 0.55]} castShadow>
        <MeshTransmissionMaterial 
          samples={8}
          thickness={0.05}
          chromaticAberration={0.02}
          transmission={0.95}
          color="#94a3b8"
        />
      </Box>
      <Box args={[1.9, 0.05, 1]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.3} />
      </Box>
      <rectAreaLight position={[0, 2.4, 0]} width={1.8} height={0.8} intensity={2} rotation={[-Math.PI / 2, 0, 0]} color="#f8fafc" />
    </group>
  );
}

export function Centrifuge({ position }: { position: [number, number, number] }) {
  const rotorRef = useRef<THREE.Group>(null);
  const [running, setRunning] = useState(false);

  useFrame((state, delta) => {
    if (running && rotorRef.current) {
      rotorRef.current.rotation.y += delta * 25;
    }
  });

  return (
    <Interactive onSelectStart={() => setRunning(!running)}>
      <group position={position}>
        <Cylinder args={[0.22, 0.22, 0.25, 32]} position={[0, 0.125, 0]}>
          <meshStandardMaterial color="#f1f5f9" metalness={0.2} roughness={0.1} />
        </Cylinder>
        <group ref={rotorRef} position={[0, 0.18, 0]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Cylinder key={i} args={[0.025, 0.025, 0.12]} position={[Math.cos(i * Math.PI / 3) * 0.12, 0, Math.sin(i * Math.PI / 3) * 0.12]} rotation={[0.6, 0, i * Math.PI / 3]}>
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </Cylinder>
          ))}
        </group>
        <Box args={[0.45, 0.05, 0.45]} position={[0, 0.25, 0]}>
          <MeshTransmissionMaterial samples={4} thickness={0.1} transmission={1} color="#cbd5e1" />
        </Box>
        <Text position={[0, 0.05, 0.24]} rotation={[-Math.PI / 4, 0, 0]} fontSize={0.025} color="#475569" fontWeight="bold">
          {running ? "SPINNING" : "READY"}
        </Text>
      </group>
    </Interactive>
  );
}

export function Microscope({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Box args={[0.18, 0.03, 0.22]} position={[0, 0.015, 0]}>
        <meshStandardMaterial color="#0f172a" metalness={0.5} />
      </Box>
      <Cylinder args={[0.025, 0.025, 0.3]} position={[0, 0.16, -0.06]}>
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 0.12]} position={[0, 0.28, 0.06]} rotation={[0.6, 0, 0]}>
        <meshStandardMaterial color="#020617" metalness={0.9} />
      </Cylinder>
      <Box args={[0.12, 0.01, 0.12]} position={[0, 0.1, 0.04]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>
    </group>
  );
}

export function SafetyStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Showerhead */}
      <group position={[0, 0, 0]}>
        <Cylinder args={[0.03, 0.03, 2.5]} position={[0, 1.25, 0]}>
           <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.1} />
        </Cylinder>
        <Cylinder args={[0.25, 0.15, 0.12, 32]} position={[0, 2.4, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
           <meshStandardMaterial color="#16a34a" metalness={0.5} />
        </Cylinder>
      </group>
      
      {/* Eyewash Station */}
      <group position={[0, 1.1, 0.4]}>
        <Box args={[0.6, 0.1, 0.4]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#16a34a" roughness={0.3} />
        </Box>
        <Cylinder args={[0.02, 0.02, 0.15]} position={[-0.15, 0.1, 0]}>
          <meshStandardMaterial color="#cbd5e1" metalness={1} />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 0.15]} position={[0.15, 0.1, 0]}>
          <meshStandardMaterial color="#cbd5e1" metalness={1} />
        </Cylinder>
        <Text position={[0, 0.2, 0]} fontSize={0.06} color="#16a34a" fontWeight="bold">EYE WASH</Text>
      </group>

      {/* Lab Gear Shelf */}
      <group position={[-1, 1.2, 0.3]}>
        <Box args={[1.2, 0.05, 0.5]}>
          <meshStandardMaterial color="#334155" />
        </Box>
        <Box args={[0.4, 0.8, 0.1]} position={[-0.3, 0.45, 0.1]}>
          <meshStandardMaterial color="#f8fafc" roughness={1} />
        </Box>
        <Text position={[-0.3, 0.9, 0.12]} fontSize={0.05} color="#334155">LAB COATS</Text>
      </group>
    </group>
  );
}

export function ComputerStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
       <Box args={[1.3, 0.05, 0.7]} position={[0, 0.75, 0]}>
         <meshStandardMaterial color="#0f172a" roughness={0.1} />
       </Box>
       {/* High-end Monitor */}
       <group position={[0, 1.05, -0.25]}>
         <Box args={[0.8, 0.45, 0.04]}>
           <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.5} />
         </Box>
         <mesh position={[0, 0, 0.021]}>
           <planeGeometry args={[0.76, 0.41]} />
           <meshStandardMaterial color="#0891b2" emissive="#0891b2" emissiveIntensity={0.8} />
         </mesh>
         <Box args={[0.04, 0.3, 0.04]} position={[0, -0.3, -0.05]}>
           <meshStandardMaterial color="#1e293b" />
         </Box>
       </group>
       {/* Mechanical Keyboard */}
       <Box args={[0.5, 0.03, 0.18]} position={[0, 0.77, 0.15]}>
         <meshStandardMaterial color="#1e293b" metalness={0.2} />
       </Box>
    </group>
  );
}
