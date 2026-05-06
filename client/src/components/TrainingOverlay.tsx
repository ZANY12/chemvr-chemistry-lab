import React, { useEffect } from 'react';
import { useLabTraining } from '../lib/labTrainingSystem';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, Circle, AlertTriangle, Shield } from 'lucide-react';

export function TrainingOverlay() {
  const {
    gogglesOn,
    labCoatOn,
    glovesOn,
    currentExperiment,
    experimentSteps,
    currentStepIndex,
    safetyViolations,
    getCurrentStep,
    canProceed,
    startExperiment,
    completeStep,
  } = useLabTraining();

  const allPPEWorn = gogglesOn && labCoatOn && glovesOn;

  const handleStartExperiment = () => {
    if (allPPEWorn && !currentExperiment) {
      // Import distillation experiment
      import('../lib/distillationExperiment').then(({ distillationExperimentInfo }) => {
        startExperiment(distillationExperimentInfo.id, distillationExperimentInfo.steps);
      });
    }
  };

  // Auto-complete Step 1 (Safety Check) when all PPE is worn
  useEffect(() => {
    if (currentExperiment && allPPEWorn && currentStepIndex === 0) {
      const currentStep = experimentSteps[0];
      if (currentStep && currentStep.id === 'distillation-1' && !currentStep.completed) {
        completeStep('distillation-1');
      }
    }
  }, [allPPEWorn, currentExperiment, currentStepIndex, experimentSteps, completeStep]);

  const currentStep = getCurrentStep();
  const completedSteps = currentExperiment ? experimentSteps.filter(s => s.completed).length : 0;
  const progress = currentExperiment ? (completedSteps / experimentSteps.length) * 100 : 0;
  const recentViolations = safetyViolations.slice(-3);

  return null;
}
