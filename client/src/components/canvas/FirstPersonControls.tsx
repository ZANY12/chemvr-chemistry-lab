import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useController, useXR } from '@react-three/xr';
import * as THREE from 'three';

interface FirstPersonControlsProps {
  moveSpeed?: number;
  lookSpeed?: number;
  enabled?: boolean;
}

export function FirstPersonControls({ 
  moveSpeed = 3.0, 
  lookSpeed = 0.002,
  enabled = true 
}: FirstPersonControlsProps) {
  const { camera, gl } = useThree();
  const { isPresenting } = useXR();
  
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const pointerLocked = useRef(false);

  const forwardVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const movementVec = useRef(new THREE.Vector3());

  useEffect(() => {
    if (isPresenting || !enabled) return;

    const canPointerLock =
      typeof (gl.domElement as any)?.requestPointerLock === 'function' &&
      typeof document !== 'undefined' &&
      typeof document.addEventListener === 'function' &&
      (typeof window === 'undefined' ||
        typeof window.matchMedia !== 'function' ||
        window.matchMedia('(pointer: fine)').matches);

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
        case 'Space':
          moveState.current.up = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.down = true;
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
        case 'Space':
          moveState.current.up = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.down = false;
          break;
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!pointerLocked.current) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= movementX * lookSpeed;
      euler.current.x -= movementY * lookSpeed;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    const onClick = () => {
      if (!canPointerLock) return;
      if (!pointerLocked.current && !isPresenting) {
        (gl.domElement as any).requestPointerLock();
      }
    };

    const onPointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    const onPointerLockError = () => {
      // Intentionally suppressed to avoid user-facing banner/noise.
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    gl.domElement.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
      gl.domElement.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      
      if (canPointerLock && document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
    };
  }, [camera, gl, isPresenting, lookSpeed, enabled]);

  useFrame((state, delta) => {
    if (isPresenting || !enabled) return;

    const actualMoveSpeed = moveSpeed * delta;

    // Calculate movement direction
    const moveX = Number(moveState.current.right) - Number(moveState.current.left);
    const moveZ = Number(moveState.current.forward) - Number(moveState.current.backward);
    const moveY = Number(moveState.current.up) - Number(moveState.current.down);

    // Apply movement if any keys are pressed
    if (moveX !== 0 || moveZ !== 0 || moveY !== 0) {
      const forward = forwardVec.current;
      const right = rightVec.current;
      const movement = movementVec.current;

      movement.set(0, 0, 0);

      camera.getWorldDirection(forward);
      right.crossVectors(camera.up, forward).normalize();
      forward.normalize();
      
      // Zero out Y component for horizontal movement
      forward.y = 0;
      forward.normalize();
      right.y = 0;
      right.normalize();
      
      movement.add(forward.multiplyScalar(-moveZ * actualMoveSpeed));
      movement.add(right.multiplyScalar(moveX * actualMoveSpeed));
      movement.y = moveY * actualMoveSpeed;
      
      // Apply movement to camera
      camera.position.add(movement);
    }

    // Keep camera at reasonable height (min 1.0m, max 3m)
    camera.position.y = Math.max(1.0, Math.min(3, camera.position.y));
  });

  return null;
}

// VR Locomotion Component
export function VRLocomotion({ 
  moveSpeed = 2.0,
  teleportEnabled = true,
  smoothMovementEnabled = true 
}: { 
  moveSpeed?: number;
  teleportEnabled?: boolean;
  smoothMovementEnabled?: boolean;
}) {
  const { camera } = useThree();
  const { isPresenting, player } = useXR();

  const leftController = useController('left');
  const rightController = useController('right');
  
  const moveVector = useRef(new THREE.Vector3());
  const forwardVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());

  const snapTurnCooldownUntilMs = useRef(0);

  const getAxes = (source: any): number[] => {
    const axes = source?.inputSource?.gamepad?.axes;
    return Array.isArray(axes) ? axes : [];
  };

  const applyDeadzone = (v: number, deadzone: number) => {
    if (Math.abs(v) < deadzone) return 0;
    return v;
  };

  useFrame((state, delta) => {
    if (!isPresenting || !smoothMovementEnabled) return;

    const mv = moveVector.current;
    mv.set(0, 0, 0);

    const leftAxes = getAxes(leftController);
    const rightAxes = getAxes(rightController);

    const lx = applyDeadzone(leftAxes[0] ?? 0, 0.15);
    const ly = applyDeadzone(leftAxes[1] ?? 0, 0.15);
    const rx = applyDeadzone(rightAxes[2] ?? rightAxes[0] ?? 0, 0.25);

    if (lx !== 0 || ly !== 0) {
      const forward = forwardVec.current;
      const right = rightVec.current;

      forward.set(0, 0, -1);
      right.set(1, 0, 0);

      forward.applyQuaternion(camera.quaternion);
      right.applyQuaternion(camera.quaternion);

      forward.y = 0;
      right.y = 0;
      forward.normalize();
      right.normalize();

      mv.add(forward.multiplyScalar(-ly * moveSpeed * delta));
      mv.add(right.multiplyScalar(lx * moveSpeed * delta));

      if (player) {
        player.position.add(mv);
      }
    }

    const now = performance.now();
    if (Math.abs(rx) > 0.75 && now >= snapTurnCooldownUntilMs.current) {
      const turnAmount = Math.sign(rx) * Math.PI / 6;
      if (player) {
        player.rotation.y += turnAmount;
      }
      snapTurnCooldownUntilMs.current = now + 250;
    }
  });

  return null;
}
