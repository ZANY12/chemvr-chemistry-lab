import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Controllers, Hands, Interactive, VRButton, XR, useXR } from '@react-three/xr';
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

function ReactionTimelineUpdater({
  enabled,
  startedAtMs,
  reactionProgress,
  setReactionProgress,
  experimentSteps,
  currentStepIndex,
  completeStep,
}: {
  enabled: boolean;
  startedAtMs: number | null;
  reactionProgress: number;
  setReactionProgress: React.Dispatch<React.SetStateAction<number>>;
  experimentSteps: Array<{ id: string; completed: boolean }>;
  currentStepIndex: number;
  completeStep: (stepId: string) => void;
}) {
  useFrame(() => {
    if (!enabled) return;
    if (!startedAtMs) {
      if (reactionProgress !== 0) setReactionProgress(0);
      return;
    }

    const t = Math.min(1, Math.max(0, (performance.now() - startedAtMs) / 6000));
    if (Math.abs(t - reactionProgress) > 0.002) {
      setReactionProgress(t);
    }

    const step = experimentSteps[currentStepIndex];
    if (step && !step.completed && step.id === 'reaction-6' && t >= 0.85) {
      completeStep('reaction-6');
    }
  });

  return null;
}

function XRWorldOffset({ children, offsetZ }: { children: React.ReactNode; offsetZ: number }) {
  const { isPresenting } = useXR();
  return <group position={isPresenting ? [0, 0, offsetZ] : [0, 0, 0]}>{children}</group>;
}

function VRWorldNudgeControls({
  offsetZ,
  onSetOffsetZ,
}: {
  offsetZ: number;
  onSetOffsetZ: (next: number) => void;
}) {
  const { isPresenting } = useXR();
  const { camera } = useThree();
  const rootRef = useRef<THREE.Group>(null);

  const qFlip = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    return q;
  }, []);

  const tmpForward = useMemo(() => new THREE.Vector3(), []);
  const tmpRight = useMemo(() => new THREE.Vector3(), []);
  const tmpUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);

  useFrame(() => {
    if (!rootRef.current) return;
    if (!isPresenting) {
      rootRef.current.visible = false;
      return;
    }
    rootRef.current.visible = true;

    camera.getWorldDirection(tmpForward);
    tmpRight.crossVectors(tmpForward, tmpUp).normalize();

    // Position a HUD panel in front of the camera (slightly down)
    tmpPos.copy(camera.position);
    tmpPos.addScaledVector(tmpForward, 0.65);
    tmpPos.addScaledVector(tmpUp, -0.22);
    tmpPos.addScaledVector(tmpRight, 0.0);
    rootRef.current.position.copy(tmpPos);

    tmpQuat.copy(camera.quaternion).multiply(qFlip);
    rootRef.current.quaternion.copy(tmpQuat);
  });

  if (!isPresenting) return null;

  const clampOffsetZ = (v: number) => Math.min(-0.5, Math.max(-4, v));
  const nudge = (dz: number) => onSetOffsetZ(clampOffsetZ(offsetZ + dz));

  return (
    <group ref={rootRef} renderOrder={999}>
      <mesh position={[0, 0, 0]} renderOrder={999} frustumCulled={false}>
        <boxGeometry args={[0.52, 0.18, 0.01]} />
        <meshBasicMaterial color="#0b1220" transparent opacity={0.8} depthTest={false} />
      </mesh>

      <Interactive onSelectStart={() => nudge(0.25)}>
        <group position={[-0.16, 0, 0.012]}>
          <mesh renderOrder={999} frustumCulled={false}>
            <boxGeometry args={[0.14, 0.14, 0.01]} />
            <meshBasicMaterial color="#1f2937" depthTest={false} />
          </mesh>
          <Text position={[0, -0.008, 0.02]} fontSize={0.09} anchorX="center" anchorY="middle" renderOrder={1000} frustumCulled={false}>
            +
            <meshBasicMaterial color="#e2e8f0" depthTest={false} toneMapped={false} />
          </Text>
        </group>
      </Interactive>

      <Interactive onSelectStart={() => nudge(-0.25)}>
        <group position={[0, 0, 0.012]}>
          <mesh renderOrder={999} frustumCulled={false}>
            <boxGeometry args={[0.14, 0.14, 0.01]} />
            <meshBasicMaterial color="#1f2937" depthTest={false} />
          </mesh>
          <Text position={[0, -0.008, 0.02]} fontSize={0.09} anchorX="center" anchorY="middle" renderOrder={1000} frustumCulled={false}>
            -
            <meshBasicMaterial color="#e2e8f0" depthTest={false} toneMapped={false} />
          </Text>
        </group>
      </Interactive>

      <Interactive onSelectStart={() => onSetOffsetZ(-2)}>
        <group position={[0.2, 0, 0.012]}>
          <mesh renderOrder={999} frustumCulled={false}>
            <boxGeometry args={[0.18, 0.14, 0.01]} />
            <meshBasicMaterial color="#0f172a" depthTest={false} />
          </mesh>
          <Text position={[0, -0.008, 0.02]} fontSize={0.055} anchorX="center" anchorY="middle" renderOrder={1000} frustumCulled={false}>
            reset
            <meshBasicMaterial color="#94a3b8" depthTest={false} toneMapped={false} />
          </Text>
        </group>
      </Interactive>
    </group>
  );
}

function DesktopOnlyCamera() {
  const { isPresenting } = useXR();
  if (isPresenting) return null;
  return <PerspectiveCamera makeDefault position={[0, 1.6, 3]} fov={75} />;
}

function XRDebugMarker() {
  const { isPresenting } = useXR();
  if (!isPresenting) return null;
  return (
    <group>
      <mesh position={[0, 1.5, -1]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>
    </group>
  );
}

function PourStream({
  start,
  end,
  color,
  visible,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  visible: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (!visible) {
      meshRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;
    const t = clock.getElapsedTime();
    const pulse = 0.85 + 0.15 * Math.sin(t * 18);
    meshRef.current.scale.set(pulse, 1, pulse);
  });

  const startV = useMemo(() => new THREE.Vector3(...start), [start]);
  const endV = useMemo(() => new THREE.Vector3(...end), [end]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(endV, startV), [endV, startV]);
  const len = dir.length();
  const mid = useMemo(() => new THREE.Vector3().addVectors(startV, endV).multiplyScalar(0.5), [endV, startV]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    const axis = new THREE.Vector3(0, 1, 0);
    const nd = dir.clone().normalize();
    q.setFromUnitVectors(axis, nd);
    return q;
  }, [dir]);

  if (!visible) return null;

  return (
    <mesh ref={meshRef} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
      <cylinderGeometry args={[0.01, 0.014, Math.max(0.001, len), 10]} />
      <meshStandardMaterial color={color} transparent opacity={0.55} roughness={0.3} metalness={0} />
    </mesh>
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

  const allowedPhDipTargets = useMemo(() => new Set([
    'Unknown A',
    'Unknown B',
    'Unknown C',
    'HCl',
    'NaOH',
    'Water',
    'Beaker',
  ]), []);
  
  const experimentType = getExperimentApparatus();
  
  const [selectedApparatus, setSelectedApparatus] = useState<string | null>(null);
  const [grabbedApparatus, setGrabbedApparatus] = useState<string | null>(null);
  const [draggingApparatus, setDraggingApparatus] = useState<string | null>(null);
  const [pourSource, setPourSource] = useState<string | null>(null);
  const [isSelectingPourTarget, setIsSelectingPourTarget] = useState(false);
  const [apparatusStates, setApparatusStates] = useState<Record<string, { grabbed: boolean; pouring: boolean; dragging: boolean }>>({});
  const [dragPositions, setDragPositions] = useState<Record<string, [number, number, number]>>({});
  const [targetDragPositions, setTargetDragPositions] = useState<Record<string, [number, number, number]>>({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [recentAction, setRecentAction] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [completedSession, setCompletedSession] = useState<ExperimentSession | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [xrSupported, setXrSupported] = useState<boolean>(false);
  const [acidityReadings, setAcidityReadings] = useState<Record<string, number>>({});
  const [worldOffsetZ, setWorldOffsetZ] = useState(-2);
  const preparedAciditySamplesRef = useRef<Set<string>>(new Set());
  const dippedPhPaperTargetsRef = useRef<Set<string>>(new Set());
  const reactionStateRef = useRef<{
    h2o2Added: boolean;
    kmno4Prepared: boolean;
    kmno4Added: boolean;
    startedAtMs: number | null;
    analysisDone: boolean;
  }>({ h2o2Added: false, kmno4Prepared: false, kmno4Added: false, startedAtMs: null, analysisDone: false });
  const [reactionProgress, setReactionProgress] = useState(0);
  const activeExperimentRef = useRef<string | null>(null);
  const completedStepIdsRef = useRef<Set<string>>(new Set());

  const [activePourVisual, setActivePourVisual] = useState<{
    source: string;
    target: string;
    liquidColor: string;
  } | null>(null);

  const [stopcockHeld, setStopcockHeld] = useState(false);
  const stopcockHeldRef = useRef(false);
  const stopcockRafRef = useRef<number | null>(null);
  const stopcockLastTsRef = useRef<number>(0);
  const buretteInitialFillRef = useRef<number>(0.85);

  const [itemFillLevels, setItemFillLevels] = useState<Record<string, number>>(() => ({
    'Burette': 0.85,
    'Conical Flask': 0.25,
    'Beaker': 0,
    'HCl (Hydrochloric Acid)': 0.6,
    'Sodium Hydroxide (NaOH)': 0.7,
    'Phenolphthalein Indicator': 0.3,
    'Distilled Water': 0.8,
    'Unknown Solution A (Acidic)': 0.6,
    'Unknown Solution B (Neutral)': 0.6,
    'Unknown Solution C (Alkaline)': 0.6,
    'Hydrogen Peroxide (H₂O₂) 3%': 0.5,
    'Potassium Permanganate (KMnO₄)': 0.4,
  }));

  useEffect(() => {
    const buretteFill = itemFillLevels['Burette'];
    if (typeof buretteFill === 'number' && buretteFill > buretteInitialFillRef.current) {
      buretteInitialFillRef.current = buretteFill;
    }
  }, [itemFillLevels]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activePourSoundRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const stopPourSound = () => {
    const active = activePourSoundRef.current;
    if (!active) return;
    try {
      active.gain.gain.setTargetAtTime(0, audioCtxRef.current?.currentTime ?? 0, 0.02);
      active.source.stop();
    } catch {
      // ignore
    }
    activePourSoundRef.current = null;
  };

  const startPourSound = async () => {
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (!Ctx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      stopPourSound();

      // Generate a short "water pour" noise burst in-memory (no asset files).
      const sampleRate = ctx.sampleRate;
      const durationSeconds = 2.2;
      const frameCount = Math.floor(sampleRate * durationSeconds);
      const buffer = ctx.createBuffer(1, frameCount, sampleRate);
      const data = buffer.getChannelData(0);

      // White noise -> simple smoothing + amplitude envelope.
      let last = 0;
      for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount;
        const target = (Math.random() * 2 - 1) * 0.8;
        last = last * 0.94 + target * 0.06;
        const attack = Math.min(1, t / 0.08);
        const release = Math.min(1, (1 - t) / 0.12);
        const env = Math.min(attack, release);
        data[i] = last * env;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 900;
      bandpass.Q.value = 0.8;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      source.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      gain.gain.setTargetAtTime(0.18, ctx.currentTime, 0.04);

      activePourSoundRef.current = { source, gain };
    } catch {
      // Audio is optional; ignore failures (autoplay policies etc.)
    }
  };

  useEffect(() => {
    let cancelled = false;
    const checkSupport = async () => {
      try {
        if (!('xr' in navigator) || !navigator.xr) {
          if (!cancelled) setXrSupported(false);
          return;
        }
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (!cancelled) setXrSupported(!!supported);
      } catch {
        if (!cancelled) setXrSupported(false);
      }
    };
    checkSupport();
    return () => {
      cancelled = true;
    };
  }, []);

  const itemSpawnPositions = useMemo<Record<string, [number, number, number]>>(() => ({
    'Burette': [1.9, 1.35, -1.5],
    'Conical Flask': [1.3, 1.15, -1.5],
    'Beaker': [-0.5, 1.15, -1.5],
    'Graduated Cylinder': [0.8, 1.15, -1.5],
    'pH Paper': [0.9, 1.05, -1.5],

    'HCl (Hydrochloric Acid)': [-0.8, 1.1, -1.5],
    'Sodium Hydroxide (NaOH)': [-0.3, 1.1, -1.5],
    'Phenolphthalein Indicator': [0.2, 1.1, -1.5],
    'Distilled Water': [0.7, 1.1, -1.5],

    'Unknown Solution A (Acidic)': [-0.9, 1.1, -1.5],
    'Unknown Solution B (Neutral)': [-0.3, 1.1, -1.5],
    'Unknown Solution C (Alkaline)': [0.3, 1.1, -1.5],

    'Hydrogen Peroxide (H₂O₂) 3%': [-1.3, 1.1, -1.5],
    'Potassium Permanganate (KMnO₄)': [-0.2, 1.1, -1.5],
  }), []);
  
  // Refs for apparatus RigidBodies
  const buretteRef = useRef<RapierRigidBody>(null);
  const flaskRef = useRef<RapierRigidBody>(null);
  const beakerRef = useRef<RapierRigidBody>(null);
  const cylinderRef = useRef<RapierRigidBody>(null);
  const phPaperRef = useRef<RapierRigidBody>(null);

  const [phStripTaken, setPhStripTaken] = useState(false);
  const [phStripColor, setPhStripColor] = useState<string>('#fef3c7');
  const [isSelectingPhDipTarget, setIsSelectingPhDipTarget] = useState(false);
  const [phStripDisposing, setPhStripDisposing] = useState(false);
  const [phStripWorldPos, setPhStripWorldPos] = useState<[number, number, number] | null>(null);
  const phStripDisposeRafRef = useRef<number | null>(null);

  const cancelPhDipTargeting = () => {
    setIsSelectingPhDipTarget(false);
  };

  const disposePhStrip = () => {
    if (!phStripTaken || phStripDisposing) return;
    setPhStripDisposing(true);
    cancelPhDipTargeting();

    const start = getItemPosition('pH Paper');
    const end: [number, number, number] = [3.2, 1.0, -1.5];
    const startTime = performance.now();
    const durationMs = 550;

    setPhStripWorldPos(start);

    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - startTime) / durationMs);
      const x = start[0] + (end[0] - start[0]) * t;
      const y = start[1] + (end[1] - start[1]) * t;
      const z = start[2] + (end[2] - start[2]) * t;
      setPhStripWorldPos([x, y, z]);

      if (t < 1) {
        phStripDisposeRafRef.current = requestAnimationFrame(tick);
        return;
      }

      phStripDisposeRafRef.current = null;
      setPhStripWorldPos(null);
      setPhStripTaken(false);
      setPhStripColor('#fef3c7');
      setPhStripDisposing(false);
      setRecentAction('Disposed pH paper strip');
    };

    if (phStripDisposeRafRef.current) cancelAnimationFrame(phStripDisposeRafRef.current);
    phStripDisposeRafRef.current = requestAnimationFrame(tick);
  };

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

  const cancelPourTargeting = () => {
    setIsSelectingPourTarget(false);
    setPourSource(null);
  };

  const stopStopcockDispense = () => {
    setStopcockHeld(false);
    stopcockHeldRef.current = false;
    if (stopcockRafRef.current) {
      cancelAnimationFrame(stopcockRafRef.current);
      stopcockRafRef.current = null;
    }
    stopcockLastTsRef.current = 0;
    stopPourSound();
    setActivePourVisual((prev) => {
      if (!prev) return prev;
      if (prev.source === 'Burette' && prev.target === 'Conical Flask') return null;
      return prev;
    });
  };

  const startStopcockDispense = () => {
    if (stopcockRafRef.current) return;

    const burettePos = dragPositions['Burette'] || itemSpawnPositions['Burette'] || [1.9, 1.35, -1.5];
    const flaskPos = dragPositions['Conical Flask'] || itemSpawnPositions['Conical Flask'] || [1.3, 1.15, -1.5];

    const distanceX = Math.abs(burettePos[0] - flaskPos[0]);
    const distanceZ = Math.abs(burettePos[2] - flaskPos[2]);
    const distanceY = burettePos[1] - flaskPos[1];
    const aligned = distanceX < 0.45 && distanceZ < 0.45 && distanceY > 0.15 && distanceY < 1.4;
    if (!aligned) {
      setRecentAction('Position the burette above the conical flask first');
      return;
    }

    setStopcockHeld(true);
    stopcockHeldRef.current = true;
    setRecentAction('Dispensing: hold mouse to regulate flow');

    const step = experimentSteps[currentStepIndex];
    if (step && !step.completed && step.id === 'titration-5') {
      completeStep('titration-5');
    }

    setActivePourVisual({
      source: 'Burette',
      target: 'Conical Flask',
      liquidColor: '#93c5fd',
    });
    void startPourSound();

    const tick = (ts: number) => {
      if (!stopcockHeldRef.current && stopcockLastTsRef.current !== 0) {
        stopStopcockDispense();
        return;
      }

      if (!stopcockLastTsRef.current) stopcockLastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - stopcockLastTsRef.current) / 1000);
      stopcockLastTsRef.current = ts;

      // Transfer a small amount continuously while held.
      const ratePerSecond = 0.08;
      const desired = ratePerSecond * dt;

      setItemFillLevels((prev) => {
        const sourceFill = prev['Burette'] ?? 0;
        const targetFill = prev['Conical Flask'] ?? 0;
        const amount = Math.max(0, Math.min(desired, sourceFill, 1 - targetFill));
        if (amount <= 0) return prev;

        const next = {
          ...prev,
          Burette: Math.max(0, sourceFill - amount),
          'Conical Flask': Math.min(1, targetFill + amount),
        };

        return next;
      });

      stopcockRafRef.current = requestAnimationFrame(tick);
    };

    stopcockRafRef.current = requestAnimationFrame(tick);
  };

  const getItemPosition = (name: string): [number, number, number] => {
    const dragPos = dragPositions[name];
    if (dragPos) return dragPos;
    const spawnPos = itemSpawnPositions[name];
    if (spawnPos) return spawnPos;
    return [0, 1.1, -1.5];
  };

  const beakerLastContentsKeyRef = useRef<string | null>(null);

  const normalizePhKeyForSource = (sourceName: string): string | null => {
    if (sourceName === 'HCl (Hydrochloric Acid)') return 'HCl';
    if (sourceName === 'Sodium Hydroxide (NaOH)') return 'NaOH';
    if (sourceName === 'Distilled Water') return 'Water';
    if (sourceName === 'Unknown Solution A (Acidic)') return 'Unknown A';
    if (sourceName === 'Unknown Solution B (Neutral)') return 'Unknown B';
    if (sourceName === 'Unknown Solution C (Alkaline)') return 'Unknown C';
    return null;
  };

  const completePour = (source: string, target: string) => {
    setRecentAction(`Pouring from ${source} into ${target}`);

    if (target === 'Beaker') {
      const key = normalizePhKeyForSource(source);
      if (key) beakerLastContentsKeyRef.current = key;
    }

    if (currentExperiment === 'chemical-reaction-test') {
      if (target === 'Conical Flask' && source === 'Hydrogen Peroxide (H₂O₂) 3%') {
        reactionStateRef.current.h2o2Added = true;
        const step = experimentSteps[currentStepIndex];
        if (step && !step.completed && step.id === 'reaction-3') {
          completeStep('reaction-3');
        }
      }

      if (target === 'Conical Flask' && source === 'Potassium Permanganate (KMnO₄)') {
        reactionStateRef.current.kmno4Added = true;
        reactionStateRef.current.startedAtMs = performance.now();
        reactionStateRef.current.analysisDone = false;

        const step = experimentSteps[currentStepIndex];
        if (step && !step.completed && step.id === 'reaction-5') {
          completeStep('reaction-5');
        }

        import('../lib/aiChemistryEngine').then(({ aiChemistry }) => {
          // Use nominal volumes from the worksheet.
          const analysis = aiChemistry.analyzeRedoxReaction(50, 5);
          recordMeasurement('temperatureChange', analysis.temperatureChange, '°C');
          recordMeasurement('gasVolume', analysis.gasEvolved.volume, 'mL');
          setRecentAction(`AI: ${analysis.reactionType} | ΔT +${analysis.temperatureChange.toFixed(1)}°C | O₂ ${analysis.gasEvolved.volume.toFixed(0)} mL`);
          reactionStateRef.current.analysisDone = true;

          const s = experimentSteps[currentStepIndex];
          if (s && !s.completed && s.id === 'reaction-7') {
            completeStep('reaction-7');
          }
        });
      }
    }

    setApparatusStates(prev => ({
      ...prev,
      [source]: { ...(prev[source] ?? { grabbed: false, pouring: false, dragging: false }), pouring: true }
    }));

    const incidentId = progressTracker.logIncident(
      'splash',
      `Pouring from ${source} into ${target}`,
      'minor'
    );

    const pourDurationMs = 2000;
    const startTime = performance.now();
    const startSourceFill = itemFillLevels[source] ?? 0;
    const startTargetFill = itemFillLevels[target] ?? 0;

    const maxTransfer = Math.max(0, Math.min(0.25, startSourceFill, 1 - startTargetFill));
    if (maxTransfer <= 0) {
      setApparatusStates(prev => ({
        ...prev,
        [source]: { ...(prev[source] ?? { grabbed: false, pouring: false, dragging: false }), pouring: false }
      }));
      progressTracker.respondToIncident(incidentId);
      progressTracker.resolveIncident(incidentId);
      return;
    }

    setActivePourVisual({
      source,
      target,
      liquidColor: '#93c5fd',
    });
    void startPourSound();

    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - startTime) / pourDurationMs);
      const amount = maxTransfer * t;

      setItemFillLevels(prev => {
        const prevSource = prev[source] ?? startSourceFill;
        const prevTarget = prev[target] ?? startTargetFill;

        const sourceFill = Math.max(0, startSourceFill - amount);
        const targetFill = Math.min(1, startTargetFill + amount);

        // Avoid pointless state churn
        if (Math.abs(sourceFill - prevSource) < 0.0005 && Math.abs(targetFill - prevTarget) < 0.0005) {
          return prev;
        }

        return {
          ...prev,
          [source]: sourceFill,
          [target]: targetFill,
        };
      });

      if (t < 1) {
        requestAnimationFrame(tick);
        return;
      }

      stopPourSound();
      setActivePourVisual(null);
      setApparatusStates(prev => ({
        ...prev,
        [source]: { ...(prev[source] ?? { grabbed: false, pouring: false, dragging: false }), pouring: false }
      }));

      progressTracker.respondToIncident(incidentId);
      progressTracker.resolveIncident(incidentId);
    };

    requestAnimationFrame(tick);
  };

  const handleItemClick = (itemName: string, interactionName?: string) => {
    if (isSelectingPhDipTarget) {
      const allowedTargets = new Set([
        'Unknown A',
        'Unknown B',
        'Unknown C',
        'HCl',
        'NaOH',
        'Water',
        'Beaker',
      ]);

      if (interactionName && allowedTargets.has(interactionName)) {
        import('../lib/aiChemistryEngine').then(({ aiChemistry }) => {
          const analysisKey = interactionName === 'Beaker'
            ? (beakerLastContentsKeyRef.current ?? null)
            : interactionName;

          if (!analysisKey) {
            setRecentAction('Beaker is empty - pour a solution into it first');
            return;
          }

          const analysis = aiChemistry.analyzepH(analysisKey);

          const universal = analysis.color.universal.toLowerCase();
          const colorMap: Record<string, string> = {
            red: '#ef4444',
            'orange/yellow': '#f59e0b',
            orange: '#f59e0b',
            yellow: '#fbbf24',
            green: '#22c55e',
            'blue/green': '#38bdf8',
            blue: '#3b82f6',
            'dark purple': '#7c3aed',
            purple: '#7c3aed',
          };

          const picked = colorMap[universal] ?? '#a3a3a3';
          setPhStripColor(picked);
          setRecentAction(`pH paper dipped: ${interactionName} → ${analysis.color.universal}`);
          dippedPhPaperTargetsRef.current.add(interactionName);

          const step = experimentSteps[currentStepIndex];
          if (step && !step.completed && step.id === 'acidity-3') {
            const hasAll = dippedPhPaperTargetsRef.current.has('Unknown A') && dippedPhPaperTargetsRef.current.has('Unknown B') && dippedPhPaperTargetsRef.current.has('Unknown C');
            if (hasAll) {
              completeStep('acidity-3');
            }
          }
        });

        setIsSelectingPhDipTarget(false);
        return;
      }

      // Click elsewhere cancels dip targeting.
      setIsSelectingPhDipTarget(false);
      return;
    }

    if (isSelectingPourTarget && pourSource) {
      if (itemName !== pourSource) {
        completePour(pourSource, itemName);
      }
      cancelPourTargeting();
      return;
    }

    setSelectedApparatus(itemName);
    onInteract(interactionName ?? itemName);

    if (currentExperiment === 'chemical-reaction-test') {
      const step = experimentSteps[currentStepIndex];

      if (interactionName === 'Conical Flask' && step && !step.completed && step.id === 'reaction-2') {
        completeStep('reaction-2');
      }

      if (interactionName === 'KMnO4' && step && !step.completed && step.id === 'reaction-4') {
        reactionStateRef.current.kmno4Prepared = true;
        completeStep('reaction-4');
      }

      // After reaction starts and analysis has been computed, complete reaction-6/7 if user is on them.
      if (reactionStateRef.current.startedAtMs && step && !step.completed && step.id === 'reaction-6') {
        // Let the useFrame auto-complete near the end; this click counts as observing.
      }

      if (reactionStateRef.current.analysisDone && step && !step.completed && step.id === 'reaction-7') {
        completeStep('reaction-7');
      }
    }

    if (currentExperiment === 'acidity-testing') {
      const step = experimentSteps[currentStepIndex];
      if (step && !step.completed && step.id === 'acidity-2') {
        if (interactionName === 'Unknown A' || interactionName === 'Unknown B' || interactionName === 'Unknown C') {
          preparedAciditySamplesRef.current.add(interactionName);
          const hasAll = preparedAciditySamplesRef.current.has('Unknown A') && preparedAciditySamplesRef.current.has('Unknown B') && preparedAciditySamplesRef.current.has('Unknown C');
          if (hasAll) {
            completeStep('acidity-2');
          }
        }
      }
    }
  };

  const handleFlaskClick = () => {
    handleItemClick("Conical Flask", "Conical Flask");
    if (currentStepIndex === 1) {
      completeStep('titration-2');
    }
  };

  const handleBeakerClick = () => {
    handleItemClick("Beaker", "Beaker");
  };

  const handleCylinderClick = () => {
    handleItemClick("Graduated Cylinder", "Graduated Cylinder");
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
        const spawnPos = itemSpawnPositions[apparatus];
        const initialPos: [number, number, number] = spawnPos ? [...spawnPos] as [number, number, number] : [0, 1.1, -1.5];
        
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
      [apparatus]: { ...(prev[apparatus] ?? { grabbed: false, pouring: false, dragging: false }), dragging: !isDragging }
    }));
    console.log(`✅ Drag state updated: ${apparatus} dragging = ${!isDragging}`);
    setRecentAction(isDragging ? `Stopped dragging ${apparatus}` : `Started dragging ${apparatus}`);
  };

  const stopDragging = (apparatus: string) => {
    setDraggingApparatus((prev) => (prev === apparatus ? null : prev));
    setApparatusStates(prev => ({
      ...prev,
      [apparatus]: { ...(prev[apparatus] ?? { grabbed: false, pouring: false, dragging: false }), dragging: false }
    }));
    setRecentAction(`Stopped dragging ${apparatus}`);
  };
  
  const handlePour = (apparatus: string) => {
    setPourSource(apparatus);
    setIsSelectingPourTarget(true);
    setRecentAction(`Select a target to pour into`);
  };

  const handleOpenStopcock = () => {
    if (selectedApparatus !== 'Burette') return;

    const burettePos = dragPositions['Burette'] || itemSpawnPositions['Burette'] || [1.9, 1.35, -1.5];
    const flaskPos = dragPositions['Conical Flask'] || itemSpawnPositions['Conical Flask'] || [1.3, 1.15, -1.5];

    const distanceX = Math.abs(burettePos[0] - flaskPos[0]);
    const distanceZ = Math.abs(burettePos[2] - flaskPos[2]);
    const distanceY = burettePos[1] - flaskPos[1];

    // Only dispense if the burette is positioned above the flask.
    const aligned = distanceX < 0.45 && distanceZ < 0.45 && distanceY > 0.15 && distanceY < 1.4;
    if (!aligned) {
      setRecentAction('Position the burette above the conical flask first');
      return;
    }

    setRecentAction('Stopcock opened: dispensing into conical flask');

    const step = experimentSteps[currentStepIndex];
    if (step && !step.completed && step.id === 'titration-5') {
      completeStep('titration-5');
    }

    // Use existing pour animation as a desktop-friendly representation of dispensing.
    completePour('Burette', 'Conical Flask');
  };

  useEffect(() => {
    // Ensure we don't keep dispensing after the user releases/clicks elsewhere.
    const handleUp = () => stopStopcockDispense();
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('blur', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('blur', handleUp);
    };
  }, []);
  
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
      const flaskPos = dragPositions["Conical Flask"] || itemSpawnPositions["Conical Flask"] || [1.3, 1.15, -1.5];
      const step = experimentSteps[currentStepIndex];

      // Check if burette is within range (above the flask)
      const distanceX = Math.abs(position[0] - flaskPos[0]);
      const distanceZ = Math.abs(position[2] - flaskPos[2]);
      const distanceY = position[1] - flaskPos[1]; // Should be above (positive)

      // Burette is aligned if:
      // - Close in X/Z
      // - Above the flask by a reasonable margin
      if (distanceX < 0.45 && distanceZ < 0.45 && distanceY > 0.15 && distanceY < 1.4) {
        if (step && !step.completed && step.id === 'titration-4') {
          completeStep('titration-4');
          console.log('✅ Step Complete: Flask positioned under burette');
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
    handleItemClick("Burette", "Burette");
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

      <div className="fixed left-4 top-4 z-40 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/40 border border-cyan-500/20 rounded-lg px-4 py-3 backdrop-blur-sm max-w-[320px]">
          <div className="text-xs text-cyan-300/90 font-semibold">
            {experimentDisplayName ?? 'Experiment'}
          </div>
          <div className="mt-1 text-sm text-white font-semibold">
            {experimentSteps[currentStepIndex]?.title ?? 'Select an experiment to begin'}
          </div>
          {!!experimentSteps[currentStepIndex]?.description && (
            <div className="mt-1 text-xs text-slate-200/90">
              {experimentSteps[currentStepIndex]?.description}
            </div>
          )}
          {experimentSteps.length > 0 && (
            <div className="mt-2 text-[11px] text-slate-200/70">
              Step {Math.min(currentStepIndex + 1, experimentSteps.length)} / {experimentSteps.length}
            </div>
          )}
        </div>
      </div>
      
      {selectedApparatus && (
        <ApparatusMenu
          apparatusName={selectedApparatus}
          onGrab={() => handleGrab(selectedApparatus)}
          onPour={() => handlePour(selectedApparatus)}
          onDrag={() => {
            handleDrag(selectedApparatus);
            setSelectedApparatus(null);
            cancelPourTargeting();
          }}
          onRelease={() => handleRelease(selectedApparatus)}
          onOpenStopcock={selectedApparatus === 'Burette' ? handleOpenStopcock : undefined}
          customActions={(() => {
            if (selectedApparatus === 'pH Paper') {
              return [
                {
                  label: phStripTaken ? '🧻 Take New Strip' : '🧻 Take Strip',
                  onClick: () => {
                    setPhStripTaken(true);
                    setPhStripColor('#fef3c7');
                    setRecentAction(phStripTaken ? 'Replaced pH paper strip' : 'Took a pH paper strip');
                  },
                  className: 'bg-indigo-600 hover:bg-indigo-700',
                },
                {
                  label: isSelectingPhDipTarget ? '🎯 Click a Solution...' : '🧪 Dip',
                  onClick: () => {
                    if (!phStripTaken) {
                      setRecentAction('Take a strip first');
                      return;
                    }
                    setIsSelectingPhDipTarget(true);
                    setRecentAction('Select a solution to dip into');
                    setSelectedApparatus(null);
                  },
                  className: isSelectingPhDipTarget ? 'bg-yellow-700 hover:bg-yellow-800' : 'bg-emerald-600 hover:bg-emerald-700',
                },
                {
                  label: '🗑️ Throw Away',
                  onClick: () => {
                    if (!phStripTaken) {
                      setRecentAction('Take a strip first');
                      return;
                    }
                    disposePhStrip();
                    setSelectedApparatus(null);
                  },
                  className: 'bg-red-700 hover:bg-red-800',
                },
              ];
            }

            if (selectedApparatus === 'Conical Flask' && currentExperiment === 'chemical-reaction-test') {
              return [
                {
                  label: '📝 Record Results',
                  onClick: () => {
                    const step = experimentSteps[currentStepIndex];
                    if (step && !step.completed && step.id === 'reaction-8') {
                      completeStep('reaction-8');
                      setRecentAction('Recorded reaction observations');
                    }
                    setSelectedApparatus(null);
                  },
                  className: 'bg-indigo-700 hover:bg-indigo-800',
                },
              ];
            }

            return undefined;
          })()}
          showPour={selectedApparatus !== 'pH Paper'}
          showRelease={selectedApparatus !== 'pH Paper'}
          onClose={() => {
            setSelectedApparatus(null);
            cancelPourTargeting();
            cancelPhDipTargeting();
          }}
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
      {!xrSupported && (
        <div className="fixed bottom-16 right-4 z-30 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-[11px] text-slate-200 backdrop-blur">
          VR not detected yet. If you are on Quest, tap "ENTER VR".
        </div>
      )}
      
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
        dpr={[0.25, 0.75]}
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
        <color attach="background" args={["#0b1220"]} />
        <XR referenceSpace="local-floor">
          <Controllers />
          <Hands />
          <Suspense fallback={null}>
            <DesktopOnlyCamera />
            
            {/* Essential Lighting - Optimized */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} />
            
            {/* First-person navigation controls */}
            <FirstPersonControls moveSpeed={15.0} lookSpeed={0.006} />
            <VRLocomotion moveSpeed={3.5} />
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

            <ReactionTimelineUpdater
              enabled={currentExperiment === 'chemical-reaction-test'}
              startedAtMs={reactionStateRef.current.startedAtMs}
              reactionProgress={reactionProgress}
              setReactionProgress={setReactionProgress}
              experimentSteps={experimentSteps}
              currentStepIndex={currentStepIndex}
              completeStep={completeStep}
            />

            <VRWorldNudgeControls
              offsetZ={worldOffsetZ}
              onSetOffsetZ={setWorldOffsetZ}
            />
            
            <Physics gravity={[0, -9.81, 0]} timeStep={1/60} paused={false} interpolate={true}>
            <XRWorldOffset offsetZ={worldOffsetZ}>

            <XRDebugMarker />

            {activePourVisual && (
              <PourStream
                visible={true}
                color={activePourVisual.liquidColor}
                start={(() => {
                  const p = getItemPosition(activePourVisual.source);
                  return [p[0], p[1] + 0.22, p[2]] as [number, number, number];
                })()}
                end={(() => {
                  const p = getItemPosition(activePourVisual.target);
                  return [p[0], p[1] + 0.18, p[2]] as [number, number, number];
                })()}
              />
            )}

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
                  position={[-1.4, 1.1, -1.25]}
                  color="#ef4444"
                  type="beaker"
                  name="HCl (Hydrochloric Acid)"
                  mass={0.25}
                  fillLevel={itemFillLevels["HCl (Hydrochloric Acid)"] ?? 0.6}
                  liquidColor="#f87171"
                  highlight={isSelectingPourTarget && pourSource !== "HCl (Hydrochloric Acid)"}
                  forcePouring={apparatusStates["HCl (Hydrochloric Acid)"]?.pouring || false}
                  isDragging={apparatusStates["HCl (Hydrochloric Acid)"]?.dragging || false}
                  dragPosition={dragPositions["HCl (Hydrochloric Acid)"] || null}
                  onSelect={() => handleItemClick("HCl (Hydrochloric Acid)", "HCl")}
                />
                
                {/* NaOH Solution in Graduated Cylinder */}
                <PhysicsLabItem
                  position={[-0.8, 1.1, -1.25]}
                  color="#3b82f6"
                  type="beaker"
                  name="Sodium Hydroxide (NaOH)"
                  mass={0.25}
                  fillLevel={itemFillLevels["Sodium Hydroxide (NaOH)"] ?? 0.7}
                  liquidColor="#60a5fa"
                  highlight={isSelectingPourTarget && pourSource !== "Sodium Hydroxide (NaOH)"}
                  forcePouring={apparatusStates["Sodium Hydroxide (NaOH)"]?.pouring || false}
                  isDragging={apparatusStates["Sodium Hydroxide (NaOH)"]?.dragging || false}
                  dragPosition={dragPositions["Sodium Hydroxide (NaOH)"] || null}
                  onSelect={() => handleItemClick("Sodium Hydroxide (NaOH)", "NaOH")}
                />
                
                {/* Phenolphthalein Indicator */}
                <PhysicsLabItem
                  position={[-0.2, 1.1, -1.25]}
                  color="#ec4899"
                  type="test_tube"
                  name="Phenolphthalein Indicator"
                  mass={0.1}
                  fillLevel={itemFillLevels["Phenolphthalein Indicator"] ?? 0.3}
                  liquidColor="#f472b6"
                  highlight={isSelectingPourTarget && pourSource !== "Phenolphthalein Indicator"}
                  forcePouring={apparatusStates["Phenolphthalein Indicator"]?.pouring || false}
                  isDragging={apparatusStates["Phenolphthalein Indicator"]?.dragging || false}
                  dragPosition={dragPositions["Phenolphthalein Indicator"] || null}
                  onSelect={() => handleItemClick("Phenolphthalein Indicator")}
                />
                
                {/* Distilled Water */}
                <PhysicsLabItem
                  position={[0.4, 1.1, -1.25]}
                  color="#06b6d4"
                  type="beaker"
                  name="Distilled Water"
                  mass={0.25}
                  fillLevel={itemFillLevels["Distilled Water"] ?? 0.8}
                  liquidColor="#bae6fd"
                  highlight={isSelectingPourTarget && pourSource !== "Distilled Water"}
                  forcePouring={apparatusStates["Distilled Water"]?.pouring || false}
                  isDragging={apparatusStates["Distilled Water"]?.dragging || false}
                  dragPosition={dragPositions["Distilled Water"] || null}
                  onSelect={() => handleItemClick("Distilled Water", "Water")}
                />
            
            {/* ACIDITY TESTING EXPERIMENT */}
                {/* Acidic Solution (Unknown A) */}
                <PhysicsLabItem
                  position={[-1.2, 1.1, -1.75]}
                  color="#ef4444"
                  type="beaker"
                  name="Unknown Solution A (Acidic)"
                  mass={0.2}
                  fillLevel={itemFillLevels["Unknown Solution A (Acidic)"] ?? 0.6}
                  liquidColor="#fb7185"
                  onSelect={() => {
                    handleItemClick("Unknown Solution A (Acidic)", "Unknown A");
                    maybeRecordAcidityMeasurement('Unknown A');
                  }}
                  highlight={(isSelectingPourTarget && pourSource !== "Unknown Solution A (Acidic)") || (isSelectingPhDipTarget && allowedPhDipTargets.has('Unknown A'))}
                  forcePouring={apparatusStates["Unknown Solution A (Acidic)"]?.pouring || false}
                  isDragging={apparatusStates["Unknown Solution A (Acidic)"]?.dragging || false}
                  dragPosition={dragPositions["Unknown Solution A (Acidic)"] || null}
                />
                
                {/* Neutral Solution (Unknown B) */}
                <PhysicsLabItem
                  position={[-0.6, 1.1, -1.75]}
                  color="#3b82f6"
                  type="beaker"
                  name="Unknown Solution B (Neutral)"
                  mass={0.2}
                  fillLevel={itemFillLevels["Unknown Solution B (Neutral)"] ?? 0.6}
                  liquidColor="#bae6fd"
                  onSelect={() => {
                    handleItemClick("Unknown Solution B (Neutral)", "Unknown B");
                    maybeRecordAcidityMeasurement('Unknown B');
                  }}
                  highlight={(isSelectingPourTarget && pourSource !== "Unknown Solution B (Neutral)") || (isSelectingPhDipTarget && allowedPhDipTargets.has('Unknown B'))}
                  forcePouring={apparatusStates["Unknown Solution B (Neutral)"]?.pouring || false}
                  isDragging={apparatusStates["Unknown Solution B (Neutral)"]?.dragging || false}
                  dragPosition={dragPositions["Unknown Solution B (Neutral)"] || null}
                />
                
                {/* Alkaline Solution (Unknown C) */}
                <PhysicsLabItem
                  position={[0.0, 1.1, -1.75]}
                  color="#22c55e"
                  type="beaker"
                  name="Unknown Solution C (Alkaline)"
                  mass={0.2}
                  fillLevel={itemFillLevels["Unknown Solution C (Alkaline)"] ?? 0.6}
                  liquidColor="#4ade80"
                  onSelect={() => {
                    handleItemClick("Unknown Solution C (Alkaline)", "Unknown C");
                    maybeRecordAcidityMeasurement('Unknown C');
                  }}
                  highlight={(isSelectingPourTarget && pourSource !== "Unknown Solution C (Alkaline)") || (isSelectingPhDipTarget && allowedPhDipTargets.has('Unknown C'))}
                  forcePouring={apparatusStates["Unknown Solution C (Alkaline)"]?.pouring || false}
                  isDragging={apparatusStates["Unknown Solution C (Alkaline)"]?.dragging || false}
                  dragPosition={dragPositions["Unknown Solution C (Alkaline)"] || null}
                />
                
                {/* pH Paper Strips (draggable + dip workflow) */}
                <DraggableApparatus
                  apparatusRef={phPaperRef}
                  dragPosition={dragPositions["pH Paper"] || null}
                  isDragging={apparatusStates["pH Paper"]?.dragging || false}
                  defaultPosition={[0.8, 1.05, -1.75]}
                  rotation={[0, 0, 0]}
                >
                  <group
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleItemClick('pH Paper', 'pH Paper');
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleItemClick('pH Paper', 'pH Paper');
                      if (apparatusStates["pH Paper"]?.dragging) {
                        stopDragging('pH Paper');
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick('pH Paper', 'pH Paper');
                    }}
                  >
                    <mesh>
                      <boxGeometry args={[0.08, 0.02, 0.12]} />
                      <meshStandardMaterial color="#fef3c7" />
                    </mesh>
                    <Text position={[0, 0.03, 0]} fontSize={0.03} color="#f59e0b" anchorX="center">
                      pH PAPER
                    </Text>

                    {/* Strip sitting on top when taken */}
                    {phStripTaken && !phStripDisposing && (
                      <mesh position={[0.05, 0.045, 0]} rotation={[0, 0, -Math.PI / 8]}>
                        <boxGeometry args={[0.09, 0.003, 0.02]} />
                        <meshStandardMaterial color={phStripColor} emissive={phStripColor} emissiveIntensity={0.25} />
                      </mesh>
                    )}
                  </group>
                </DraggableApparatus>

                {/* Disposing strip animation (world-space) */}
                {phStripWorldPos && (
                  <group position={phStripWorldPos}>
                    <mesh rotation={[0, 0, Math.PI / 5]}>
                      <boxGeometry args={[0.09, 0.003, 0.02]} />
                      <meshStandardMaterial color={phStripColor} emissive={phStripColor} emissiveIntensity={0.25} />
                    </mesh>
                  </group>
                )}
                
                {/* Digital pH Meter */}
                <DigitalThermometer position={[1.4, 0.95, -1.75]} />
            
            {/* CHEMICAL REACTION TEST (H2O2 + KMnO4) */}
                {/* Hydrogen Peroxide (H2O2) in Beaker */}
                <PhysicsLabItem
                  position={[-1.3, 1.1, -1.5]}
                  color="#bae6fd"
                  type="beaker"
                  name="Hydrogen Peroxide (H₂O₂) 3%"
                  mass={0.25}
                  fillLevel={itemFillLevels["Hydrogen Peroxide (H₂O₂) 3%"] ?? 0.5}
                  liquidColor="#dbeafe"
                  highlight={isSelectingPourTarget && pourSource !== "Hydrogen Peroxide (H₂O₂) 3%"}
                  forcePouring={apparatusStates["Hydrogen Peroxide (H₂O₂) 3%"]?.pouring || false}
                  isDragging={apparatusStates["Hydrogen Peroxide (H₂O₂) 3%"]?.dragging || false}
                  dragPosition={dragPositions["Hydrogen Peroxide (H₂O₂) 3%"] || null}
                  onSelect={() => handleItemClick("Hydrogen Peroxide (H₂O₂) 3%", "H2O2")}
                />
                
                {/* Potassium Permanganate (KMnO4) in Small Flask */}
                <PhysicsLabItem
                  position={[-0.2, 1.1, -1.5]}
                  color="#a855f7"
                  type="flask"
                  name="Potassium Permanganate (KMnO₄)"
                  mass={0.15}
                  fillLevel={itemFillLevels["Potassium Permanganate (KMnO₄)"] ?? 0.4}
                  liquidColor="#9333ea"
                  highlight={isSelectingPourTarget && pourSource !== "Potassium Permanganate (KMnO₄)"}
                  forcePouring={apparatusStates["Potassium Permanganate (KMnO₄)"]?.pouring || false}
                  isDragging={apparatusStates["Potassium Permanganate (KMnO₄)"]?.dragging || false}
                  dragPosition={dragPositions["Potassium Permanganate (KMnO₄)"] || null}
                  onSelect={() => handleItemClick("Potassium Permanganate (KMnO₄)", "KMnO4")}
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
                <group
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handleFlaskClick();
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleFlaskClick();
                    if (apparatusStates["Conical Flask"]?.dragging) {
                      stopDragging("Conical Flask");
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlaskClick();
                  }}
                >
                  {isSelectingPourTarget && pourSource !== "Conical Flask" && (
                    <mesh position={[0, 0.08, 0]}>
                      <sphereGeometry args={[0.22, 16, 16]} />
                      <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
                    </mesh>
                  )}
                  <mesh castShadow receiveShadow position={[0, -0.05, 0]} renderOrder={2}>
                    <coneGeometry args={[0.15, 0.25, 32]} />
                    <meshPhysicalMaterial 
                      color="#ffffff"
                      transparent 
                      opacity={0.25}
                      roughness={0.2}
                      metalness={0.1}
                      transmission={0.75}
                      thickness={0.5}
                      ior={1.52}
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                      depthWrite={false}
                    />
                  </mesh>

                  {/* Liquid inside conical flask */}
                  <mesh
                    renderOrder={1}
                    position={[0, -0.18 + (Math.max(0.001, (itemFillLevels['Conical Flask'] ?? 0.25) * 0.2) / 2), 0]}
                  >
                    <cylinderGeometry
                      args={(() => {
                        const fill = Math.max(0.001, Math.min(1, itemFillLevels['Conical Flask'] ?? 0.25));
                        const height = Math.max(0.001, fill * 0.2);
                        // Make the liquid look like it "clings" to the flask walls (flat top, gentle taper),
                        // avoiding a pointy/conical mound appearance.
                        const rTop = 0.055 + fill * 0.06;
                        const rBottom = Math.max(0.045, rTop - 0.02);
                        // Flip the frustum (180°) so the wider side sits toward the bottom of the flask.
                        return [rBottom, rTop, height, 24] as [number, number, number, number];
                      })()}
                    />
                    <meshStandardMaterial
                      color={(() => {
                        if (currentExperiment === 'chemical-reaction-test') {
                          // KMnO4 purple fades to near-colorless as reaction progresses.
                          if (reactionProgress <= 0.01) return '#e0f2fe';
                          if (reactionProgress < 0.15) return '#7c3aed';
                          if (reactionProgress < 0.45) return '#a78bfa';
                          if (reactionProgress < 0.75) return '#ddd6fe';
                          return '#f8fafc';
                        }

                        const initial = buretteInitialFillRef.current;
                        const current = itemFillLevels['Burette'] ?? initial;
                        const dispensed = Math.max(0, initial - current);
                        if (dispensed > 0.18) return '#f472b6';
                        if (dispensed > 0.1) return '#f9a8d4';
                        if (dispensed > 0.04) return '#fce7f3';
                        return '#e0f2fe';
                      })()}
                      transparent
                      opacity={0.85}
                      roughness={0.15}
                      metalness={0}
                      depthWrite={false}
                      depthTest={true}
                    />
                  </mesh>

                  {currentExperiment === 'chemical-reaction-test' && reactionProgress > 0.05 && (
                    <group>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <mesh
                          key={i}
                          position={[
                            -0.05 + (i % 5) * 0.025,
                            -0.12 + ((i * 0.03 + reactionProgress * 0.22) % 0.22),
                            -0.03 + Math.floor(i / 5) * 0.03,
                          ]}
                          renderOrder={3}
                        >
                          <sphereGeometry args={[0.008 + (i % 3) * 0.002, 10, 10]} />
                          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.45} depthWrite={false} />
                        </mesh>
                      ))}
                    </group>
                  )}
                  <mesh castShadow receiveShadow position={[0, 0.15, 0]} renderOrder={2}>
                    <cylinderGeometry args={[0.04, 0.04, 0.15, 32]} />
                    <meshPhysicalMaterial 
                      color="#ffffff"
                      transparent 
                      opacity={0.25}
                      transmission={0.75}
                      ior={1.52}
                      depthWrite={false}
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
                <group>
                  {/* Burette body: click to open menu */}
                  <group
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleBuretteClick();
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleBuretteClick();
                      if (apparatusStates["Burette"]?.dragging) {
                        stopDragging("Burette");
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuretteClick();
                    }}
                  >
                  {isSelectingPourTarget && pourSource !== "Burette" && (
                    <mesh position={[0, 0.05, 0]}>
                      <cylinderGeometry args={[0.08, 0.08, 0.65, 16]} />
                      <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} />
                    </mesh>
                  )}
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

                  {/* Liquid inside burette */}
                  <mesh position={[0, -0.02 + ((itemFillLevels['Burette'] ?? 0) - 0.5) * 0.35, 0]}>
                    <cylinderGeometry args={[0.022, 0.022, Math.max(0.001, (itemFillLevels['Burette'] ?? 0) * 0.46), 18]} />
                    <meshStandardMaterial color="#93c5fd" transparent opacity={0.8} roughness={0.1} metalness={0.05} />
                  </mesh>

                  <mesh position={[0, -0.26, 0]} raycast={() => null}>
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

                  {/* Stopcock: exclusive press-and-hold control (does NOT open menu) */}
                  <mesh
                    raycast={THREE.Mesh.prototype.raycast}
                    position={[0, -0.26, 0.05]}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      startStopcockDispense();
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      stopStopcockDispense();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onPointerOut={() => {
                      stopStopcockDispense();
                    }}
                    onPointerCancel={() => {
                      stopStopcockDispense();
                    }}
                  >
                    <boxGeometry args={[0.05, 0.012, 0.02]} />
                    <meshStandardMaterial color={stopcockHeld ? '#22c55e' : '#ef4444'} />
                  </mesh>
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
              <group
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleBeakerClick();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleBeakerClick();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBeakerClick();
                }}
              >
                {isSelectingPourTarget && pourSource !== "Beaker" && (
                  <mesh position={[0, 0.08, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.32, 16]} />
                    <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} />
                  </mesh>
                )}

                {isSelectingPhDipTarget && (
                  <mesh position={[0, 0.08, 0]}>
                    <cylinderGeometry args={[0.17, 0.17, 0.34, 16]} />
                    <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} />
                  </mesh>
                )}
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

            </XRWorldOffset>
            </Physics>
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
