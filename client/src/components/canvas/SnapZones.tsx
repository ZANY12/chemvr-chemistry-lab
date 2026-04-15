import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface SnapZoneProps {
  position: [number, number, number];
  radius?: number;
  type?: 'bench' | 'clamp' | 'hotplate' | 'ring_stand';
  onSnap?: (objectId: string) => void;
  onRelease?: (objectId: string) => void;
}

export function SnapZone({
  position,
  radius = 0.15,
  type = 'bench',
  onSnap,
  onRelease,
}: SnapZoneProps) {
  const [isOccupied, setIsOccupied] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const zoneRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position}>
      {/* Visual indicator */}
      {showIndicator && !isOccupied && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.8, radius, 32]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Snap zone collider (invisible) */}
      <mesh ref={zoneRef} visible={false}>
        <sphereGeometry args={[radius]} />
      </mesh>

      {/* Type-specific visuals */}
      {type === 'hotplate' && (
        <Box args={[0.2, 0.02, 0.2]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color={isOccupied ? '#ef4444' : '#334155'}
            emissive={isOccupied ? '#ef4444' : '#000000'}
            emissiveIntensity={isOccupied ? 0.3 : 0}
          />
        </Box>
      )}

      {type === 'ring_stand' && (
        <group>
          <Cylinder args={[0.01, 0.01, 0.5]} position={[0, 0.25, 0]}>
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </Cylinder>
          <Cylinder args={[0.05, 0.05, 0.02]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </Cylinder>
          <Cylinder args={[0.08, 0.001, 0.01]} position={[0, position[1], 0]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </Cylinder>
        </group>
      )}

      {type === 'clamp' && (
        <group>
          <Box args={[0.03, 0.15, 0.02]} position={[0, 0.075, 0]}>
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </Box>
          <Box args={[0.03, 0.02, 0.08]} position={[0, 0.15, 0.03]}>
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </Box>
        </group>
      )}
    </group>
  );
}

export function RingStand({ position }: { position: [number, number, number] }) {
  const [ringHeight, setRingHeight] = useState(0.3);

  return (
    <group position={position}>
      {/* Base */}
      <Cylinder args={[0.1, 0.1, 0.02]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.6} />
      </Cylinder>

      {/* Rod */}
      <Cylinder args={[0.012, 0.012, 0.6]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </Cylinder>

      {/* Adjustable ring */}
      <group position={[0, ringHeight, 0]}>
        <Cylinder args={[0.01, 0.01, 0.12]} position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </Cylinder>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.008, 16, 32]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        
        {/* Snap zone at ring level */}
        <SnapZone position={[0, 0.05, 0]} radius={0.09} type="ring_stand" />
      </group>

      {/* Clamp */}
      <group position={[0, 0.45, 0]}>
        <Box args={[0.04, 0.08, 0.03]} position={[0.03, 0, 0]}>
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </Box>
        <Box args={[0.04, 0.08, 0.03]} position={[-0.03, 0, 0]}>
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </Box>
        
        <SnapZone position={[0, 0, 0]} radius={0.06} type="clamp" />
      </group>
    </group>
  );
}

export function Hotplate({ position }: { position: [number, number, number] }) {
  const [temperature, setTemperature] = useState(25);
  const [targetTemp, setTargetTemp] = useState(25);
  const [isOn, setIsOn] = useState(false);

  useFrame(() => {
    if (isOn) {
      setTemperature(prev => {
        const diff = targetTemp - prev;
        return prev + diff * 0.01;
      });
    } else {
      setTemperature(prev => prev + (25 - prev) * 0.005);
    }
  });

  const handlePowerToggle = () => {
    setIsOn(!isOn);
    if (!isOn) {
      setTargetTemp(80);
    }
  };

  return (
    <group position={position}>
      {/* Base */}
      <Box args={[0.25, 0.08, 0.25]} position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#f1f5f9" metalness={0.2} roughness={0.3} />
      </Box>

      {/* Heating surface */}
      <Box args={[0.2, 0.01, 0.2]} position={[0, 0.085, 0]}>
        <meshStandardMaterial
          color={isOn ? '#1e293b' : '#334155'}
          emissive="#ef4444"
          emissiveIntensity={isOn ? (temperature / 100) * 0.5 : 0}
          metalness={0.8}
          roughness={0.1}
        />
      </Box>

      {/* Snap zone */}
      <SnapZone position={[0, 0.1, 0]} radius={0.12} type="hotplate" />

      {/* Control panel */}
      <Box args={[0.15, 0.06, 0.02]} position={[0, 0.04, 0.13]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>

      {/* Power button */}
      <mesh position={[-0.05, 0.04, 0.14]} onClick={handlePowerToggle}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial
          color={isOn ? '#22c55e' : '#ef4444'}
          emissive={isOn ? '#22c55e' : '#ef4444'}
          emissiveIntensity={isOn ? 0.5 : 0.2}
        />
      </mesh>

      {/* Temperature display */}
      <mesh position={[0.04, 0.04, 0.14]}>
        <planeGeometry args={[0.08, 0.04]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <group position={[0.04, 0.04, 0.141]}>
        <mesh>
          <planeGeometry args={[0.075, 0.035]} />
          <meshBasicMaterial color="#0891b2" opacity={0.8} transparent />
        </mesh>
      </group>

      {/* Heat visualization */}
      {isOn && temperature > 40 && (
        <pointLight
          position={[0, 0.15, 0]}
          color="#ef4444"
          intensity={temperature / 100}
          distance={0.5}
        />
      )}
    </group>
  );
}

export function TestTubeRack({ position }: { position: [number, number, number] }) {
  const slots = 12;
  const rows = 3;

  return (
    <group position={position}>
      {/* Base */}
      <Box args={[0.35, 0.03, 0.15]} position={[0, 0.015, 0]}>
        <meshStandardMaterial color="#f59e0b" roughness={0.8} />
      </Box>

      {/* Holes for test tubes */}
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: slots / rows }).map((_, col) => {
          const x = -0.15 + col * 0.08;
          const z = -0.05 + row * 0.05;
          return (
            <group key={`${row}-${col}`} position={[x, 0.03, z]}>
              <Cylinder args={[0.018, 0.018, 0.04]} position={[0, 0.02, 0]}>
                <meshStandardMaterial color="#d97706" />
              </Cylinder>
              <SnapZone position={[0, 0.06, 0]} radius={0.025} type="bench" />
            </group>
          );
        })
      )}
    </group>
  );
}

export function WasteContainer({
  position,
  type = 'general',
}: {
  position: [number, number, number];
  type?: 'general' | 'organic' | 'aqueous' | 'sharps';
}) {
  const colors = {
    general: '#64748b',
    organic: '#f59e0b',
    aqueous: '#3b82f6',
    sharps: '#ef4444',
  };

  const labels = {
    general: 'GENERAL WASTE',
    organic: 'ORGANIC WASTE',
    aqueous: 'AQUEOUS WASTE',
    sharps: 'SHARPS',
  };

  return (
    <group position={position}>
      <Cylinder args={[0.15, 0.12, 0.4, 16]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color={colors[type]} roughness={0.5} />
      </Cylinder>
      <Box args={[0.32, 0.02, 0.32]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color={colors[type]} />
      </Box>
      <mesh position={[0, 0.25, 0.16]}>
        <planeGeometry args={[0.25, 0.08]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <group position={[0, 0.25, 0.161]}>
        <mesh>
          <planeGeometry args={[0.24, 0.075]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </group>

      <SnapZone position={[0, 0.42, 0]} radius={0.18} type="bench" />
    </group>
  );
}
