import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
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

  useEffect(() => {
    if (isPresenting || !enabled) return;

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
      if (!pointerLocked.current && !isPresenting) {
        gl.domElement.requestPointerLock();
      }
    };
    
    // Show instructions on first load
    if (!pointerLocked.current && !isPresenting) {
      const instruction = document.getElementById('pointer-lock-instruction');
      if (!instruction) {
        const div = document.createElement('div');
        div.id = 'pointer-lock-instruction';
        div.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:cyan;padding:20px;border-radius:10px;font-size:18px;z-index:1000;pointer-events:none;';
        div.innerHTML = '🖱️ Click anywhere to start moving<br><small style="color:#94a3b8">Use WASD to move, Mouse to look around</small>';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
      }
    }

    const onPointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    const onPointerLockError = () => {
      console.error('Pointer lock error');
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
      
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
    };
  }, [camera, gl, isPresenting, lookSpeed, enabled]);

  useFrame((state, delta) => {
    if (isPresenting || !enabled) return;

    const actualMoveSpeed = moveSpeed * delta * 60; // Normalize for 60fps

    velocity.current.x -= velocity.current.x * 8.0 * delta;
    velocity.current.z -= velocity.current.z * 8.0 * delta;
    velocity.current.y -= velocity.current.y * 8.0 * delta;

    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward);
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left);
    direction.current.y = Number(moveState.current.up) - Number(moveState.current.down);
    direction.current.normalize();

    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z -= direction.current.z * actualMoveSpeed;
    }
    if (moveState.current.left || moveState.current.right) {
      velocity.current.x -= direction.current.x * actualMoveSpeed;
    }
    if (moveState.current.up || moveState.current.down) {
      velocity.current.y += direction.current.y * actualMoveSpeed;
    }

    camera.translateX(velocity.current.x);
    camera.translateY(velocity.current.y);
    camera.translateZ(velocity.current.z);

    // Keep camera at reasonable height (min 0.5m, max 3m)
    camera.position.y = Math.max(0.5, Math.min(3, camera.position.y));
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
  
  const leftStick = useRef({ x: 0, y: 0 });
  const rightStick = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!isPresenting || !smoothMovementEnabled) return;

    // Get controller input (this is a simplified version)
    // In a real implementation, you'd access the gamepad API through XR controllers
    
    const moveVector = new THREE.Vector3();
    
    // Left stick for movement
    if (Math.abs(leftStick.current.x) > 0.1 || Math.abs(leftStick.current.y) > 0.1) {
      const forward = new THREE.Vector3(0, 0, -1);
      const right = new THREE.Vector3(1, 0, 0);
      
      forward.applyQuaternion(camera.quaternion);
      right.applyQuaternion(camera.quaternion);
      
      forward.y = 0;
      right.y = 0;
      forward.normalize();
      right.normalize();
      
      moveVector.add(forward.multiplyScalar(-leftStick.current.y * moveSpeed * delta));
      moveVector.add(right.multiplyScalar(leftStick.current.x * moveSpeed * delta));
      
      if (player) {
        player.position.add(moveVector);
      }
    }
    
    // Right stick for snap turning (optional)
    if (Math.abs(rightStick.current.x) > 0.8) {
      const turnAmount = Math.sign(rightStick.current.x) * Math.PI / 4; // 45 degree turns
      if (player) {
        player.rotation.y += turnAmount;
      }
    }
  });

  return null;
}
