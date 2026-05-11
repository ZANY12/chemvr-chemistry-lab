import React, { useMemo } from 'react';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';

function PeriodicTableTexturePlane() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const headerH = 120;
    const gridX = padding;
    const gridY = padding + headerH;
    const gridW = canvas.width - padding * 2;
    const gridH = canvas.height - gridY - padding;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PERIODIC TABLE OF ELEMENTS', canvas.width / 2, padding + 55);

    const cols = 18;
    const rows = 10;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.lineWidth = 2;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = gridX + x * cellW;
        const py = gridY + y * cellH;
        ctx.fillStyle = (x + y) % 2 === 0 ? '#f8fafc' : '#eef2ff';
        ctx.fillRect(px, py, cellW, cellH);
        ctx.strokeRect(px, py, cellW, cellH);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 2;
    tex.needsUpdate = true;
    return tex;
  }, []);

  if (!texture) return null;

  return (
    <mesh position={[0, 0.35, 0.18]}>
      <planeGeometry args={[9.3, 3.6]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export function LabRoom() {
  const floorSize = 20;

  return (
    <group>
      {/* Floor with professional tiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.1} metalness={0.02} />
      </mesh>
      <gridHelper args={[floorSize, 40, 0x94a3b8, 0xe2e8f0]} position={[0, 0.01, 0]} />

      {/* Ceiling with structural details */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Industrial Ceiling Pipes */}
      <group position={[0, 3.8, 0]}>
        {[ -2, 0, 2 ].map((z) => (
          <mesh key={z} rotation={[0, 0, Math.PI / 2]} position={[0, 0, z]}>
            <cylinderGeometry args={[0.08, 0.08, floorSize]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[-3, 0.1, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.6]} />
          <meshStandardMaterial color="#475569" metalness={0.5} />
        </mesh>
      </group>

      {/* Walls with professional finish */}
      <group position={[0, 2, -floorSize / 2]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
        
        <group position={[0, 0.4, 0.15]}>
          <mesh>
            <boxGeometry args={[9.5, 3.8, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.1} />
          </mesh>
          <PeriodicTableTexturePlane />
        </group>
      </group>

      {/* Left Wall Poster Group */}
      <group position={[-floorSize / 2, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>

        <group position={[-4, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[3, 3, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.1} />
          </mesh>
        </group>

        <group position={[0, 0.5, 0.15]}>
          <mesh>
            <boxGeometry args={[3.5, 3, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Right Wall */}
      <group position={[floorSize / 2, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 4, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
      </group>

      <pointLight position={[0, 3, 0]} intensity={0.2} distance={15} color="#f8fafc" />
    </group>
  );
}
