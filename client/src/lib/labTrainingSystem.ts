import { create } from 'zustand';

export interface ExperimentStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  safetyCheck?: boolean;
  ppeRequired?: string[];
  fumeHoodRequired?: boolean;
  equipmentRequired?: string[];
}

export interface SafetyViolation {
  id: string;
  type: 'no_ppe' | 'no_fume_hood' | 'spill' | 'improper_disposal' | 'cross_contamination';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: number;
}

interface LabTrainingState {
  // PPE State
  gogglesOn: boolean;
  labCoatOn: boolean;
  glovesOn: boolean;
  
  // Current Experiment
  currentExperiment: string | null;
  experimentSteps: ExperimentStep[];
  currentStepIndex: number;
  
  // Safety
  safetyViolations: SafetyViolation[];
  inFumeHood: boolean;
  
  // Measurements
  lastMeasurement: { type: string; value: number; unit: string } | null;
  
  // Actions
  setGoggles: (on: boolean) => void;
  setLabCoat: (on: boolean) => void;
  setGloves: (on: boolean) => void;
  startExperiment: (experimentId: string, steps: ExperimentStep[]) => void;
  completeStep: (stepId: string) => void;
  addSafetyViolation: (violation: Omit<SafetyViolation, 'id' | 'timestamp'>) => void;
  setInFumeHood: (inHood: boolean) => void;
  recordMeasurement: (type: string, value: number, unit: string) => void;
  canProceed: () => boolean;
  getCurrentStep: () => ExperimentStep | null;
  reset: () => void;
}

export const useLabTraining = create<LabTrainingState>((set, get) => ({
  gogglesOn: false,
  labCoatOn: false,
  glovesOn: false,
  currentExperiment: null,
  experimentSteps: [],
  currentStepIndex: 0,
  safetyViolations: [],
  inFumeHood: false,
  lastMeasurement: null,

  setGoggles: (on) => set({ gogglesOn: on }),
  setLabCoat: (on) => set({ labCoatOn: on }),
  setGloves: (on) => set({ glovesOn: on }),

  startExperiment: (experimentId, steps) => set({
    currentExperiment: experimentId,
    experimentSteps: steps,
    currentStepIndex: 0,
    safetyViolations: [],
  }),

  completeStep: (stepId) => {
    const state = get();
    const stepIndex = state.experimentSteps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const step = state.experimentSteps[stepIndex];
    
    // Check PPE requirements
    if (step.ppeRequired) {
      const missingPPE = [];
      if (step.ppeRequired.includes('goggles') && !state.gogglesOn) missingPPE.push('goggles');
      if (step.ppeRequired.includes('labCoat') && !state.labCoatOn) missingPPE.push('lab coat');
      if (step.ppeRequired.includes('gloves') && !state.glovesOn) missingPPE.push('gloves');
      
      if (missingPPE.length > 0) {
        get().addSafetyViolation({
          type: 'no_ppe',
          severity: 'critical',
          message: `Missing required PPE: ${missingPPE.join(', ')}`,
        });
        return;
      }
    }

    // Check fume hood requirement
    if (step.fumeHoodRequired && !state.inFumeHood) {
      get().addSafetyViolation({
        type: 'no_fume_hood',
        severity: 'critical',
        message: 'This step must be performed in a fume hood',
      });
      return;
    }

    const updatedSteps = [...state.experimentSteps];
    updatedSteps[stepIndex] = { ...step, completed: true };

    set({
      experimentSteps: updatedSteps,
      currentStepIndex: Math.min(stepIndex + 1, updatedSteps.length - 1),
    });
  },

  addSafetyViolation: (violation) => {
    const newViolation: SafetyViolation = {
      ...violation,
      id: `violation-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    set(state => ({
      safetyViolations: [...state.safetyViolations, newViolation],
    }));
  },

  setInFumeHood: (inHood) => set({ inFumeHood: inHood }),

  recordMeasurement: (type, value, unit) => set({
    lastMeasurement: { type, value, unit },
  }),

  canProceed: () => {
    const state = get();
    const currentStep = state.experimentSteps[state.currentStepIndex];
    if (!currentStep) return true;

    if (currentStep.ppeRequired) {
      if (currentStep.ppeRequired.includes('goggles') && !state.gogglesOn) return false;
      if (currentStep.ppeRequired.includes('labCoat') && !state.labCoatOn) return false;
      if (currentStep.ppeRequired.includes('gloves') && !state.glovesOn) return false;
    }

    if (currentStep.fumeHoodRequired && !state.inFumeHood) return false;

    return true;
  },

  getCurrentStep: () => {
    const state = get();
    return state.experimentSteps[state.currentStepIndex] || null;
  },

  reset: () => set({
    currentExperiment: null,
    experimentSteps: [],
    currentStepIndex: 0,
    safetyViolations: [],
    lastMeasurement: null,
  }),
}));
