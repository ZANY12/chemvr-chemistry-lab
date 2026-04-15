import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { Interactive, useXREvent, useController } from '@react-three/xr';
import { Text, Cylinder, Sphere, Box, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useLabTraining } from '../../lib/labTrainingSystem';

interface PhysicsLabItemProps {
  position: [number, number, number];
  color: string;
  type: 'flask' | 'beaker' | 'graduated_cylinder' | 'test_tube';
  name: string;
  mass?: number;
  fillLevel?: number;
  liquidColor?: string;
  onSelect?: () => void;
  onPour?: (amount: number) => void;
}

export function PhysicsLabItem({
  position: initialPos,
  color: initialColor,
  type,
  name,
  mass = 0.2,
  fillLevel: initialFill = 0.7,
  liquidColor: initialLiquidColor,
  onSelect,
  onPour,
}: PhysicsLabItemProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [fillLevel, setFillLevel] = useState(initialFill);
  const [liquidColor, setLiquidColor] = useState(initialLiquidColor || initialColor);
  const [tiltAngle, setTiltAngle] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  
  const leftController = useController('left');
  const rightController = useController('right');
  const [grabbingController, setGrabbingController] = useState<'left' | 'right' | null>(null);
  
  const { addSafetyViolation } = useLabTraining();

  // Handle controller grab
  useXREvent('selectstart', (e: any) => {
    if (hovered) {
      setGrabbed(true);
      const isLeft = e.target === leftController?.controller;
      setGrabbingController(isLeft ? 'left' : 'right');
      
      // Haptic feedback on grab
      const inputSource = e.target?.inputSource;
      if (inputSource?.gamepad?.hapticActuators?.[0]) {
        inputSource.gamepad.hapticActuators[0].pulse(0.3, 100);
      }
      
      onSelect?.();
    }
  });

  useXREvent('selectend', () => {
    if (grabbed) {
      setGrabbed(false);
      setGrabbingController(null);
      
      // Check for spills
      if (tiltAngle > 90 && fillLevel > 0) {
        addSafetyViolation({
          type: 'spill',
          severity: 'warning',
          message: `Spilled ${name} - cleanup required`,
        });
      }
    }
  });

  // Track tilt angle for pouring
  useFrame(() => {
    if (!meshRef.current) return;

    const rotation = meshRef.current.rotation;
    const angle = Math.abs(rotation.z) * (180 / Math.PI);
    setTiltAngle(angle);

    // Pouring logic
    if (grabbed && angle > 60 && fillLevel > 0) {
      if (!isPouring) {
        setIsPouring(true);
      }
      const pourRate = 0.002 * (angle / 90);
      const newFill = Math.max(0, fillLevel - pourRate);
      setFillLevel(newFill);
      
      if (onPour) {
        onPour(pourRate);
      }

      // Haptic feedback while pouring
      const controller = grabbingController === 'left' ? leftController : rightController;
      if (controller?.inputSource?.gamepad?.hapticActuators?.[0]) {
        controller.inputSource.gamepad.hapticActuators[0].pulse(0.1, 50);
      }
    } else if (isPouring) {
      setIsPouring(false);
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

  const GlassMaterial = () => (
    <MeshTransmissionMaterial
      backside
      samples={8}
      thickness={0.15}
      chromaticAberration={0.03}
      anisotropy={0.1}
      distortion={0.05}
      clearcoat={1}
      transmission={0.95}
      ior={1.5}
      roughness={0}
    />
  );

  const dimensions = {
    beaker: { radius: 0.08, height: 0.2 },
    flask: { radius: 0.1, height: 0.25 },
    graduated_cylinder: { radius: 0.04, height: 0.3 },
    test_tube: { radius: 0.015, height: 0.15 },
  }[type];

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={initialPos}
      mass={mass}
      linearDamping={0.5}
      angularDamping={0.5}
      type={grabbed ? 'kinematicPosition' : 'dynamic'}
      colliders={false}
    >
      {/* Larger collider for easier grabbing */}
      <CuboidCollider args={[dimensions.radius * 1.3, dimensions.height / 2 * 1.2, dimensions.radius * 1.3]} />
      
      <Interactive
        onHover={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <group ref={meshRef}>
          {/* Glow effect when hoverable */}
          {hovered && !grabbed && (
            <mesh position={[0, dimensions.height / 2, 0]}>
              <cylinderGeometry args={[dimensions.radius * 1.2, dimensions.radius * 1.2, dimensions.height * 1.1, 32]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} />
            </mesh>
          )}
          
          {hovered && (
            <Text
              position={[0, dimensions.height + 0.15, 0]}
              fontSize={0.06}
              color="cyan"
              anchorX="center"
              anchorY="middle"
            >
              {name}
              <meshBasicMaterial color="#0c4a6e" transparent opacity={0.9} depthTest={false} />
            </Text>
          )}

          {grabbed && (
            <mesh position={[0, dimensions.height / 2, 0]}>
              <cylinderGeometry args={[dimensions.radius * 1.4, dimensions.radius * 1.4, dimensions.height * 1.2, 32]} />
              <meshBasicMaterial color="#22d3ee" wireframe />
            </mesh>
          )}

          {/* Container based on type */}
          {type === 'beaker' && (
            <group>
              <Cylinder args={[dimensions.radius, dimensions.radius, dimensions.height, 32]} position={[0, dimensions.height / 2, 0]} castShadow>
                <GlassMaterial />
              </Cylinder>
              {/* Liquid */}
              <Cylinder
                args={[dimensions.radius * 0.95, dimensions.radius * 0.95, dimensions.height * fillLevel, 32]}
                position={[0, (dimensions.height * fillLevel) / 2, 0]}
              >
                <meshStandardMaterial color={liquidColor} transparent opacity={0.7} roughness={0.1} metalness={0.1} />
              </Cylinder>
              {/* Measurement marks */}
              {[0.25, 0.5, 0.75, 1.0].map((mark, i) => (
                <Text
                  key={i}
                  position={[dimensions.radius + 0.01, dimensions.height * mark, 0]}
                  fontSize={0.015}
                  color="#334155"
                  anchorX="left"
                >
                  {Math.round(mark * 250)}mL
                </Text>
              ))}
            </group>
          )}

          {type === 'flask' && (
            <group>
              {/* Neck */}
              <Cylinder args={[0.02, 0.04, 0.1, 32]} position={[0, dimensions.height - 0.05, 0]} castShadow>
                <GlassMaterial />
              </Cylinder>
              {/* Body */}
              <Sphere args={[dimensions.radius, 32, 32]} position={[0, dimensions.height / 3, 0]} scale={[1, 0.8, 1]} castShadow>
                <GlassMaterial />
              </Sphere>
              {/* Liquid */}
              <Sphere
                args={[dimensions.radius * 0.95, 32, 32]}
                position={[0, dimensions.height / 3 - (1 - fillLevel) * 0.1, 0]}
                scale={[1, 0.8 * fillLevel, 1]}
              >
                <meshStandardMaterial color={liquidColor} transparent opacity={0.7} roughness={0.1} metalness={0.1} />
              </Sphere>
            </group>
          )}

          {type === 'graduated_cylinder' && (
            <group>
              <Cylinder args={[dimensions.radius, dimensions.radius, dimensions.height, 32]} position={[0, dimensions.height / 2, 0]} castShadow>
                <GlassMaterial />
              </Cylinder>
              {/* Liquid with meniscus */}
              <Cylinder
                args={[dimensions.radius * 0.95, dimensions.radius * 0.95, dimensions.height * fillLevel, 32]}
                position={[0, (dimensions.height * fillLevel) / 2, 0]}
              >
                <meshStandardMaterial color={liquidColor} transparent opacity={0.7} roughness={0.1} metalness={0.1} />
              </Cylinder>
              {/* Detailed graduation marks */}
              {Array.from({ length: 11 }).map((_, i) => (
                <Text
                  key={i}
                  position={[dimensions.radius + 0.005, (dimensions.height / 10) * i, 0]}
                  fontSize={0.01}
                  color="#1e293b"
                  anchorX="left"
                >
                  {i * 10}
                </Text>
              ))}
            </group>
          )}

          {type === 'test_tube' && (
            <group>
              <Cylinder args={[dimensions.radius, dimensions.radius, dimensions.height, 16]} position={[0, dimensions.height / 2, 0]} castShadow>
                <GlassMaterial />
              </Cylinder>
              <Cylinder
                args={[dimensions.radius * 0.9, dimensions.radius * 0.9, dimensions.height * fillLevel, 16]}
                position={[0, (dimensions.height * fillLevel) / 2, 0]}
              >
                <meshStandardMaterial color={liquidColor} transparent opacity={0.7} roughness={0.1} metalness={0.1} />
              </Cylinder>
            </group>
          )}

          {/* Pour stream effect */}
          {isPouring && (
            <group>
              <mesh position={[0, -dimensions.height / 2, dimensions.radius]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.005, 0.008, 0.3]} />
                <meshStandardMaterial color={liquidColor} transparent opacity={0.6} />
              </mesh>
            </group>
          )}
        </group>
      </Interactive>
    </RigidBody>
  );
}

// Analytical Balance with realistic behavior
export function AnalyticalBalance({ position }: { position: [number, number, number] }) {
  const [weight, setWeight] = useState(0);
  const [tared, setTared] = useState(false);
  const [stabilizing, setStabilizing] = useState(false);
  const [displayWeight, setDisplayWeight] = useState(0);
  const { recordMeasurement } = useLabTraining();

  useFrame(() => {
    if (stabilizing) {
      // Simulate drift and stabilization
      const drift = (Math.random() - 0.5) * 0.001;
      setDisplayWeight(prev => prev + drift);
    } else {
      setDisplayWeight(weight);
    }
  });

  const handleTare = () => {
    setTared(true);
    setWeight(0);
    setDisplayWeight(0);
    setStabilizing(true);
    setTimeout(() => setStabilizing(false), 2000);
  };

  const handleMeasure = () => {
    recordMeasurement('mass', displayWeight, 'g');
  };

  return (
    <group position={position}>
      {/* Base */}
      <Box args={[0.3, 0.05, 0.25]} position={[0, 0.025, 0]}>
        <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.2} />
      </Box>
      
      {/* Weighing platform */}
      <Box args={[0.15, 0.01, 0.15]} position={[0, 0.06, 0]}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.1} />
      </Box>

      {/* Display */}
      <Box args={[0.2, 0.08, 0.02]} position={[0, 0.08, -0.1]}>
        <meshStandardMaterial color="#020617" />
      </Box>
      <Text position={[0, 0.08, -0.09]} fontSize={0.025} color="#22d3ee" anchorX="center">
        {displayWeight.toFixed(3)} g
      </Text>
      <Text position={[0, 0.05, -0.09]} fontSize={0.01} color={stabilizing ? '#fbbf24' : '#10b981'} anchorX="center">
        {stabilizing ? 'STABILIZING...' : 'READY'}
      </Text>

      {/* Tare button */}
      <Interactive onSelectStart={handleTare}>
        <Box args={[0.04, 0.015, 0.03]} position={[-0.08, 0.03, -0.1]}>
          <meshStandardMaterial color="#475569" />
        </Box>
        <Text position={[-0.08, 0.04, -0.09]} fontSize={0.008} color="white">
          TARE
        </Text>
      </Interactive>

      {/* Measure button */}
      <Interactive onSelectStart={handleMeasure}>
        <Box args={[0.04, 0.015, 0.03]} position={[0.08, 0.03, -0.1]}>
          <meshStandardMaterial color="#0891b2" />
        </Box>
        <Text position={[0.08, 0.04, -0.09]} fontSize={0.008} color="white">
          SAVE
        </Text>
      </Interactive>
    </group>
  );
}

// Thermometer with lag
export function DigitalThermometer({ position }: { position: [number, number, number] }) {
  const [temperature, setTemperature] = useState(22.0);
  const [targetTemp, setTargetTemp] = useState(22.0);
  const { recordMeasurement } = useLabTraining();

  useFrame(() => {
    // Simulate thermal lag
    setTemperature(prev => prev + (targetTemp - prev) * 0.05);
  });

  return (
    <group position={position}>
      <Cylinder args={[0.015, 0.015, 0.25]} position={[0, 0.125, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.5} />
      </Cylinder>
      <Box args={[0.06, 0.04, 0.015]} position={[0, 0.27, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>
      <Text position={[0, 0.27, 0.01]} fontSize={0.015} color="#22d3ee" anchorX="center">
        {temperature.toFixed(1)}°C
      </Text>
      <Interactive onSelectStart={() => recordMeasurement('temperature', temperature, '°C')}>
        <Sphere args={[0.02, 16, 16]} position={[0, 0.01, 0]}>
          <meshStandardMaterial color="#ef4444" metalness={0.3} />
        </Sphere>
      </Interactive>
    </group>
  );
}
