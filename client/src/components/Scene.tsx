import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Controllers, Hands, VRButton, XR } from '@react-three/xr';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { LabRoom } from './canvas/LabRoom';
import { LabBench, SafetyStation, FumeHood, Microscope, ComputerStation, Centrifuge } from './canvas/LabBench';
import { DraggableItem, BunsenBurner } from './canvas/Equipment';
import { PhysicsLabItem, AnalyticalBalance, DigitalThermometer } from './canvas/PhysicsEquipment';
import { RingStand, Hotplate, TestTubeRack, WasteContainer } from './canvas/SnapZones';
import { TrainingOverlay } from './TrainingOverlay';
import { PPEStation } from './canvas/PPESystem';
import { FirstPersonControls, VRLocomotion } from './canvas/FirstPersonControls';
import { useLabTraining } from '../lib/labTrainingSystem';
import { Burette, ConicalFlask } from './canvas/TitrationEquipment';
import { PerformanceMonitor } from './canvas/PerformanceMonitor';
import { ExperimentStarter } from './canvas/ExperimentStarter';
import { ApparatusMenu } from './ApparatusMenu';
import { AIAssistant } from './AIAssistant';
import { progressTracker } from '../lib/progressTracker';
import { ExperimentReport } from './ExperimentReport';
import type { ExperimentSession } from '../lib/progressTracker';
import { Button } from './ui/button';

interface SceneProps {
  onInteract: (item: string) => void;
}

// Component to track mouse and convert to 3D position using raycasting
function MouseTracker({ 
  mousePos, 
  draggingApparatus,
  onPositionUpdate,
  onProximityCheck
}: { 
  mousePos: { x: number; y: number };
  draggingApparatus: string | null;
  onPositionUpdate: (pos: [number, number, number]) => void;
  onProximityCheck: (apparatus: string, position: [number, number, number]) => void;
}) {
  const { camera, size } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 1.5)); // Plane at Z = -1.5

  useFrame(() => {
    if (draggingApparatus && mousePos) {
      // Set raycaster from camera through mouse position
      raycaster.current.setFromCamera(new THREE.Vector2(mousePos.x, mousePos.y), camera);
      
      // Find intersection with plane
      const target = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, target);
      
      if (target) {
        // Clamp to reasonable bounds
        const clampedX = Math.max(-3, Math.min(3, target.x));
        const clampedY = Math.max(0.5, Math.min(3, target.y));
        const clampedZ = -1.5; // Keep at fixed depth
        
        const newPos: [number, number, number] = [clampedX, clampedY, clampedZ];
        console.log(`🖱️ MouseTracker: Dragging ${draggingApparatus} to`, newPos);
        onPositionUpdate(newPos);
        
        // Check proximity for step completion
        onProximityCheck(draggingApparatus, newPos);
      }
    }
  });

  return null;
}

// Component to handle draggable apparatus with kinematic updates
function DraggableApparatus({ 
  children, 
  apparatusRef,
  dragPosition,
  isDragging,
  defaultPosition,
  rotation
}: { 
  children: React.ReactNode;
  apparatusRef: React.RefObject<RapierRigidBody>;
  dragPosition: [number, number, number] | null;
  isDragging: boolean;
  defaultPosition: [number, number, number];
  rotation: [number, number, number];
}) {
  useFrame(() => {
    if (apparatusRef.current && dragPosition && isDragging) {
      // Update position using setNextKinematicTranslation for smooth movement
      apparatusRef.current.setNextKinematicTranslation({
        x: dragPosition[0],
        y: dragPosition[1],
        z: dragPosition[2]
      });
    }
  });

  return (
    <RigidBody
      ref={apparatusRef}
      position={dragPosition || defaultPosition}
      rotation={rotation}
      type={isDragging ? "kinematicPosition" : "fixed"}
    >
      {children}
    </RigidBody>
  );
}

export function Scene({ onInteract }: SceneProps) {
  const { completeStep, currentStepIndex, currentExperiment, experimentSteps, recordMeasurement, gogglesOn, labCoatOn, glovesOn, canProceed, getCurrentStep } = useLabTraining();
  
  // Determine which apparatus to show based on experiment
  const getExperimentApparatus = () => {
    if (!currentExperiment) return 'titration'; // Show titration by default
    
    if (currentExperiment.includes('titration')) return 'titration';
    if (currentExperiment.includes('acidity')) return 'acidity';
    if (currentExperiment.includes('reaction')) return 'reaction';
    
    return 'titration'; // Default to titration
  };
  
  const experimentType = getExperimentApparatus();
  
  const [selectedApparatus, setSelectedApparatus] = useState<string | null>(null);
  const [grabbedApparatus, setGrabbedApparatus] = useState<string | null>(null);
  const [draggingApparatus, setDraggingApparatus] = useState<string | null>(null);
  const [apparatusStates, setApparatusStates] = useState<Record<string, { grabbed: boolean; pouring: boolean; dragging: boolean }>>({});
  const [dragPositions, setDragPositions] = useState<Record<string, [number, number, number]>>({});
  const [targetDragPositions, setTargetDragPositions] = useState<Record<string, [number, number, number]>>({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [recentAction, setRecentAction] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [completedSession, setCompletedSession] = useState<ExperimentSession | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [acidityReadings, setAcidityReadings] = useState<Record<string, number>>({});
  const activeExperimentRef = useRef<string | null>(null);
  const completedStepIdsRef = useRef<Set<string>>(new Set());
  
  // Refs for apparatus RigidBodies
  const buretteRef = useRef<RapierRigidBody>(null);
  const flaskRef = useRef<RapierRigidBody>(null);
  const beakerRef = useRef<RapierRigidBody>(null);
  const cylinderRef = useRef<RapierRigidBody>(null);

  const experimentDisplayName = useMemo(() => {
    if (!currentExperiment) return null;
    if (currentExperiment === 'acidity-testing') return 'Acidity Testing';
    if (currentExperiment === 'chemical-reaction-test') return 'Chemical Reaction Test';
    if (currentExperiment.includes('titration')) return 'Acid-Base Titration';
    return currentExperiment;
  }, [currentExperiment]);

  // Start a new progress-tracking session whenever a new experiment starts.
  useEffect(() => {
    if (!currentExperiment || experimentSteps.length === 0) {
      activeExperimentRef.current = null;
      setSessionStarted(false);
      completedStepIdsRef.current = new Set();
      return;
    }

    if (activeExperimentRef.current !== currentExperiment) {
      // End any previous session if it exists
      const prevSession = progressTracker.endSession();
      if (prevSession) {
        setCompletedSession(prevSession);
        setShowReport(true);
      }

      progressTracker.startSession(experimentDisplayName ?? currentExperiment, 'Student');
      activeExperimentRef.current = currentExperiment;
      setSessionStarted(true);
      completedStepIdsRef.current = new Set();

      const firstStep = experimentSteps[0];
      if (firstStep) {
        progressTracker.startStep(firstStep.id, firstStep.title);
      }
    }
  }, [currentExperiment, experimentSteps, experimentDisplayName]);

  // Track step changes for the active experiment.
  useEffect(() => {
    if (!sessionStarted || !currentExperiment) return;
    const step = experimentSteps[currentStepIndex];
    if (!step) return;
    progressTracker.startStep(step.id, step.title);
  }, [currentStepIndex, currentExperiment, experimentSteps, sessionStarted]);

  // Detect and record step completions into the progress tracker.
  useEffect(() => {
    if (!sessionStarted || !currentExperiment) return;
    for (const step of experimentSteps) {
      if (step.completed && !completedStepIdsRef.current.has(step.id)) {
        completedStepIdsRef.current.add(step.id);
        progressTracker.completeStep(step.id, true);
      }
    }
  }, [experimentSteps, currentExperiment, sessionStarted]);

  useEffect(() => {
    if (!currentExperiment) return;
    const step = getCurrentStep();
    if (!step || step.completed) return;
    if (!step.ppeRequired?.length) return;

    if (canProceed()) {
      completeStep(step.id);
    }
  }, [canProceed, completeStep, currentExperiment, getCurrentStep, gogglesOn, glovesOn, labCoatOn]);

  const handleFlaskClick = () => {
    setSelectedApparatus("Conical Flask");
    onInteract("Conical Flask");
    if (currentStepIndex === 1) {
      completeStep('titration-2');
    }
  };

  const handleBeakerClick = () => {
    setSelectedApparatus("Beaker");
    onInteract("Beaker");
  };

  const handleCylinderClick = () => {
    setSelectedApparatus("Graduated Cylinder");
    onInteract("Graduated Cylinder");
  };
  
  const handleGrab = (apparatus: string) => {
    setGrabbedApparatus(apparatus);
    setApparatusStates(prev => ({
      ...prev,
      [apparatus]: { grabbed: true, pouring: false, dragging: false }
    }));
    setRecentAction(`Grabbed ${apparatus}`);
    
    // Basic completion trigger: grabbing apparatus counts as progress only if the current step is an equipment/setup step.
    const step = experimentSteps[currentStepIndex];
    if (step && !step.completed && step.equipmentRequired?.length) {
      completeStep(step.id);
    }
  };
  
  const handleDrag = (apparatus: string) => {
    const isDragging = apparatusStates[apparatus]?.dragging;
    console.log(`🎯 handleDrag called for ${apparatus}, currently dragging: ${isDragging}`);
    
    if (!isDragging) {
      // Starting drag - initialize position
      const currentPos = dragPositions[apparatus];
      if (!currentPos) {
        // Set initial drag position based on current apparatus position
        const initialPos: [number, number, number] = 
          apparatus === "Burette" ? [1.4, 1.8, -1.2] :
          apparatus === "Conical Flask" ? [0.2, 1.6, -1.2] :
          apparatus === "Graduated Cylinder" ? [0.8, 1.6, -1.2] :
          [-0.5, 1.6, -1.2]; // Beaker
        
        console.log(`📍 Setting initial position for ${apparatus}:`, initialPos);
        setDragPositions(prev => ({
          ...prev,
          [apparatus]: initialPos
        }));
      }
    }
    
    setDraggingApparatus(isDragging ? null : apparatus);
    setApparatusStates(prev => ({
      ...prev,
      [apparatus]: { ...prev[apparatus], dragging: !isDragging }
    }));
    console.log(`✅ Drag state updated: ${apparatus} dragging = ${!isDragging}`);
    setRecentAction(isDragging ? `Stopped dragging ${apparatus}` : `Started dragging ${apparatus}`);
  };
  
  const handlePour = (apparatus: string) => {
    setApparatusStates(prev => ({
      ...prev,
      [apparatus]: { ...prev[apparatus], pouring: true }
    }));
    setRecentAction(`Pouring from ${apparatus}`);
    
    // Log potential incident if pouring too fast
    const incidentId = progressTracker.logIncident(
      'splash',
      `Pouring from ${apparatus}`,
      'minor'
    );
    
    setTimeout(() => {
      setApparatusStates(prev => ({
        ...prev,
        [apparatus]: { ...prev[apparatus], pouring: false }
      }));
      
      // Resolve incident after pour completes
      progressTracker.respondToIncident(incidentId);
      progressTracker.resolveIncident(incidentId);
    }, 2000);
  };
  
  const handleEndExperiment = () => {
    const session = progressTracker.endSession();
    if (session) {
      setCompletedSession(session);
      setShowReport(true);
    }
  };

  const maybeRecordAcidityMeasurement = (target: string) => {
    if (currentExperiment !== 'acidity-testing') return;
    if (target !== 'Unknown A' && target !== 'Unknown B' && target !== 'Unknown C') return;

    // Lazy import to avoid making Scene.tsx depend on the AI engine at module init.
    import('../lib/aiChemistryEngine').then(({ aiChemistry }) => {
      const analysis = aiChemistry.analyzepH(target);
      recordMeasurement('pH', analysis.pH, 'pH');

      setAcidityReadings((prev) => ({
        ...prev,
        [target]: analysis.pH,
      }));

      // Auto-complete measurement steps when the user interacts with a solution during those steps.
      const step = experimentSteps[currentStepIndex];
      if (step && !step.completed && (step.id === 'acidity-3' || step.id === 'acidity-4' || step.id === 'acidity-5' || step.id === 'acidity-6')) {
        completeStep(step.id);
      }
    });
  };

  useEffect(() => {
    if (currentExperiment !== 'acidity-testing') return;
    const hasAll = typeof acidityReadings['Unknown A'] === 'number' && typeof acidityReadings['Unknown B'] === 'number' && typeof acidityReadings['Unknown C'] === 'number';
    if (!hasAll) return;
    const step = experimentSteps[currentStepIndex];
    if (step && !step.completed && step.id === 'acidity-7') {
      completeStep(step.id);
    }
  }, [acidityReadings, completeStep, currentExperiment, currentStepIndex, experimentSteps]);
  
  // Check if burette is positioned over flask
  const checkProximity = (apparatus: string, position: [number, number, number]) => {
    if (apparatus === "Burette") {
      // Flask position: [0.2, 1.15, -1.5]
      const flaskX = 0.2;
      const flaskY = 1.15;
      
      // Check if burette is within range (above the flask)
      const distanceX = Math.abs(position[0] - flaskX);
      const distanceY = position[1] - flaskY; // Should be above (positive)
      
      // Burette is aligned if:
      // - Within 0.3 units horizontally from flask
      // - Between 0.3 and 1.0 units above flask
      if (distanceX < 0.3 && distanceY > 0.3 && distanceY < 1.0) {
        // Burette is properly positioned over flask!
        if (currentStepIndex === 2) {
          completeStep('titration-3');
          console.log('✅ Step 3 Complete: Burette positioned over flask!');
        }
      }
    }
  };
  
  const handleRelease = (apparatus: string) => {
    setGrabbedApparatus(null);
    setDraggingApparatus(null);
    setApparatusStates(prev => ({
      ...prev,
      [apparatus]: { grabbed: false, pouring: false, dragging: false }
    }));
    // Keep the drag position - don't delete it!
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingApparatus) {
      const rect = e.currentTarget.getBoundingClientRect();
      
      // Normalize mouse position to -1 to 1 range (NDC - Normalized Device Coordinates)
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Store for raycasting in the scene
      setMousePos({ x: mouseX, y: mouseY });
    }
  };

  const handleBuretteClick = () => {
    setSelectedApparatus("Burette");
    onInteract("Burette");
    if (currentStepIndex === 2) {
      completeStep('titration-3');
    }
  };

  return (
    <div 
      className="w-full h-screen bg-black"
      onMouseMove={handleMouseMove}
      style={{ cursor: draggingApparatus ? 'move' : 'default' }}
    >
      <TrainingOverlay />
      
      {selectedApparatus && (
        <ApparatusMenu
          apparatusName={selectedApparatus}
          onGrab={() => handleGrab(selectedApparatus)}
          onPour={() => handlePour(selectedApparatus)}
          onDrag={() => handleDrag(selectedApparatus)}
          onRelease={() => handleRelease(selectedApparatus)}
          onClose={() => setSelectedApparatus(null)}
          isGrabbed={apparatusStates[selectedApparatus]?.grabbed || false}
          isDragging={apparatusStates[selectedApparatus]?.dragging || false}
        />
      )}
      
      {/* AI Assistant - Real-time guidance */}
      <AIAssistant
        currentStep={currentStepIndex}
        experimentId={currentExperiment}
        stepTitle={experimentSteps[currentStepIndex]?.title ?? null}
        apparatusInUse={grabbedApparatus}
        recentAction={recentAction}
      />
      
      {/* End Experiment Button */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          onClick={handleEndExperiment}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 shadow-lg"
        >
          🏁 End Experiment & Generate Report
        </Button>
      </div>
      
      {/* Experiment Report */}
      {showReport && completedSession && (
        <ExperimentReport
          session={completedSession}
          onClose={() => setShowReport(false)}
        />
      )}
      
      {/* 
        NOTE: VRButton handles entering WebXR session. 
        It injects itself into the DOM.
      */}
      <VRButton />
      
      {/* Custom VRButton styling */}
      <style>{`
        #VRButton {
          position: fixed !important;
          bottom: 16px !important;
          right: 16px !important;
          padding: 8px 16px !important;
          font-size: 12px !important;
          background: rgba(15, 23, 42, 0.5) !important;
          border: 1px solid rgba(34, 211, 238, 0.2) !important;
          color: rgba(34, 211, 238, 0.9) !important;
          border-radius: 8px !important;
          backdrop-filter: blur(4px) !important;
          z-index: 30 !important;
          transition: all 0.2s !important;
        }
        #VRButton:hover {
          background: rgba(15, 23, 42, 0.7) !important;
          border-color: rgba(34, 211, 238, 0.4) !important;
          color: rgba(34, 211, 238, 1) !important;
        }
      `}</style>

      <Canvas 
        shadows={false}
        dpr={[0.5, 1]}
        performance={{ min: 0.1, max: 1, debounce: 200 }}
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true
        }}
        frameloop="always"
      >
        <XR>
          <Controllers />
          <Hands />
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 1.6, 3]} fov={75} />
            
            {/* Essential Lighting - Optimized */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} />
            
            {/* First-person navigation controls */}
            <FirstPersonControls moveSpeed={5.0} />
            <VRLocomotion moveSpeed={3.0} />
            <PerformanceMonitor />
            
            {/* Mouse tracking for drag functionality */}
            <MouseTracker 
              mousePos={mousePos}
              draggingApparatus={draggingApparatus}
              onPositionUpdate={(pos) => {
                if (draggingApparatus) {
                  setDragPositions(prev => ({
                    ...prev,
                    [draggingApparatus]: pos
                  }));
                }
              }}
              onProximityCheck={checkProximity}
            />
            
            <Physics gravity={[0, -9.81, 0]} timeStep={1/60} paused={false} interpolate={true}>

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
            {/* PPE Table - Right in front of spawn */}
            <PPEStation position={[0, 0.9, 1]} />

            {/* L-Shaped Workbench Array */}
            {/* Long side - Moved closer to spawn */}
            <LabBench position={[0, 0, -1.5]} length={6} showSink={true} />
            <Microscope position={[1.5, 0.95, -1.5]} />
            <Centrifuge position={[-1.5, 0.95, -1.5]} />
            
            {/* Short side (creating the L) */}
            <LabBench position={[-3.45, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} length={4} />

            {/* ALL APPARATUS AND REAGENTS - ALWAYS VISIBLE */}
            
            {/* TITRATION EXPERIMENT */}
                {/* HCl Solution in Flask */}
                <PhysicsLabItem
                  position={[-0.8, 1.1, -1.5]}
                  color="#ef4444"
                  type="flask"
                  name="HCl (Hydrochloric Acid)"
                  mass={0.3}
                  fillLevel={0.6}
                  liquidColor="#fca5a5"
                  onSelect={() => onInteract("HCl")}
                />
                
                {/* NaOH Solution in Graduated Cylinder */}
                <PhysicsLabItem
                  position={[-0.3, 1.1, -1.5]}
                  color="#a855f7"
                  type="graduated_cylinder"
                  name="Sodium Hydroxide (NaOH)"
                  mass={0.2}
                  fillLevel={0.7}
                  liquidColor="#e9d5ff"
                  onSelect={() => onInteract("NaOH")}
                />
                
                {/* Phenolphthalein Indicator */}
                <PhysicsLabItem
                  position={[0.2, 1.1, -1.5]}
                  color="#fbbf24"
                  type="beaker"
                  name="Phenolphthalein Indicator"
                  mass={0.1}
                  fillLevel={0.3}
                  liquidColor="#fef3c7"
                  onSelect={() => onInteract("Indicator")}
                />
                
                {/* Distilled Water */}
                <PhysicsLabItem
                  position={[0.7, 1.1, -1.5]}
                  color="#3b82f6"
                  type="beaker"
                  name="Distilled Water"
                  mass={0.25}
                  fillLevel={0.8}
                  liquidColor="#bae6fd"
                  onSelect={() => onInteract("Water")}
                />
            
            {/* ACIDITY TESTING EXPERIMENT */}
                {/* Acidic Solution (Unknown A) */}
                <PhysicsLabItem
                  position={[-0.9, 1.1, -1.5]}
                  color="#ef4444"
                  type="beaker"
                  name="Unknown Solution A (Acidic)"
                  mass={0.2}
                  fillLevel={0.6}
                  liquidColor="#fca5a5"
                  onSelect={() => {
                    onInteract("Unknown A");
                    maybeRecordAcidityMeasurement('Unknown A');
                  }}
                />
                
                {/* Neutral Solution (Unknown B) */}
                <PhysicsLabItem
                  position={[-0.3, 1.1, -1.5]}
                  color="#3b82f6"
                  type="beaker"
                  name="Unknown Solution B (Neutral)"
                  mass={0.2}
                  fillLevel={0.6}
                  liquidColor="#bae6fd"
                  onSelect={() => {
                    onInteract("Unknown B");
                    maybeRecordAcidityMeasurement('Unknown B');
                  }}
                />
                
                {/* Alkaline Solution (Unknown C) */}
                <PhysicsLabItem
                  position={[0.3, 1.1, -1.5]}
                  color="#22c55e"
                  type="beaker"
                  name="Unknown Solution C (Alkaline)"
                  mass={0.2}
                  fillLevel={0.6}
                  liquidColor="#bbf7d0"
                  onSelect={() => {
                    onInteract("Unknown C");
                    maybeRecordAcidityMeasurement('Unknown C');
                  }}
                />
                
                {/* pH Paper Strips */}
                <RigidBody position={[0.9, 1.05, -1.5]} type="fixed">
                  <group onClick={() => onInteract("pH Paper")}>
                    <mesh>
                      <boxGeometry args={[0.08, 0.02, 0.12]} />
                      <meshStandardMaterial color="#fef3c7" />
                    </mesh>
                    <Text position={[0, 0.03, 0]} fontSize={0.03} color="#f59e0b" anchorX="center">
                      pH PAPER
                    </Text>
                  </group>
                </RigidBody>
                
                {/* Digital pH Meter */}
                <DigitalThermometer position={[1.5, 0.95, -1.5]} />
            
            {/* CHEMICAL REACTION TEST (H2O2 + KMnO4) */}
                {/* Hydrogen Peroxide (H2O2) in Beaker */}
                <PhysicsLabItem
                  position={[-0.8, 1.1, -1.5]}
                  color="#bae6fd"
                  type="beaker"
                  name="Hydrogen Peroxide (H₂O₂) 3%"
                  mass={0.25}
                  fillLevel={0.5}
                  liquidColor="#dbeafe"
                  onSelect={() => onInteract("H2O2")}
                />
                
                {/* Potassium Permanganate (KMnO4) in Small Flask */}
                <PhysicsLabItem
                  position={[-0.2, 1.1, -1.5]}
                  color="#a855f7"
                  type="flask"
                  name="Potassium Permanganate (KMnO₄)"
                  mass={0.15}
                  fillLevel={0.4}
                  liquidColor="#9333ea"
                  onSelect={() => onInteract("KMnO4")}
                />
                
                {/* Syringe/Dropper */}
                <RigidBody position={[0.4, 1.05, -1.5]} type="fixed">
                  <group onClick={() => onInteract("Syringe")}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.015, 0.015, 0.15, 16]} />
                      <meshStandardMaterial color="#e5e7eb" transparent opacity={0.8} />
                    </mesh>
                    <mesh position={[0.08, 0, 0]}>
                      <coneGeometry args={[0.01, 0.03, 16]} />
                      <meshStandardMaterial color="#9ca3af" />
                    </mesh>
                    <Text position={[0, 0.05, 0]} fontSize={0.03} color="#6b7280" anchorX="center">
                      SYRINGE
                    </Text>
                  </group>
                </RigidBody>
                
                {/* Small Scoop/Spatula */}
                <RigidBody position={[0.9, 1.02, -1.5]} type="fixed">
                  <group onClick={() => onInteract("Spatula")}>
                    <mesh>
                      <boxGeometry args={[0.12, 0.01, 0.03]} />
                      <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh position={[-0.06, 0, 0]}>
                      <cylinderGeometry args={[0.005, 0.005, 0.08, 8]} />
                      <meshStandardMaterial color="#475569" />
                    </mesh>
                    <Text position={[0, 0.03, 0]} fontSize={0.025} color="#64748b" anchorX="center">
                      SPATULA
                    </Text>
                  </group>
                </RigidBody>
                
                {/* Thermometer for temperature monitoring */}
                <DigitalThermometer position={[1.4, 0.95, -1.5]} />
            
            {/* Common Equipment */}
            <AnalyticalBalance position={[-1.5, 0.95, -1.5]} />
            
            {/* EXPERIMENT-SPECIFIC DRAGGABLE APPARATUS */}
            
            {/* Conical Flask - For Titration and Chemical Reaction */}
              <DraggableApparatus
                apparatusRef={flaskRef}
                dragPosition={dragPositions["Conical Flask"] || null}
                isDragging={apparatusStates["Conical Flask"]?.dragging || false}
                defaultPosition={
                  apparatusStates["Conical Flask"]?.grabbed 
                    ? [1.3, 1.6, -1.2] 
                    : [1.3, 1.15, -1.5]
                }
                rotation={
                  apparatusStates["Conical Flask"]?.pouring 
                    ? [0, 0, Math.PI / 4] 
                    : [0, 0, 0]
                }
              >
                <group onClick={handleFlaskClick}>
                  <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
                    <coneGeometry args={[0.15, 0.25, 32]} />
                    <meshPhysicalMaterial 
                      color="#fecaca"
                      transparent 
                      opacity={0.6}
                      roughness={0.2}
                      metalness={0.1}
                      transmission={0.3}
                      thickness={0.5}
                      ior={1.52}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                  <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.15, 32]} />
                    <meshPhysicalMaterial 
                      color="#fecaca"
                      transparent 
                      opacity={0.6}
                      transmission={0.3}
                      ior={1.52}
                    />
                  </mesh>
                  <Text position={[0, 0.28, 0]} fontSize={0.05} color="#ef4444" anchorX="center">
                    FLASK
                  </Text>
                </group>
              </DraggableApparatus>
            
            {/* Burette - For Titration only */}
              <DraggableApparatus
                apparatusRef={buretteRef}
                dragPosition={dragPositions["Burette"] || null}
                isDragging={apparatusStates["Burette"]?.dragging || false}
                defaultPosition={
                  apparatusStates["Burette"]?.grabbed 
                    ? [1.9, 1.8, -1.2] 
                    : [1.9, 1.35, -1.5]
                }
                rotation={[0, 0, 0]}
              >
                <group onClick={handleBuretteClick}>
                  <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.025, 0.025, 0.5, 32]} />
                    <meshPhysicalMaterial 
                      color="#e9d5ff"
                      transparent 
                      opacity={0.6}
                      roughness={0.2}
                      metalness={0.1}
                      transmission={0.3}
                      thickness={0.3}
                      ior={1.52}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                  <mesh position={[0, -0.26, 0]}>
                    <boxGeometry args={[0.06, 0.02, 0.02]} />
                    <meshStandardMaterial color="#333333" />
                  </mesh>
                  <mesh position={[0, -0.29, 0]}>
                    <coneGeometry args={[0.015, 0.04, 16]} />
                    <meshPhysicalMaterial 
                      color="#e9d5ff"
                      transparent 
                      opacity={0.6}
                      transmission={0.3}
                      ior={1.52}
                    />
                  </mesh>
                  <Text position={[0.04, 0.2, 0]} fontSize={0.03} color="#a855f7" anchorX="left">0</Text>
                  <Text position={[0.04, 0.1, 0]} fontSize={0.03} color="#a855f7" anchorX="left">10</Text>
                  <Text position={[0.04, 0, 0]} fontSize={0.03} color="#a855f7" anchorX="left">20</Text>
                  <Text position={[0.04, -0.1, 0]} fontSize={0.03} color="#a855f7" anchorX="left">30</Text>
                  <Text position={[0.04, -0.2, 0]} fontSize={0.03} color="#a855f7" anchorX="left">40</Text>
                  <Text position={[0, 0.32, 0]} fontSize={0.05} color="#a855f7" anchorX="center">
                    BURETTE
                  </Text>
                </group>
              </DraggableApparatus>
            
            {/* Empty Beaker - For Acidity Testing (to test solutions) */}
              <DraggableApparatus
              apparatusRef={beakerRef}
              dragPosition={dragPositions["Beaker"] || null}
              isDragging={apparatusStates["Beaker"]?.dragging || false}
              defaultPosition={
                apparatusStates["Beaker"]?.grabbed 
                  ? [-0.5, 1.6, -1.2] 
                  : [-0.5, 1.15, -1.5]
              }
              rotation={
                apparatusStates["Beaker"]?.pouring 
                  ? [0, 0, Math.PI / 4] 
                  : [0, 0, 0]
              }
            >
              <group onClick={handleBeakerClick}>
                {/* Beaker body - Straight cylinder like real beaker */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[0.12, 0.12, 0.25, 32]} />
                  <meshPhysicalMaterial 
                    color="#bfdbfe"
                    transparent 
                    opacity={0.6}
                    roughness={0.2}
                    metalness={0.1}
                    transmission={0.3}
                    thickness={0.5}
                    ior={1.52}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
                
                {/* Spout lip */}
                <mesh position={[0.12, 0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                  <meshPhysicalMaterial 
                    color="#bfdbfe"
                    transparent 
                    opacity={0.6}
                    transmission={0.3}
                    ior={1.52}
                  />
                </mesh>
                
                <Text position={[0, 0.2, 0]} fontSize={0.05} color="#3b82f6" anchorX="center">
                  BEAKER
                </Text>
              </group>
            </DraggableApparatus>
            
            {/* Lab Equipment and Stations */}
            <RingStand position={[-2.5, 0.95, -1.5]} />
            <Hotplate position={[2.2, 0.95, -1.5]} />
            
            {/* Waste Management */}
            <WasteContainer position={[3, 0, -1.5]} type="general" />
            <WasteContainer position={[3.5, 0, -1.5]} type="organic" />

            </Physics>
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
