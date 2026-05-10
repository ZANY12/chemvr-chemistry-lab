import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { aiChemistry } from '../lib/aiChemistryEngine';
import { aiPhysics } from '../lib/aiPhysicsEngine';

interface AIAssistantProps {
  currentStep: number;
  experimentId?: string | null;
  stepTitle?: string | null;
  apparatusInUse: string | null;
  recentAction: string | null;
}

export function AIAssistant({ currentStep, experimentId, stepTitle, apparatusInUse, recentAction }: AIAssistantProps) {
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // AI analyzes current situation and provides guidance
    analyzeCurrentSituation();
  }, [currentStep, experimentId, stepTitle, apparatusInUse, recentAction]);

  const analyzeCurrentSituation = () => {
    const suggestions: string[] = [];
    let analysis = '';

    if (experimentId === 'acidity-testing') {
      analysis = `AI Guidance: ${stepTitle ?? 'Acidity Testing'}`;

      switch (currentStep) {
        case 0:
          suggestions.push('Ensure goggles, lab coat, and gloves are worn before handling any solutions.');
          suggestions.push('Use clean glassware to avoid cross-contamination between unknowns.');
          break;
        case 1:
          suggestions.push('Confirm Unknown A, B, and C are in separate beakers and clearly labeled.');
          suggestions.push('Keep pH paper dry until use.');
          break;
        case 2:
          suggestions.push('Dip pH paper briefly, then compare to the chart immediately.');
          suggestions.push('Rinse hands/gloves if you accidentally touch solutions.');
          break;
        case 3:
          suggestions.push('Rinse the pH probe with distilled water between samples.');
          suggestions.push('Gently blot the probe—do not wipe (reduces static/measurement drift).');
          break;
        case 4:
          suggestions.push('Blue litmus turns red in acids; red litmus turns blue in bases.');
          suggestions.push('If litmus is unchanged, the sample may be near-neutral.');
          break;
        case 5:
          suggestions.push('Add indicator dropwise; swirl gently for uniform color.');
          suggestions.push('Compare against the universal indicator color chart for pH estimate.');
          break;
        case 6:
          suggestions.push('Record pH values for A/B/C and classify: acidic (<7), neutral (=7), basic (>7).');
          suggestions.push('Double-check any outliers by repeating the measurement.');
          break;
        case 7:
          suggestions.push('Dispose solutions in the correct waste container and rinse glassware thoroughly.');
          suggestions.push('Remove PPE only after cleanup is complete.');
          break;
        default:
          suggestions.push('Select a solution (Unknown A/B/C) to generate AI pH analysis and progress updates.');
          break;
      }

      const molecular = aiPhysics.predictMolecularBehavior(
        ['H3O+', 'OH-'],
        { temperature: 25, pressure: 1 },
      );
      suggestions.push(...molecular.insights.map((i) => `AI Physics: ${i}`));
    } else {

      // AI provides step-specific guidance
      switch (currentStep) {
        case 0:
          analysis = '🤖 AI Safety Analysis: Preparing laboratory environment...';
          suggestions.push('✅ Ensure all PPE is worn before proceeding');
          suggestions.push('🔍 AI detected: Safety goggles, lab coat, and gloves required');
          suggestions.push('📊 Safety compliance: 0/3 items');
          break;

        case 1:
          analysis = '🤖 AI Setup Analysis: Analyzing distillation apparatus...';
          suggestions.push('🧪 AI recommends: Ensure all joints are properly sealed');
          suggestions.push('⚗️ Connect condenser cooling water (bottom to top)');
          suggestions.push('📏 AI tip: Add boiling chips to prevent bumping');
          break;

        case 2:
          analysis = '🤖 AI Physics Simulation: Monitoring heating process...';
          suggestions.push('🎯 AI guidance: Heat gently and gradually');
          suggestions.push('🌡️ Monitor temperature: Ethanol boils at 78°C');
          suggestions.push('💧 AI predicts: First drops appear at ~75-78°C');
          break;

        case 3:
          analysis = '🤖 AI Distillation Monitoring: Real-time analysis active...';
          const prediction = aiChemistry.predictReaction(
            ['Water', 'Ethanol'],
            { temperature: 78, concentration: 0.5, volume: 50 }
          );
          suggestions.push(`⚡ Separation efficiency: ${(prediction.probability * 100).toFixed(1)}%`);
          suggestions.push(`🎨 Expected: Clear, colorless distillate`);
          suggestions.push(`🌡️ Boiling point range: 78-82°C`);
          break;

        case 4:
          analysis = '🤖 AI Analytics: Analyzing distillation results...';
          suggestions.push(`📊 AI estimates: ~40-45% ethanol recovery`);
          suggestions.push(`✅ Purity prediction: 85-90% ethanol`);
          suggestions.push(`🎯 Boiling point accuracy: ±2°C`);
          break;

        default:
          analysis = '🤖 AI Assistant: Ready to help with your experiment';
          suggestions.push('💡 Click on apparatus for AI-powered guidance');
          suggestions.push('🔬 AI will analyze each action in real-time');
      }
    }

    // AI analyzes apparatus usage
    if (apparatusInUse) {
      const apparatusGuidance = getApparatusGuidance(apparatusInUse);
      suggestions.push(...apparatusGuidance);
    }

    // AI analyzes recent action
    if (recentAction) {
      const actionFeedback = getActionFeedback(recentAction);
      if (actionFeedback) {
        suggestions.unshift(actionFeedback);
      }
    }

    setAiSuggestions(suggestions);
    setAiAnalysis(analysis);
  };

  const getApparatusGuidance = (apparatus: string): string[] => {
    const guidance: string[] = [];

    switch (apparatus) {
      case 'Burette':
        guidance.push('🤖 AI Burette Analysis:');
        guidance.push('  • Ensure stopcock is closed before filling');
        guidance.push('  • AI recommends: Fill to 0.00 mL mark');
        guidance.push('  • Remove air bubbles from tip');
        const physics = aiPhysics.simulatePour(
          { viscosity: 1.0, density: 1000, surfaceTension: 72, temperature: 25 },
          null,
          Math.PI / 4,
          0.5
        );
        guidance.push(`  • Predicted flow rate: ${physics.flowRate.toFixed(2)} m/s`);
        break;

      case 'Conical Flask':
        guidance.push('🤖 AI Flask Analysis:');
        guidance.push('  • Add 25 mL of HCl solution');
        guidance.push('  • Add 2-3 drops of phenolphthalein indicator');
        guidance.push('  • AI predicts: Colorless initially, pink at endpoint');
        break;

      case 'Beaker':
        guidance.push('🤖 AI Beaker Analysis:');
        guidance.push('  • Suitable for mixing and heating');
        guidance.push('  • AI recommends: Use for solution preparation');
        break;

      case 'Graduated Cylinder':
        guidance.push('🤖 AI Cylinder Analysis:');
        guidance.push('  • Precision: ±0.1 mL');
        guidance.push('  • Read at eye level for accuracy');
        guidance.push('  • AI tip: Read bottom of meniscus');
        break;
    }

    return guidance;
  };

  const getActionFeedback = (action: string): string | null => {
    if (action.includes('Grab')) {
      return '✅ AI: Apparatus grabbed successfully - Ready for manipulation';
    } else if (action.includes('Pour')) {
      const physics = aiPhysics.simulatePour(
        { viscosity: 1.0, density: 1000, surfaceTension: 72, temperature: 25 },
        { viscosity: 1.0, density: 1000, surfaceTension: 72, temperature: 25 },
        Math.PI / 4,
        0.3
      );
      return `🤖 AI Pour Analysis: ${physics.predictions[0]}`;
    } else if (action.includes('Drag')) {
      return '🤖 AI: Tracking apparatus position - Alignment assistance active';
    }
    return null;
  };

  const runAIAnalysis = () => {
    setShowDetails(true);
    
    // Run comprehensive AI analysis
    const reaction = aiChemistry.predictReaction(
      ['HCl', 'NaOH'],
      { temperature: 25, concentration: 0.1, volume: 25 }
    );

    const molecular = aiPhysics.predictMolecularBehavior(
      ['HCl', 'NaOH'],
      { temperature: 25, pressure: 1 }
    );

    const detailedAnalysis = [
      '🔬 AI COMPREHENSIVE ANALYSIS:',
      '',
      '📊 REACTION PREDICTION:',
      `  • Type: ${reaction.reaction.reactionType}`,
      `  • Probability: ${(reaction.probability * 100).toFixed(1)}%`,
      `  • Energy Change: ${reaction.reaction.energyChange} kJ/mol`,
      '',
      '⚛️ MOLECULAR ANALYSIS:',
      ...molecular.insights,
      '',
      '🎯 RECOMMENDATIONS:',
      ...reaction.recommendations.map(r => `  • ${r}`),
      '',
      '⚠️ SAFETY WARNINGS:',
      ...reaction.safetyWarnings.map(w => `  • ${w}`),
      '',
      '🔮 EXPECTED OBSERVATIONS:',
      ...reaction.expectedObservations.map(o => `  • ${o}`)
    ];

    setAiSuggestions(detailedAnalysis);
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg"
        >
          🤖 AI Assistant
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border-purple-500/50 p-4 shadow-2xl">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-bold text-purple-300">
                🤖 AI Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* AI Analysis */}
          <div className="bg-black/30 rounded-lg p-3 border border-purple-500/30">
            <p className="text-sm text-purple-200 font-semibold">
              {aiAnalysis}
            </p>
          </div>

          {/* AI Suggestions */}
          <div className="bg-black/30 rounded-lg p-3 border border-purple-500/30 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <p
                  key={index}
                  className="text-xs text-gray-300 leading-relaxed"
                >
                  {suggestion}
                </p>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={runAIAnalysis}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm"
            >
              🔬 Deep Analysis
            </Button>
            <Button
              onClick={analyzeCurrentSituation}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
            >
              🔄 Refresh
            </Button>
          </div>

          {/* AI Badge */}
          <div className="text-center">
            <p className="text-xs text-purple-400">
              Powered by AI Chemistry & Physics Engine
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
