import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Controllers, Hands, VRButton, XR } from '@react-three/xr';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { LabRoom } from './canvas/LabRoom';
import { LabBench } from './canvas/LabBench';
import { DraggableItem, BunsenBurner } from './canvas/Equipment';

interface SceneProps {
  onInteract: (item: string) => void;
}

export function Scene({ onInteract }: SceneProps) {
  return (
    <div className="w-full h-screen bg-black">
      {/* 
        NOTE: VRButton handles entering WebXR session. 
        It injects itself into the DOM.
      */}
      <VRButton />

      <Canvas shadows>
        <XR>
          <Controllers />
          <Hands />
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 1.6, 3]} />
            <OrbitControls target={[0, 1, 0]} />

            <LabRoom />

            {/* Left Bench */}
            <LabBench position={[-2, 0, 0]} rotation={[0, Math.PI / 4, 0]} />
            <DraggableItem 
              position={[-2, 0.95, 0]} 
              color="#ef4444" 
              type="flask" 
              name="Chemical A" 
              onSelect={() => onInteract("Chemical A")} 
            />
            <DraggableItem 
              position={[-1.8, 0.95, 0.3]} 
              color="#3b82f6" 
              type="beaker" 
              name="Solvent" 
              onSelect={() => onInteract("Solvent")}
            />

            {/* Right Bench */}
            <LabBench position={[2, 0, 0]} rotation={[0, -Math.PI / 4, 0]} />
            <BunsenBurner position={[2, 0.95, 0]} />
            <DraggableItem 
              position={[1.8, 0.95, 0.3]} 
              color="#22c55e" 
              type="cube" 
              name="Sample 12" 
              onSelect={() => onInteract("Sample 12")}
            />
            
            {/* Center Bench (Main) */}
            <LabBench position={[0, 0, -2]} />
             <DraggableItem 
              position={[0, 0.95, -2]} 
              color="#a855f7" 
              type="beaker" 
              name="Reaction Mix" 
              onSelect={() => onInteract("Reaction Mix")}
            />

          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
