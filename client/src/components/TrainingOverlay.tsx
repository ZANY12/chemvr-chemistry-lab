import React from 'react';
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
  } = useLabTraining();

  if (!currentExperiment) return null;

  const currentStep = getCurrentStep();
  const completedSteps = experimentSteps.filter(s => s.completed).length;
  const progress = (completedSteps / experimentSteps.length) * 100;
  const recentViolations = safetyViolations.slice(-3);

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md space-y-4 pointer-events-auto">
      {/* PPE Status */}
      <Card className="bg-slate-900/90 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-cyan-400">
            <Shield className="w-4 h-4" />
            Personal Protective Equipment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            {gogglesOn ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
            <span className={gogglesOn ? 'text-green-400' : 'text-slate-400'}>
              Safety Goggles
            </span>
          </div>
          <div className="flex items-center gap-2">
            {labCoatOn ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
            <span className={labCoatOn ? 'text-green-400' : 'text-slate-400'}>
              Lab Coat
            </span>
          </div>
          <div className="flex items-center gap-2">
            {glovesOn ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
            <span className={glovesOn ? 'text-green-400' : 'text-slate-400'}>
              Gloves
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStep && (
        <Card className="bg-slate-900/90 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-cyan-400">
                Step {currentStepIndex + 1} of {experimentSteps.length}
              </CardTitle>
              <Badge variant={canProceed() ? 'default' : 'destructive'}>
                {canProceed() ? 'Ready' : 'Requirements Not Met'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1">{currentStep.title}</h4>
              <p className="text-sm text-slate-300">{currentStep.description}</p>
            </div>

            {currentStep.ppeRequired && currentStep.ppeRequired.length > 0 && (
              <div className="text-xs text-amber-400 flex items-start gap-2">
                <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Required PPE: {currentStep.ppeRequired.join(', ')}</span>
              </div>
            )}

            {currentStep.fumeHoodRequired && (
              <div className="text-xs text-amber-400 flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Must be performed in fume hood</span>
              </div>
            )}

            <Progress value={progress} className="h-2" />
            <p className="text-xs text-slate-400">
              {completedSteps} of {experimentSteps.length} steps completed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Safety Violations */}
      {recentViolations.length > 0 && (
        <div className="space-y-2">
          {recentViolations.map((violation) => (
            <Alert
              key={violation.id}
              variant={violation.severity === 'critical' ? 'destructive' : 'default'}
              className="bg-slate-900/90 backdrop-blur-sm"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {violation.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
