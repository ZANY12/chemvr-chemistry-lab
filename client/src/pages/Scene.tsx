import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { LabRoom } from '../components/canvas/LabRoom';
import { LabBench } from '../components/canvas/LabBench';
import { 
  DraggableItem, 
  BunsenBurner, 
  MagneticStirrer, 
  VortexMixer, 
  Whiteboard, 
  BotanicalSample 
} from '../components/canvas/Equipment';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, ContactShadows } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';

// Note: ProfessionalEquipment components were moved to LabBench.tsx for simplicity and to avoid import issues
import { FumeHood, Microscope, Centrifuge, ComputerStation, SafetyStation } from '../components/canvas/LabBench';

export default function Scene() {
  const [, setLocation] = useLocation();
  const [lastAction, setLastAction] = useState<string>('Ready');

  const handleEquipmentSelect = (name: string) => {
    setLastAction(`Selected: ${name}`);
  };

  return (
    <div className="w-full h-full relative bg-[#0f172a]">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-slate-700 shadow-xl">
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
            VR Chemistry Lab
          </h1>
          <p className="text-slate-400 text-sm mt-1">Status: <span className="text-cyan-400 font-mono">{lastAction}</span></p>
        </div>
        <button
          onClick={() => setLocation('/')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md transition-colors border border-slate-700 text-sm font-medium w-fit"
          data-testid="button-back-to-dashboard"
        >
          Back to Dashboard
        </button>
      </div>

      <VRButton />
      
      <Canvas shadows>
        <XR>
          <Controllers />
          <Hands />
          
          <PerspectiveCamera makeDefault position={[0, 1.6, 3]} />
          <OrbitControls 
            target={[0, 1, 0]} 
            maxPolarAngle={Math.PI / 2}
            minDistance={1}
            maxDistance={8}
          />
          
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.5} />
          
          <group>
            <LabRoom />
            
            {/* L-Shaped Bench Layout */}
            <LabBench position={[0, 0, -2]} rotation={[0, 0, 0]} length={6} showSink={true} />
            <LabBench position={[-3, 0, 0.5]} rotation={[0, Math.PI / 2, 0]} length={5} />
            
            {/* Professional Equipment Setup */}
            <FumeHood position={[2, 0, -1.9]} />
            <FumeHood position={[4, 0, -1.9]} />
            
            <Microscope position={[-2.8, 0.9, 0.5]} />
            <Centrifuge position={[-2.8, 0.9, 1.5]} />
            
            <ComputerStation position={[-2.8, 0.9, -1.5]} />
            
            <SafetyStation position={[4.5, 0, 4.5]} />

            {/* Interactive Equipment */}
            <group position={[0, 0.9, -2]}>
              <DraggableItem 
                position={[-1, 0, 0.2]} 
                color="#3b82f6" 
                type="flask" 
                name="Copper Sulfate"
                onSelect={() => handleEquipmentSelect('Flask')}
              />
              <DraggableItem 
                position={[-0.5, 0, 0.2]} 
                color="#ef4444" 
                type="beaker" 
                name="Phenol Red"
                onSelect={() => handleEquipmentSelect('Beaker')}
              />
              <DraggableItem 
                position={[0.5, 0, 0.2]} 
                color="#10b981" 
                type="flask" 
                name="Nickel Chloride"
                onSelect={() => handleEquipmentSelect('Nickel Flask')}
              />
              <MagneticStirrer position={[1.2, 0, 0.2]} />
              <VortexMixer position={[-1.5, 0, 0.2]} />
              <BunsenBurner position={[0, 0, 0.2]} />
            </group>

            {/* Architectural & Educational Additions */}
            <Whiteboard position={[0, 2.2, -4.8]} rotation={[0, 0, 0]} />
            
            <group position={[-4.8, 0.9, -1]}>
              <BotanicalSample position={[0, 0, 0]} />
              <BotanicalSample position={[0.2, 0, 0.2]} />
            </group>
            
            <ContactShadows 
              position={[0, 0.01, 0]} 
              opacity={0.4} 
              scale={20} 
              blur={2} 
              far={4.5} 
            />
          </group>
        </XR>
      </Canvas>
    </div>
  );
}
