import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Controllers, Hands, VRButton, XR } from '@react-three/xr';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { LabRoom } from './canvas/LabRoom';
import { LabBench, SafetyStation } from './canvas/LabBench';
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

            {/* Safety Station */}
            <SafetyStation position={[-4.5, 0, -1]} />

            {/* L-Shaped Workbench Array */}
            {/* Long side */}
            <LabBench position={[0, 0, -3]} length={6} showSink={true} />
            {/* Short side (creating the L) */}
            <LabBench position={[-3.45, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} length={4} />

            {/* Accurately Aligned Equipment on Main Bench */}
            <BunsenBurner position={[1, 0.95, -3]} />
            <DraggableItem 
              position={[-0.5, 0.95, -3]} 
              color="#ef4444" 
              type="flask" 
              name="HCl (Hydrochloric Acid)" 
              onSelect={() => onInteract("HCl")} 
            />
            <DraggableItem 
              position={[0, 0.95, -3]} 
              color="#3b82f6" 
              type="beaker" 
              name="Distilled Water" 
              onSelect={() => onInteract("Distilled Water")}
            />
            
            {/* Equipment on Side Bench */}
            <DraggableItem 
              position={[-3.45, 0.95, -1]} 
              color="#a855f7" 
              type="beaker" 
              name="Unknown Solution" 
              onSelect={() => onInteract("Unknown Solution")}
            />
            <DraggableItem 
              position={[-3.45, 0.95, 0]} 
              color="#22c55e" 
              type="cube" 
              name="Solid Reagent" 
              onSelect={() => onInteract("Solid Reagent")}
            />

          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
