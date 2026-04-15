import React, { useState } from 'react';
import { useLabTraining } from '../lib/labTrainingSystem';
import { allExperiments } from '../lib/sampleExperiments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PlayCircle, BookOpen, Clock } from 'lucide-react';

export function ExperimentSelector() {
  const { currentExperiment, startExperiment, reset } = useLabTraining();
  const [showSelector, setShowSelector] = useState(true);

  if (currentExperiment) {
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        <Button
          variant="outline"
          onClick={() => {
            reset();
            setShowSelector(true);
          }}
          className="bg-slate-900/90 border-cyan-500/30 backdrop-blur-sm"
        >
          End Experiment
        </Button>
      </div>
    );
  }

  if (!showSelector) {
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        <Button
          onClick={() => setShowSelector(true)}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Start Experiment
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div className="max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <Card className="bg-slate-900/95 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">Select Training Experiment</CardTitle>
            <CardDescription className="text-slate-300">
              Choose an experiment to begin your chemistry lab training
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(allExperiments).map(([id, experiment]) => (
              <Card key={id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-white">{experiment.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {experiment.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        experiment.difficulty === 'beginner'
                          ? 'default'
                          : experiment.difficulty === 'intermediate'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {experiment.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{experiment.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{experiment.steps.length} steps</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      startExperiment(id, experiment.steps);
                      setShowSelector(false);
                    }}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Experiment
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setShowSelector(false)}
              className="w-full border-slate-700 text-slate-400 hover:text-white"
            >
              Free Exploration Mode
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
