import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ExperimentSession, StepProgress, ErrorRecord, IncidentRecord } from '../lib/progressTracker';

interface ExperimentReportProps {
  session: ExperimentSession;
  onClose: () => void;
}

export function ExperimentReport({ session, onClose }: ExperimentReportProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'errors' | 'incidents'>('overview');

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment_report_${session.sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    const report = generateTextReport();
    const dataBlob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment_report_${session.sessionId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateTextReport = (): string => {
    let report = `
╔════════════════════════════════════════════════════════════════╗
║           CHEMISTRY LABORATORY EXPERIMENT REPORT               ║
╚════════════════════════════════════════════════════════════════╝

EXPERIMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Experiment Name: ${session.experimentName}
Student Name:    ${session.userName}
Session ID:      ${session.sessionId}
Start Time:      ${new Date(session.startTime).toLocaleString()}
End Time:        ${session.endTime ? new Date(session.endTime).toLocaleString() : 'In Progress'}
Total Duration:  ${formatDuration(session.totalDuration)}

PERFORMANCE SCORES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Score:    ${session.overallScore}/100 (Grade: ${getScoreGrade(session.overallScore)})
Safety Score:     ${session.safetyScore}/100
Accuracy Score:   ${session.accuracyScore}/100
Efficiency Score: ${session.efficiencyScore}/100

STEP COMPLETION STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Steps:      ${session.steps.length}
Completed:        ${session.steps.filter(s => s.status === 'completed').length}
Failed:           ${session.steps.filter(s => s.status === 'failed').length}
In Progress:      ${session.steps.filter(s => s.status === 'in_progress').length}

`;

    // Step details
    report += '\nDETAILED STEP BREAKDOWN\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    session.steps.forEach((step, index) => {
      report += `\n${index + 1}. ${step.stepName}\n`;
      report += `   Status:    ${step.status.toUpperCase()}\n`;
      report += `   Duration:  ${formatDuration(step.duration)}\n`;
      report += `   Attempts:  ${step.attempts}\n`;
      report += `   Errors:    ${step.errors.length}\n`;
      report += `   Incidents: ${step.incidents.length}\n`;
    });

    // Error summary
    report += '\n\nERROR TYPE AND FREQUENCY\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += `Total Errors: ${session.overallErrors.length}\n\n`;
    
    const errorsByType = session.overallErrors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(errorsByType).forEach(([type, count]) => {
      report += `${type.replace(/_/g, ' ').toUpperCase()}: ${count}\n`;
    });

    // Error details
    if (session.overallErrors.length > 0) {
      report += '\n\nDETAILED ERROR LOG\n';
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      session.overallErrors.forEach((error, index) => {
        report += `\n${index + 1}. ${error.errorMessage}\n`;
        report += `   Type:       ${error.errorType}\n`;
        report += `   Severity:   ${error.severity.toUpperCase()}\n`;
        report += `   Time:       ${formatTimestamp(error.timestamp)}\n`;
        report += `   Corrected:  ${error.corrected ? 'Yes' : 'No'}\n`;
        if (error.correctionTime) {
          report += `   Correction Time: ${formatDuration(error.correctionTime)}\n`;
        }
      });
    }

    // Incident summary
    report += '\n\nINCIDENT RESPONSE TIME\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += `Total Incidents: ${session.overallIncidents.length}\n\n`;

    if (session.overallIncidents.length > 0) {
      const avgResponseTime = session.overallIncidents.reduce((sum, inc) => sum + inc.responseTime, 0) / session.overallIncidents.length;
      report += `Average Response Time: ${formatDuration(avgResponseTime)}\n\n`;

      session.overallIncidents.forEach((incident, index) => {
        report += `\n${index + 1}. ${incident.description}\n`;
        report += `   Type:          ${incident.incidentType}\n`;
        report += `   Severity:      ${incident.severity.toUpperCase()}\n`;
        report += `   Time:          ${formatTimestamp(incident.timestamp)}\n`;
        report += `   Response Time: ${formatDuration(incident.responseTime)}\n`;
        report += `   Resolved:      ${incident.resolved ? 'Yes' : 'No'}\n`;
        if (incident.resolutionTime) {
          report += `   Resolution Time: ${formatDuration(incident.resolutionTime)}\n`;
        }
      });
    }

    // Time analysis
    report += '\n\nTIME TAKEN PER STEP\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    session.steps.forEach((step, index) => {
      report += `${index + 1}. ${step.stepName}: ${formatDuration(step.duration)}\n`;
    });

    const avgStepTime = session.steps.reduce((sum, s) => sum + s.duration, 0) / session.steps.length;
    report += `\nAverage Time Per Step: ${formatDuration(avgStepTime)}\n`;

    // Recommendations
    report += '\n\nRECOMMENDATIONS\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    
    if (session.safetyScore < 80) {
      report += '⚠️  Review safety protocols and procedures\n';
    }
    if (session.accuracyScore < 80) {
      report += '📚 Practice measurement techniques and procedure steps\n';
    }
    if (session.efficiencyScore < 80) {
      report += '⏱️  Work on improving time management and reducing attempts\n';
    }
    if (session.overallScore >= 90) {
      report += '🌟 Excellent performance! Keep up the good work!\n';
    }

    report += '\n╔════════════════════════════════════════════════════════════════╗\n';
    report += '║                    END OF REPORT                               ║\n';
    report += '╚════════════════════════════════════════════════════════════════╝\n';

    return report;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/50 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400">📊 Experiment Report</h2>
              <p className="text-sm text-gray-400 mt-1">{session.experimentName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Overall</p>
              <p className={`text-3xl font-bold ${getScoreColor(session.overallScore)}`}>
                {session.overallScore}
              </p>
              <p className="text-sm text-gray-500">Grade: {getScoreGrade(session.overallScore)}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Safety</p>
              <p className={`text-3xl font-bold ${getScoreColor(session.safetyScore)}`}>
                {session.safetyScore}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Accuracy</p>
              <p className={`text-3xl font-bold ${getScoreColor(session.accuracyScore)}`}>
                {session.accuracyScore}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Efficiency</p>
              <p className={`text-3xl font-bold ${getScoreColor(session.efficiencyScore)}`}>
                {session.efficiencyScore}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cyan-500/30 px-6">
          {(['overview', 'steps', 'errors', 'incidents'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Student Name</p>
                  <p className="text-lg text-white font-semibold">{session.userName}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Duration</p>
                  <p className="text-lg text-white font-semibold">{formatDuration(session.totalDuration)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Steps Completed</p>
                  <p className="text-lg text-white font-semibold">
                    {session.steps.filter(s => s.status === 'completed').length} / {session.steps.length}
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Errors</p>
                  <p className="text-lg text-white font-semibold">{session.overallErrors.length}</p>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Session Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Time:</span>
                    <span className="text-white">{new Date(session.startTime).toLocaleString()}</span>
                  </div>
                  {session.endTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">End Time:</span>
                      <span className="text-white">{new Date(session.endTime).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Step Completion Status</h3>
              {session.steps.map((step, index) => (
                <div key={step.stepId} className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {step.status === 'completed' ? '✅' : 
                         step.status === 'failed' ? '❌' : 
                         step.status === 'in_progress' ? '⏳' : '⭕'}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{step.stepName}</p>
                        <p className="text-xs text-gray-400">Step {index + 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-cyan-400">{formatDuration(step.duration)}</p>
                      <p className="text-xs text-gray-400">{step.attempts} attempt(s)</p>
                    </div>
                  </div>
                  {(step.errors.length > 0 || step.incidents.length > 0) && (
                    <div className="mt-2 pt-2 border-t border-gray-700 flex gap-4 text-xs">
                      <span className="text-red-400">❌ {step.errors.length} errors</span>
                      <span className="text-yellow-400">⚠️ {step.incidents.length} incidents</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Error Type and Frequency</h3>
                {(() => {
                  const errorsByType = session.overallErrors.reduce((acc, error) => {
                    acc[error.errorType] = (acc[error.errorType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  return (
                    <div className="space-y-2">
                      {Object.entries(errorsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">
                            {type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold text-red-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <h3 className="text-lg font-semibold text-cyan-400">Detailed Error Log</h3>
              {session.overallErrors.map((error, index) => (
                <div key={error.errorId} className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-white">#{index + 1}: {error.errorMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimestamp(error.timestamp)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      error.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      error.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      error.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {error.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Type: {error.errorType}</span>
                    <span>Corrected: {error.corrected ? '✓ Yes' : '✗ No'}</span>
                    {error.correctionTime && (
                      <span>Correction Time: {formatDuration(error.correctionTime)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Incident Response Time</h3>
                {session.overallIncidents.length > 0 ? (
                  <div className="text-sm">
                    <p className="text-gray-300">
                      Average Response Time: <span className="text-cyan-400 font-semibold">
                        {formatDuration(
                          session.overallIncidents.reduce((sum, inc) => sum + inc.responseTime, 0) / 
                          session.overallIncidents.length
                        )}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No incidents recorded</p>
                )}
              </div>

              {session.overallIncidents.map((incident, index) => (
                <div key={incident.incidentId} className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-white">#{index + 1}: {incident.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimestamp(incident.timestamp)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      incident.severity === 'severe' ? 'bg-red-500/20 text-red-400' :
                      incident.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-3">
                    <div>Type: {incident.incidentType}</div>
                    <div>Response: {formatDuration(incident.responseTime)}</div>
                    <div>Resolved: {incident.resolved ? '✓ Yes' : '✗ No'}</div>
                    {incident.resolutionTime && (
                      <div>Resolution: {formatDuration(incident.resolutionTime)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-cyan-500/30 flex gap-3">
          <Button
            onClick={exportToJSON}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            📥 Export JSON
          </Button>
          <Button
            onClick={exportToText}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            📄 Export Report
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
