# Progress Tracking & Report Generation System
## Comprehensive User Performance Analysis

### Overview
This system automatically tracks user progress throughout the chemistry experiment and generates detailed reports based on:
1. **Step completion status**
2. **Error type and frequency**
3. **Time taken per step**
4. **Incident response time**

---

## System Components

### 1. Progress Tracker (`progressTracker.ts`)

#### Features
- **Session Management**: Tracks entire experiment session
- **Step Tracking**: Monitors each step with timing
- **Error Logging**: Records all errors with severity levels
- **Incident Tracking**: Logs safety incidents and response times
- **Score Calculation**: Computes safety, accuracy, and efficiency scores

#### Data Structures

##### ExperimentSession
```typescript
{
  sessionId: string;
  experimentName: string;
  userName: string;
  startTime: number;
  endTime: number | null;
  totalDuration: number;
  steps: StepProgress[];
  overallErrors: ErrorRecord[];
  overallIncidents: IncidentRecord[];
  safetyScore: number;      // 0-100
  accuracyScore: number;    // 0-100
  efficiencyScore: number;  // 0-100
  overallScore: number;     // 0-100
}
```

##### StepProgress
```typescript
{
  stepId: string;
  stepName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startTime: number | null;
  endTime: number | null;
  duration: number;  // seconds
  attempts: number;
  errors: ErrorRecord[];
  incidents: IncidentRecord[];
}
```

##### ErrorRecord
```typescript
{
  errorId: string;
  errorType: 'safety_violation' | 'incorrect_action' | 'equipment_misuse' | 
             'procedure_error' | 'measurement_error';
  errorMessage: string;
  timestamp: number;
  stepId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  corrected: boolean;
  correctionTime: number | null;  // seconds
}
```

##### IncidentRecord
```typescript
{
  incidentId: string;
  incidentType: 'spill' | 'splash' | 'heat_exposure' | 'chemical_contact' | 
                'equipment_damage' | 'safety_breach';
  description: string;
  timestamp: number;
  stepId: string;
  severity: 'minor' | 'moderate' | 'severe';
  responseTime: number;  // seconds
  resolved: boolean;
  resolutionTime: number | null;  // seconds
}
```

---

## 2. Report Component (`ExperimentReport.tsx`)

### Features

#### Four-Tab Interface
1. **Overview Tab**
   - Session details
   - Performance scores
   - Summary statistics
   - Timeline

2. **Steps Tab**
   - Step-by-step completion status
   - Duration per step
   - Attempts per step
   - Errors and incidents per step

3. **Errors Tab**
   - Error type frequency chart
   - Detailed error log
   - Severity indicators
   - Correction times

4. **Incidents Tab**
   - Average response time
   - Incident details
   - Resolution status
   - Severity levels

#### Export Functionality
- **JSON Export**: Complete session data
- **Text Report**: Formatted text report

---

## Tracking Metrics

### 1. Step Completion Status

#### Tracked Data
- Step name
- Start time
- End time
- Duration (seconds)
- Status (completed/failed/in_progress)
- Number of attempts
- Errors during step
- Incidents during step

#### Example Output
```
STEP COMPLETION STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Steps:      5
Completed:        4
Failed:           0
In Progress:      1

1. Safety Check - Wear PPE
   Status:    COMPLETED
   Duration:  45s
   Attempts:  1
   Errors:    0
   Incidents: 0
```

---

### 2. Error Type and Frequency

#### Error Categories
1. **Safety Violation**: PPE not worn, unsafe handling
2. **Incorrect Action**: Wrong procedure step
3. **Equipment Misuse**: Improper apparatus use
4. **Procedure Error**: Skipped or wrong order
5. **Measurement Error**: Inaccurate readings

#### Severity Levels
- **Low**: Minor mistakes, easily corrected
- **Medium**: Moderate errors affecting results
- **High**: Serious errors requiring intervention
- **Critical**: Dangerous errors, safety risk

#### Example Output
```
ERROR TYPE AND FREQUENCY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Errors: 3

SAFETY VIOLATION: 1
PROCEDURE ERROR: 2

DETAILED ERROR LOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PPE not worn before starting
   Type:       safety_violation
   Severity:   HIGH
   Time:       14:23:15
   Corrected:  Yes
   Correction Time: 12s
```

---

### 3. Time Taken Per Step

#### Tracked Metrics
- Individual step duration
- Average time per step
- Total experiment duration
- Efficiency score based on timing

#### Calculation
```typescript
duration = endTime - startTime  // in milliseconds
durationSeconds = duration / 1000

avgStepTime = totalDuration / numberOfSteps
```

#### Example Output
```
TIME TAKEN PER STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Safety Check - Wear PPE: 45s
2. Prepare Titration Setup: 2m 15s
3. Position Burette: 1m 30s
4. Perform Titration: 5m 20s
5. Record Results: 1m 10s

Average Time Per Step: 2m 4s
Total Duration: 10m 20s
```

---

### 4. Incident Response Time

#### Tracked Data
- Incident type
- Occurrence time
- Response time (time to acknowledge)
- Resolution time (time to fully resolve)
- Severity level

#### Response Time Calculation
```typescript
responseTime = responseTimestamp - incidentTimestamp
resolutionTime = resolutionTimestamp - incidentTimestamp
```

#### Example Output
```
INCIDENT RESPONSE TIME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Incidents: 2
Average Response Time: 3.5s

1. Splash during pouring
   Type:          splash
   Severity:      MINOR
   Time:          14:25:30
   Response Time: 2s
   Resolved:      Yes
   Resolution Time: 15s

2. Spill on bench
   Type:          spill
   Severity:      MODERATE
   Time:          14:28:45
   Response Time: 5s
   Resolved:      Yes
   Resolution Time: 30s
```

---

## Score Calculation

### Overall Score Formula
```
overallScore = (safetyScore × 0.4) + 
               (accuracyScore × 0.3) + 
               (efficiencyScore × 0.3)
```

### Safety Score
- Starts at 100
- Penalties based on error/incident severity:
  - Low: -2 points
  - Medium: -5 points
  - High: -10 points
  - Critical: -20 points

### Accuracy Score
```
accuracyScore = max(0, 100 - (totalErrors × 5))
```

### Efficiency Score
```
efficiencyScore = max(0, 100 - (avgAttempts - 1) × 10 - 
                  max(0, (avgDuration - 60) / 10))
```

### Grade Scale
- **A**: 90-100
- **B**: 80-89
- **C**: 70-79
- **D**: 60-69
- **F**: 0-59

---

## Usage

### Starting a Session
```typescript
progressTracker.startSession('Acid-Base Titration', 'Student Name');
```

### Tracking Steps
```typescript
progressTracker.startStep('step_1', 'Prepare Titration Setup');
progressTracker.completeStep('step_1', true);  // true = success
```

### Logging Errors
```typescript
const errorId = progressTracker.logError(
  'safety_violation',
  'PPE not worn',
  'high'
);

// Later, mark as corrected
progressTracker.correctError(errorId);
```

### Logging Incidents
```typescript
const incidentId = progressTracker.logIncident(
  'splash',
  'Liquid splashed during pour',
  'minor'
);

progressTracker.respondToIncident(incidentId);  // User acknowledged
progressTracker.resolveIncident(incidentId);    // Incident resolved
```

### Ending Session & Generating Report
```typescript
const session = progressTracker.endSession();
// Display report with session data
```

---

## Report Export Formats

### 1. JSON Export
Complete session data in JSON format for:
- Data analysis
- Integration with other systems
- Backup and archival

```json
{
  "sessionId": "session_1234567890_abc123",
  "experimentName": "Acid-Base Titration",
  "userName": "Student",
  "startTime": 1714395600000,
  "endTime": 1714396220000,
  "totalDuration": 620,
  "steps": [...],
  "overallErrors": [...],
  "overallIncidents": [...],
  "safetyScore": 95,
  "accuracyScore": 90,
  "efficiencyScore": 85,
  "overallScore": 90
}
```

### 2. Text Report
Formatted text report with:
- ASCII art borders
- Organized sections
- Easy to read layout
- Printable format

---

## Integration with Scene

### Automatic Tracking
The system automatically tracks:
- Session start on component mount
- Step changes via `useEffect`
- Apparatus interactions
- Pour events (logged as incidents)
- Grab actions (step completion)

### Manual Tracking
Developers can add custom tracking:
```typescript
// Log custom error
progressTracker.logError(
  'measurement_error',
  'Incorrect volume reading',
  'medium'
);

// Log custom incident
progressTracker.logIncident(
  'equipment_damage',
  'Burette dropped',
  'severe'
);
```

---

## UI Components

### End Experiment Button
- **Location**: Top-right corner
- **Color**: Red (🏁 End Experiment & Generate Report)
- **Action**: Ends session and shows report

### Report Modal
- **Full-screen overlay**
- **Four tabs**: Overview, Steps, Errors, Incidents
- **Score display**: Color-coded (green/yellow/orange/red)
- **Export buttons**: JSON and Text formats
- **Close button**: Returns to experiment

---

## Benefits for Dissertation

### 1. Quantitative Data
- Precise timing measurements
- Error frequency statistics
- Response time metrics
- Performance scores

### 2. Qualitative Analysis
- Error type categorization
- Incident severity assessment
- Step-by-step progress tracking
- Correction time analysis

### 3. Learning Outcomes
- Identify common mistakes
- Measure improvement over time
- Track safety compliance
- Assess procedural accuracy

### 4. Research Metrics
- Average completion time
- Error patterns
- Safety incident frequency
- Student performance distribution

---

## Example Report Output

```
╔════════════════════════════════════════════════════════════════╗
║           CHEMISTRY LABORATORY EXPERIMENT REPORT               ║
╚════════════════════════════════════════════════════════════════╝

EXPERIMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Experiment Name: Acid-Base Titration
Student Name:    John Doe
Session ID:      session_1714395600000_abc123
Start Time:      April 29, 2026, 2:00:00 PM
End Time:        April 29, 2026, 2:10:20 PM
Total Duration:  10m 20s

PERFORMANCE SCORES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Score:    90/100 (Grade: A)
Safety Score:     95/100
Accuracy Score:   90/100
Efficiency Score: 85/100

STEP COMPLETION STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Steps:      5
Completed:        5
Failed:           0
In Progress:      0
```

---

## Console Logging

The system provides real-time console feedback:
```
📊 Session started: session_1714395600000_abc123
▶️ Step started: Safety Check - Wear PPE
✅ Step completed: Safety Check - Wear PPE (45.23s)
❌ Error logged: safety_violation - PPE not worn
✓ Error corrected: error_1714395645000_xyz789 (12.45s)
⚠️ Incident logged: splash - Pouring from Burette
🚨 Incident response: incident_1714395670000_def456 (2.15s)
✓ Incident resolved: incident_1714395670000_def456 (15.30s)
🏁 Session ended: session_1714395600000_abc123
📊 Overall Score: 90/100
```

---

## Future Enhancements

1. **PDF Export**: Generate PDF reports
2. **Charts & Graphs**: Visual performance analytics
3. **Comparison**: Compare with class average
4. **Recommendations**: AI-powered improvement suggestions
5. **Video Replay**: Record and replay session
6. **Leaderboard**: Class rankings
7. **Badges**: Achievement system
8. **Email Reports**: Send reports to instructor

---

**Document Version**: 1.0  
**Last Updated**: May 1, 2026  
**Author**: Progress Tracking System Development Team
