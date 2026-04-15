import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { Interactive, useXREvent, useController } from '@react-three/xr';
import { Text, Cylinder, Box, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useLabTraining } from '../../lib/labTrainingSystem';

interface BuretteProps {
  position: [number, number, number];
  titrantName?: string;
  titrantColor?: string;
  initialVolume?: number;
  onVolumeChange?: (volume: number) => void;
}

export function Burette({
  position: initialPos,
  titrantName = "NaOH Solution",
  titrantColor = "#e9d5ff",
  initialVolume = 50,
  onVolumeChange,
}: BuretteProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [stopcock, setStopcock] = useState(false); // false = closed, true = open
  const [dispensing, setDispensing] = useState(false);
  
  const leftController = useController('left');
  const rightController = useController('right');
  const [grabbingController, setGrabbingController] = useState<'left' | 'right' | null>(null);
  
  const { recordMeasurement } = useLabTraining();

  // Handle controller grab
  useXREvent('selectstart', (e: any) => {
    if (hovered) {
      setGrabbed(true);
      const isLeft = e.target === leftController?.controller;
      setGrabbingController(isLeft ? 'left' : 'right');
      
      // Haptic feedback
      const inputSource = e.target?.inputSource;
      if (inputSource?.gamepad?.hapticActuators?.[0]) {
        inputSource.gamepad.hapticActuators[0].pulse(0.3, 100);
      }
    }
  });

  useXREvent('selectend', () => {
    if (grabbed) {
      setGrabbed(false);
      setGrabbingController(null);
    }
  });

  // Handle stopcock toggle (squeeze trigger while grabbed)
  useXREvent('squeezestart', () => {
    if (grabbed) {
      setStopcock(true);
      setDispensing(true);
    }
  });

  useXREvent('squeezeend', () => {
    if (grabbed) {
      setStopcock(false);
      setDispensing(false);
      // Record the dispensed volume
      recordMeasurement('titration_volume', initialVolume - volume, 'mL');
    }
  });

  // Dispense liquid when stopcock is open
  useFrame((state, delta) => {
    if (dispensing && volume > 0) {
      const dispenseRate = 2.0 * delta; // 2 mL per second
      const newVolume = Math.max(0, volume - dispenseRate);
      setVolume(newVolume);
      onVolumeChange?.(initialVolume - newVolume);
      
      // Haptic feedback while dispensing
      const controller = grabbingController === 'left' ? leftController : rightController;
      if (controller?.inputSource?.gamepad?.hapticActuators?.[0]) {
        controller.inputSource.gamepad.hapticActuators[0].pulse(0.15, 50);
      }
    }

    // Follow controller when grabbed
    if (grabbed && grabbingController) {
      const controller = grabbingController === 'left' ? leftController : rightController;
      if (controller?.grip && rigidBodyRef.current) {
        const gripPos = new THREE.Vector3();
        controller.grip.getWorldPosition(gripPos);
        rigidBodyRef.current.setTranslation(gripPos, true);
        
        const gripQuat = new THREE.Quaternion();
        controller.grip.getWorldQuaternion(gripQuat);
        rigidBodyRef.current.setRotation(gripQuat, true);
      }
    }
  });

  const buretteHeight = 0.4;
  const buretteRadius = 0.02;
  const fillHeight = (volume / initialVolume) * buretteHeight;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={initialPos}
      mass={0.3}
      linearDamping={0.5}
      angularDamping={0.5}
      type={grabbed ? 'kinematicPosition' : 'dynamic'}
      colliders={false}
    >
      <CuboidCollider args={[buretteRadius * 1.5, buretteHeight / 2, buretteRadius * 1.5]} />
      
      <Interactive
        onHover={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <group ref={meshRef}>
          {/* Glow when hoverable */}
          {hovered && !grabbed && (
            <mesh position={[0, buretteHeight / 2, 0]}>
              <cylinderGeometry args={[buretteRadius * 2, buretteRadius * 2, buretteHeight * 1.1, 16]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} />
            </mesh>
          )}
          
          {hovered && (
            <Text
              position={[0, buretteHeight + 0.1, 0]}
              fontSize={0.05}
              color="cyan"
              anchorX="center"
              anchorY="middle"
            >
              {titrantName} - {volume.toFixed(1)}mL
              <meshBasicMaterial color="#0c4a6e" transparent opacity={0.9} depthTest={false} />
            </Text>
          )}

          {grabbed && (
            <mesh position={[0, buretteHeight / 2, 0]}>
              <cylinderGeometry args={[buretteRadius * 2.5, buretteRadius * 2.5, buretteHeight * 1.2, 16]} />
              <meshBasicMaterial color="#22d3ee" wireframe />
            </mesh>
          )}

          {/* Glass tube */}
          <Cylinder args={[buretteRadius, buretteRadius, buretteHeight, 16]} position={[0, buretteHeight / 2, 0]} castShadow>
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.1}
              chromaticAberration={0.02}
              transmission={0.95}
              ior={1.5}
              roughness={0}
            />
          </Cylinder>

          {/* Liquid inside */}
          <Cylinder
            args={[buretteRadius * 0.9, buretteRadius * 0.9, fillHeight, 16]}
            position={[0, fillHeight / 2, 0]}
          >
            <meshStandardMaterial color={titrantColor} transparent opacity={0.8} roughness={0.1} metalness={0.1} />
          </Cylinder>

          {/* Volume markings (0-50 mL) */}
          {Array.from({ length: 11 }).map((_, i) => {
            const markVolume = i * 5;
            const markHeight = (markVolume / initialVolume) * buretteHeight;
            return (
              <Text
                key={i}
                position={[buretteRadius + 0.008, markHeight, 0]}
                fontSize={0.012}
                color="#1e293b"
                anchorX="left"
              >
                {markVolume}
              </Text>
            );
          })}

          {/* Stopcock at bottom */}
          <Box args={[0.03, 0.01, 0.015]} position={[0, -0.02, 0]}>
            <meshStandardMaterial color={stopcock ? "#22c55e" : "#ef4444"} />
          </Box>

          {/* Tip */}
          <mesh position={[0, -0.04, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[buretteRadius * 0.5, 0.03, 8]} />
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.1}
              transmission={0.95}
              ior={1.5}
            />
          </mesh>

          {/* Liquid stream when dispensing */}
          {dispensing && volume > 0 && (
            <Cylinder
              args={[0.002, 0.002, 0.15, 8]}
              position={[0, -0.12, 0]}
            >
              <meshStandardMaterial color={titrantColor} transparent opacity={0.6} emissive={titrantColor} emissiveIntensity={0.3} />
            </Cylinder>
          )}
        </group>
      </Interactive>
    </RigidBody>
  );
}

interface ConicalFlaskProps {
  position: [number, number, number];
  name?: string;
  initialVolume?: number;
  initialColor?: string;
  onColorChange?: (color: string) => void;
}

export function ConicalFlask({
  position: initialPos,
  name = "Analyte Solution",
  initialVolume = 25,
  initialColor = "#fca5a5",
  onColorChange,
}: ConicalFlaskProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [liquidColor, setLiquidColor] = useState(initialColor);
  const [volume, setVolume] = useState(initialVolume);
  
  const leftController = useController('left');
  const rightController = useController('right');
  const [grabbingController, setGrabbingController] = useState<'left' | 'right' | null>(null);

  useXREvent('selectstart', (e: any) => {
    if (hovered) {
      setGrabbed(true);
      const isLeft = e.target === leftController?.controller;
      setGrabbingController(isLeft ? 'left' : 'right');
      
      const inputSource = e.target?.inputSource;
      if (inputSource?.gamepad?.hapticActuators?.[0]) {
        inputSource.gamepad.hapticActuators[0].pulse(0.3, 100);
      }
    }
  });

  useXREvent('selectend', () => {
    if (grabbed) {
      setGrabbed(false);
      setGrabbingController(null);
    }
  });

  useFrame(() => {
    if (grabbed && grabbingController) {
      const controller = grabbingController === 'left' ? leftController : rightController;
      if (controller?.grip && rigidBodyRef.current) {
        const gripPos = new THREE.Vector3();
        controller.grip.getWorldPosition(gripPos);
        rigidBodyRef.current.setTranslation(gripPos, true);
        
        const gripQuat = new THREE.Quaternion();
        controller.grip.getWorldQuaternion(gripQuat);
        rigidBodyRef.current.setRotation(gripQuat, true);
      }
    }
  });

  // Function to add titrant and change color
  const addTitrant = (amount: number) => {
    const newVolume = volume + amount;
    setVolume(newVolume);
    
    // Simulate color change during titration (red -> pink -> colorless)
    const ratio = amount / newVolume;
    if (ratio > 0.4) {
      setLiquidColor("#fecdd3"); // Light pink - near endpoint
      onColorChange?.("#fecdd3");
    } else if (ratio > 0.45) {
      setLiquidColor("#fce7f3"); // Very light pink - endpoint
      onColorChange?.("#fce7f3");
    } else if (ratio > 0.48) {
      setLiquidColor("#f5f5f5"); // Colorless - past endpoint
      onColorChange?.("#f5f5f5");
    }
  };

  // Expose method for external control
  useEffect(() => {
    (window as any).addTitrantToFlask = addTitrant;
  }, [volume]);

  const flaskRadius = 0.1;
  const flaskHeight = 0.2;
  const fillLevel = volume / 100; // Assuming 100mL capacity

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={initialPos}
      mass={0.4}
      linearDamping={0.5}
      angularDamping={0.5}
      type={grabbed ? 'kinematicPosition' : 'dynamic'}
      colliders={false}
    >
      <CuboidCollider args={[flaskRadius * 1.2, flaskHeight / 2, flaskRadius * 1.2]} />
      
      <Interactive
        onHover={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <group ref={meshRef}>
          {hovered && !grabbed && (
            <mesh position={[0, flaskHeight / 2, 0]}>
              <cylinderGeometry args={[flaskRadius * 1.3, flaskRadius * 1.3, flaskHeight * 1.1, 32]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} />
            </mesh>
          )}
          
          {hovered && (
            <Text
              position={[0, flaskHeight + 0.15, 0]}
              fontSize={0.05}
              color="cyan"
              anchorX="center"
              anchorY="middle"
            >
              {name} - {volume.toFixed(1)}mL
              <meshBasicMaterial color="#0c4a6e" transparent opacity={0.9} depthTest={false} />
            </Text>
          )}

          {grabbed && (
            <mesh position={[0, flaskHeight / 2, 0]}>
              <cylinderGeometry args={[flaskRadius * 1.5, flaskRadius * 1.5, flaskHeight * 1.2, 32]} />
              <meshBasicMaterial color="#22d3ee" wireframe />
            </mesh>
          )}

          {/* Conical flask body */}
          <mesh position={[0, flaskHeight / 3, 0]} castShadow>
            <coneGeometry args={[flaskRadius, flaskHeight * 0.7, 32]} />
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.15}
              chromaticAberration={0.03}
              transmission={0.95}
              ior={1.5}
              roughness={0}
            />
          </mesh>

          {/* Neck */}
          <Cylinder args={[0.025, 0.04, 0.1, 16]} position={[0, flaskHeight - 0.05, 0]} castShadow>
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.1}
              transmission={0.95}
              ior={1.5}
            />
          </Cylinder>

          {/* Liquid */}
          <mesh position={[0, flaskHeight / 3 - (1 - fillLevel) * 0.08, 0]}>
            <coneGeometry args={[flaskRadius * 0.95 * fillLevel, flaskHeight * 0.7 * fillLevel, 32]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.7} roughness={0.1} metalness={0.1} />
          </mesh>
        </group>
      </Interactive>
    </RigidBody>
  );
}
