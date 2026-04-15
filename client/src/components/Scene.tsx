import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Controllers, Hands, VRButton, XR } from '@react-three/xr';
import { PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { LabRoom } from './canvas/LabRoom';
import { LabBench, SafetyStation, FumeHood, Microscope, ComputerStation, Centrifuge } from './canvas/LabBench';
import { DraggableItem, BunsenBurner } from './canvas/Equipment';
import { PhysicsLabItem, AnalyticalBalance, DigitalThermometer } from './canvas/PhysicsEquipment';
import { RingStand, Hotplate, TestTubeRack, WasteContainer } from './canvas/SnapZones';
import { TrainingOverlay } from './TrainingOverlay';
import { PPEStation } from './canvas/PPESystem';
import { FirstPersonControls, VRLocomotion } from './canvas/FirstPersonControls';
import { Burette, ConicalFlask } from './canvas/TitrationEquipment';

interface SceneProps {
  onInteract: (item: string) => void;
}

export function Scene({ onInteract }: SceneProps) {
  return (
    <div className="w-full h-screen bg-black">
      <TrainingOverlay />
      
      {/* 
        NOTE: VRButton handles entering WebXR session. 
        It injects itself into the DOM.
      */}
      <VRButton />

      <Canvas 
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <XR>
          <Controllers />
          <Hands />
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 1.6, 3]} fov={75} />
            
            {/* Essential Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={0.4} />
            <pointLight position={[0, 3, 0]} intensity={0.5} />
            
            {/* First-person navigation controls */}
            <FirstPersonControls moveSpeed={5.0} />
            <VRLocomotion moveSpeed={3.0} />
            
            <Physics gravity={[0, -9.81, 0]} timeStep={1/60} paused={false}>

            <LabRoom />

            {/* Fume Hoods */}
            <FumeHood position={[4, 0, -3.5]} />
            <FumeHood position={[-4, 0, -3.5]} />

            {/* Computer Station */}
            <group rotation={[0, -Math.PI / 2, 0]}>
              <ComputerStation position={[4.5, 0, 1]} />
            </group>

            {/* Safety Station */}
            <SafetyStation position={[-4.5, 0, -1]} />
            <PPEStation position={[-4.5, 1.5, 0.5]} />

            {/* L-Shaped Workbench Array */}
            {/* Long side */}
            <LabBench position={[0, 0, -3]} length={6} showSink={true} />
            <Microscope position={[1.5, 0.95, -3]} />
            <Centrifuge position={[-1.5, 0.95, -3]} />
            
            {/* Short side (creating the L) */}
            <LabBench position={[-3.45, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} length={4} />

            {/* Physics-Based Equipment on Main Bench */}
            <BunsenBurner position={[1, 0.95, -3]} />
            
            <PhysicsLabItem
              position={[-0.5, 1.1, -3]}
              color="#ef4444"
              type="flask"
              name="HCl (Hydrochloric Acid)"
              mass={0.3}
              fillLevel={0.6}
              liquidColor="#fca5a5"
              onSelect={() => onInteract("HCl")}
            />
            
            <PhysicsLabItem
              position={[0, 1.1, -3]}
              color="#3b82f6"
              type="beaker"
              name="Distilled Water"
              mass={0.25}
              fillLevel={0.8}
              liquidColor="#bae6fd"
              onSelect={() => onInteract("Distilled Water")}
            />
            
            <PhysicsLabItem
              position={[0.5, 1.1, -3]}
              color="#a855f7"
              type="graduated_cylinder"
              name="Sodium Hydroxide Solution"
              mass={0.2}
              fillLevel={0.5}
              liquidColor="#e9d5ff"
              onSelect={() => onInteract("NaOH")}
            />
            
            {/* Measurement Equipment */}
            <AnalyticalBalance position={[-1.5, 0.95, -3]} />
            <DigitalThermometer position={[1.8, 0.95, -3]} />
            
            {/* Titration Equipment */}
            <Burette 
              position={[-0.8, 1.4, -3]} 
              titrantName="0.1M NaOH"
              titrantColor="#e9d5ff"
              initialVolume={50}
            />
            <ConicalFlask 
              position={[-0.8, 0.95, -3]}
              name="HCl + Indicator"
              initialVolume={25}
              initialColor="#fca5a5"
            />
            
            {/* Equipment on Side Bench */}
            <PhysicsLabItem
              position={[-3.45, 1.1, -1]}
              color="#10b981"
              type="beaker"
              name="Unknown Solution A"
              mass={0.25}
              fillLevel={0.7}
              liquidColor="#6ee7b7"
              onSelect={() => onInteract("Unknown A")}
            />
            
            <PhysicsLabItem
              position={[-3.45, 1.1, -0.5]}
              color="#f59e0b"
              type="flask"
              name="Unknown Solution B"
              mass={0.3}
              fillLevel={0.5}
              liquidColor="#fcd34d"
              onSelect={() => onInteract("Unknown B")}
            />
            
            {/* Lab Equipment and Stations */}
            <RingStand position={[-2.5, 0.95, -3]} />
            <Hotplate position={[2.2, 0.95, -3]} />
            <TestTubeRack position={[-3.45, 0.95, 0.5]} />
            
            {/* Waste Management */}
            <WasteContainer position={[3, 0, -3]} type="general" />
            <WasteContainer position={[3.5, 0, -3]} type="organic" />
            <WasteContainer position={[3, 0, -2]} type="aqueous" />
            <WasteContainer position={[3.5, 0, -2]} type="sharps" />

            </Physics>
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
