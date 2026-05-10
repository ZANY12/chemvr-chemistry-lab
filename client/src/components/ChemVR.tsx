import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { useLabTraining } from '../lib/labTrainingSystem';

export function NavigationHint() {
  const [show, setShow] = useState(true);
  const { experimentSteps, currentStepIndex, currentExperiment, getCurrentStep, canProceed, completeStep } = useLabTraining();

  // Don't show if no experiment is active
  if (!currentExperiment || experimentSteps.length === 0) {
    return null;
  }

  const completedSteps = experimentSteps.filter(step => step.completed).length;
  const totalSteps = experimentSteps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;
  const currentStep = getCurrentStep();

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="fixed bottom-4 left-4 z-40 p-2 bg-slate-900/80 border border-cyan-500/30 rounded-lg hover:bg-slate-800/80 transition-colors pointer-events-auto"
        title="Show experiment steps"
      >
        <ListTodo className="w-5 h-5 text-cyan-400" />
        <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {completedSteps}
        </span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-40 bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm max-w-sm pointer-events-auto">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
            <ListTodo className="w-3.5 h-3.5" />
            Experiment Steps
          </h3>
          <button
            onClick={() => setShow(false)}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Progress</span>
            <span className="text-cyan-400 font-semibold">
              {completedSteps} / {totalSteps} completed
            </span>
          </div>
          <div className="w-full bg-slate-800/60 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {currentStep && !currentStep.completed && (
          <button
            onClick={() => {
              if (canProceed()) {
                completeStep(currentStep.id);
              }
            }}
            disabled={!canProceed()}
            className={`w-full text-[11px] font-medium rounded-md px-2 py-1 border transition-colors ${
              canProceed()
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                : 'bg-slate-800/30 border-slate-700/30 text-slate-500 cursor-not-allowed'
            }`}
            title={canProceed() ? 'Mark current step complete' : 'Complete requirements (PPE / hood) before continuing'}
          >
            Mark Current Step Complete
          </button>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {experimentSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-2 p-2 rounded-lg transition-all ${
                index === currentStepIndex
                  ? 'bg-cyan-500/10 border border-cyan-500/30'
                  : step.completed
                  ? 'bg-green-500/5 border border-green-500/20'
                  : 'bg-slate-800/30 border border-slate-700/30'
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              ) : index === currentStepIndex ? (
                <Circle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5 animate-pulse" />
              ) : (
                <Circle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium ${
                  step.completed ? 'text-green-400 line-through' : 
                  index === currentStepIndex ? 'text-cyan-400' : 
                  'text-slate-300'
                }`}>
                  {step.title}
                </p>
                {index === currentStepIndex && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>

              <span className={`text-[10px] font-mono ${
                step.completed ? 'text-green-500' : 
                index === currentStepIndex ? 'text-cyan-400' : 
                'text-slate-500'
              }`}>
                {index + 1}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-[10px] text-slate-400">
            💡 Current step highlighted in cyan
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
