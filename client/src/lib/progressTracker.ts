/**
 * Progress Tracking System
 * Tracks user progress, errors, timing, and incidents throughout the experiment
 */

export interface StepProgress {
  stepId: string;
  stepName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startTime: number | null;
  endTime: number | null;
  duration: number; // in seconds
  attempts: number;
  errors: ErrorRecord[];
  incidents: IncidentRecord[];
}

export interface ErrorRecord {
  errorId: string;
  errorType: 'safety_violation' | 'incorrect_action' | 'equipment_misuse' | 'procedure_error' | 'measurement_error';
  errorMessage: string;
  timestamp: number;
  stepId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  corrected: boolean;
  correctionTime: number | null; // time taken to correct in seconds
}

export interface IncidentRecord {
  incidentId: string;
  incidentType: 'spill' | 'splash' | 'heat_exposure' | 'chemical_contact' | 'equipment_damage' | 'safety_breach';
  description: string;
  timestamp: number;
  stepId: string;
  severity: 'minor' | 'moderate' | 'severe';
  responseTime: number; // time taken to respond in seconds
  resolved: boolean;
  resolutionTime: number | null;
}

export interface ExperimentSession {
  sessionId: string;
  experimentName: string;
  userName: string;
  startTime: number;
  endTime: number | null;
  totalDuration: number;
  steps: StepProgress[];
  overallErrors: ErrorRecord[];
  overallIncidents: IncidentRecord[];
  safetyScore: number; // 0-100
  accuracyScore: number; // 0-100
  efficiencyScore: number; // 0-100
  overallScore: number; // 0-100
}

class ProgressTracker {
  private currentSession: ExperimentSession | null = null;
  private currentStepId: string | null = null;
  private errorCount: Map<string, number> = new Map();
  private incidentResponseTimers: Map<string, number> = new Map();

  /**
   * Start a new experiment session
   */
  startSession(experimentName: string, userName: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      experimentName,
      userName,
      startTime: Date.now(),
      endTime: null,
      totalDuration: 0,
      steps: [],
      overallErrors: [],
      overallIncidents: [],
      safetyScore: 100,
      accuracyScore: 100,
      efficiencyScore: 100,
      overallScore: 100
    };

    console.log(`📊 Session started: ${sessionId}`);
    return sessionId;
  }

  /**
   * Start tracking a specific step
   */
  startStep(stepId: string, stepName: string): void {
    if (!this.currentSession) {
      console.error('No active session');
      return;
    }

    // Complete previous step if exists
    if (this.currentStepId) {
      this.completeStep(this.currentStepId);
    }

    const stepProgress: StepProgress = {
      stepId,
      stepName,
      status: 'in_progress',
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      attempts: 1,
      errors: [],
      incidents: []
    };

    this.currentSession.steps.push(stepProgress);
    this.currentStepId = stepId;

    console.log(`▶️ Step started: ${stepName}`);
  }

  /**
   * Complete a step
   */
  completeStep(stepId: string, success: boolean = true): void {
    if (!this.currentSession) return;

    const step = this.currentSession.steps.find(s => s.stepId === stepId);
    if (!step) return;

    step.endTime = Date.now();
    step.duration = step.startTime ? (step.endTime - step.startTime) / 1000 : 0;
    step.status = success ? 'completed' : 'failed';

    console.log(`✅ Step completed: ${step.stepName} (${step.duration.toFixed(2)}s)`);
  }

  /**
   * Log an error
   */
  logError(
    errorType: ErrorRecord['errorType'],
    errorMessage: string,
    severity: ErrorRecord['severity']
  ): string {
    if (!this.currentSession || !this.currentStepId) return '';

    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const error: ErrorRecord = {
      errorId,
      errorType,
      errorMessage,
      timestamp: Date.now(),
      stepId: this.currentStepId,
      severity,
      corrected: false,
      correctionTime: null
    };

    // Add to current step
    const step = this.currentSession.steps.find(s => s.stepId === this.currentStepId);
    if (step) {
      step.errors.push(error);
    }

    // Add to overall errors
    this.currentSession.overallErrors.push(error);

    // Update error count
    const count = this.errorCount.get(errorType) || 0;
    this.errorCount.set(errorType, count + 1);

    // Update safety score
    this.updateSafetyScore(severity);

    console.log(`❌ Error logged: ${errorType} - ${errorMessage}`);
    return errorId;
  }

  /**
   * Mark error as corrected
   */
  correctError(errorId: string): void {
    if (!this.currentSession) return;

    const error = this.currentSession.overallErrors.find(e => e.errorId === errorId);
    if (!error) return;

    error.corrected = true;
    error.correctionTime = (Date.now() - error.timestamp) / 1000;

    console.log(`✓ Error corrected: ${errorId} (${error.correctionTime.toFixed(2)}s)`);
  }

  /**
   * Log an incident
   */
  logIncident(
    incidentType: IncidentRecord['incidentType'],
    description: string,
    severity: IncidentRecord['severity']
  ): string {
    if (!this.currentSession || !this.currentStepId) return '';

    const incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const incident: IncidentRecord = {
      incidentId,
      incidentType,
      description,
      timestamp: Date.now(),
      stepId: this.currentStepId,
      severity,
      responseTime: 0,
      resolved: false,
      resolutionTime: null
    };

    // Start response timer
    this.incidentResponseTimers.set(incidentId, Date.now());

    // Add to current step
    const step = this.currentSession.steps.find(s => s.stepId === this.currentStepId);
    if (step) {
      step.incidents.push(incident);
    }

    // Add to overall incidents
    this.currentSession.overallIncidents.push(incident);

    // Update safety score
    this.updateSafetyScore(severity === 'minor' ? 'low' : severity === 'moderate' ? 'medium' : 'high');

    console.log(`⚠️ Incident logged: ${incidentType} - ${description}`);
    return incidentId;
  }

  /**
   * Respond to an incident
   */
  respondToIncident(incidentId: string): void {
    if (!this.currentSession) return;

    const incident = this.currentSession.overallIncidents.find(i => i.incidentId === incidentId);
    if (!incident) return;

    const responseStart = this.incidentResponseTimers.get(incidentId);
    if (responseStart) {
      incident.responseTime = (Date.now() - responseStart) / 1000;
      this.incidentResponseTimers.delete(incidentId);
    }

    console.log(`🚨 Incident response: ${incidentId} (${incident.responseTime.toFixed(2)}s)`);
  }

  /**
   * Resolve an incident
   */
  resolveIncident(incidentId: string): void {
    if (!this.currentSession) return;

    const incident = this.currentSession.overallIncidents.find(i => i.incidentId === incidentId);
    if (!incident) return;

    incident.resolved = true;
    incident.resolutionTime = (Date.now() - incident.timestamp) / 1000;

    console.log(`✓ Incident resolved: ${incidentId} (${incident.resolutionTime.toFixed(2)}s)`);
  }

  /**
   * Update safety score based on error/incident severity
   */
  private updateSafetyScore(severity: 'low' | 'medium' | 'high' | 'critical'): void {
    if (!this.currentSession) return;

    const penalties = {
      low: 2,
      medium: 5,
      high: 10,
      critical: 20
    };

    this.currentSession.safetyScore = Math.max(0, this.currentSession.safetyScore - penalties[severity]);
    this.calculateOverallScore();
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(): void {
    if (!this.currentSession) return;

    // Calculate accuracy score based on errors
    const totalErrors = this.currentSession.overallErrors.length;
    this.currentSession.accuracyScore = Math.max(0, 100 - (totalErrors * 5));

    // Calculate efficiency score based on time and attempts
    const avgDuration = this.currentSession.steps.reduce((sum, s) => sum + s.duration, 0) / this.currentSession.steps.length;
    const avgAttempts = this.currentSession.steps.reduce((sum, s) => sum + s.attempts, 0) / this.currentSession.steps.length;
    this.currentSession.efficiencyScore = Math.max(0, 100 - (avgAttempts - 1) * 10 - Math.max(0, (avgDuration - 60) / 10));

    // Overall score is weighted average
    this.currentSession.overallScore = Math.round(
      (this.currentSession.safetyScore * 0.4) +
      (this.currentSession.accuracyScore * 0.3) +
      (this.currentSession.efficiencyScore * 0.3)
    );
  }

  /**
   * End the current session
   */
  endSession(): ExperimentSession | null {
    if (!this.currentSession) return null;

    // Complete current step if exists
    if (this.currentStepId) {
      this.completeStep(this.currentStepId);
    }

    this.currentSession.endTime = Date.now();
    this.currentSession.totalDuration = (this.currentSession.endTime - this.currentSession.startTime) / 1000;

    // Final score calculation
    this.calculateOverallScore();

    console.log(`🏁 Session ended: ${this.currentSession.sessionId}`);
    console.log(`📊 Overall Score: ${this.currentSession.overallScore}/100`);

    const session = this.currentSession;
    this.currentSession = null;
    this.currentStepId = null;
    this.errorCount.clear();
    this.incidentResponseTimers.clear();

    return session;
  }

  /**
   * Get current session data
   */
  getCurrentSession(): ExperimentSession | null {
    return this.currentSession;
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): Map<string, number> {
    return new Map(this.errorCount);
  }
}

// Export singleton instance
export const progressTracker = new ProgressTracker();
