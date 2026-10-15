export type AgentRole = 
  | 'orchestrator'
  | 'planner'
  | 'research'
  | 'analysis'
  | 'coding'
  | 'tool_execution'
  | 'data'
  | 'verification'
  | 'memory'
  | 'reporting';

export type AgentState = 
  | 'healthy'
  | 'observing'
  | 'suspicious'
  | 'restricted'
  | 'isolated'
  | 'recovering';

export type SeverityLevel = 'info' | 'warning' | 'high' | 'critical';

export type PolicyDecision = 
  | 'allowed'
  | 'denied'
  | 'requires_approval'
  | 'rate_limited'
  | 'quarantined';

export type CausalStatus = 'unverified' | 'candidate' | 'verified';

export interface AgentPermissionProfile {
  canReadDocuments: boolean;
  canReadDatasets: boolean;
  canSendMessagesTo: string[]; // agent IDs
  canRequestTools: boolean;
  allowedTools: string[];
  canExecuteWorkflowSteps: boolean;
  canWriteOutput: boolean;
  canAccessExternalAPI: boolean;
  dataScopes: string[];
}

export interface AIAgent {
  id: string;
  name: string;
  role: AgentRole;
  roleDescription: string;
  trustLevel: number; // 0 - 100
  riskScore: number; // 0.00 - 1.00
  currentStatus: AgentState;
  healthStatus: 'optimal' | 'degraded' | 'failing';
  permissionProfile: AgentPermissionProfile;
  allowedTools: string[];
  communicationCount: number;
  incomingMessages: number;
  outgoingMessages: number;
  anomalyScore: number;
  policyViolationCount: number;
  lastActivity: string;
  downstreamDependencies: string[]; // agent IDs
  upstreamDependencies: string[]; // agent IDs
  containmentStatus: 'uncontained' | 'monitored' | 'throttled' | 'quarantined' | 'isolated';
  x: number;
  y: number;
  activeTask?: string;
  currentMessage?: string;
}

export interface AgentConnection {
  id: string;
  source: string;
  target: string;
  channelType: 'delegation' | 'data_flow' | 'tool_invocation' | 'verification';
  messageFrequency: number; // msgs/min
  status: 'active' | 'throttled' | 'blocked' | 'monitored';
  isSuspicious: boolean;
  causalStrength: number; // 0.0 - 1.0
  isCandidateCausal: boolean;
  isVerifiedCausal: boolean;
}

export type EventCategory = 
  | 'normal_delegation'
  | 'unexpected_communication'
  | 'repeated_policy_failures'
  | 'unusual_message_frequency'
  | 'unauthorized_tool_requests'
  | 'unexpected_permission_changes'
  | 'suspicious_instruction_propagation'
  | 'attempt_bypass_approval'
  | 'unusual_data_access'
  | 'repeated_downstream_failures'
  | 'agent_loops_runaway_delegation'
  | 'conflicting_instructions'
  | 'unexpected_external_integration'
  | 'anomalous_behavior_change';

export interface AgentCommunicationEvent {
  eventId: string;
  timestamp: string;
  sourceAgent: string;
  destinationAgent: string;
  messageType: string;
  category: EventCategory;
  severity: SeverityLevel;
  riskLevel: 'low' | 'elevated' | 'high' | 'critical';
  policyDecision: PolicyDecision;
  contentClassification: 'internal' | 'confidential' | 'privileged' | 'untrusted';
  toolRequested: string | null;
  correlationId: string;
  causalStatus: CausalStatus;
  detectionReason: string;
  relatedEventIds: string[];
  affectedAgents: string[];
  recommendedResponse: string;
}

export interface BehaviorGuardIndicators {
  indicatorA_behavioralDeviation: number; // 0 - 100
  indicatorB_permissionViolations: number; // 0 - 100
  indicatorC_communicationAnomaly: number; // 0 - 100
  indicatorD_propagationRisk: number; // 0 - 100
  indicatorE_repeatedPolicyFailures: number; // 0 - 100
  indicatorF_runawayDelegation: number; // 0 - 100
  indicatorG_dataAccessAnomaly: number; // 0 - 100
  indicatorH_crossAgentCoordination: number; // 0 - 100
}

export interface BehaviorGuardWeights {
  weightA: number;
  weightB: number;
  weightC: number;
  weightD: number;
  weightE: number;
  weightF: number;
  weightG: number;
  weightH: number;
}

export interface RiskThresholds {
  low: number; // default < 30
  elevated: number; // default 30-55
  high: number; // default 56-80
  critical: number; // default > 80
}

export interface CausalAgentRelationship {
  sourceAgent: string;
  targetAgent: string;
  timeLag: number; // steps (1 - 5)
  observedEvidence: string;
  statisticalTest: string;
  fStatistic: number;
  pValueRaw: number;
  pValueFdrCorrected: number;
  confidence: number;
  isCandidate: boolean;
  isVerified: boolean;
  alternativeExplanations: string[];
}

export interface AgentIntervention {
  id: string;
  key: string;
  name: string;
  doCalculus: string; // P(Y | do(X = x))
  description: string;
  actionSummary: string;
  riskReduction: number; // percentage (0 - 100%)
  remainingSuspiciousPaths: number;
  affectedAgentsCount: number;
  isolatedAgentsCount: number;
  operationalDisruption: number; // percentage (0 - 100%) - X axis on Pareto
  residualRisk: number; // percentage (0 - 100%) - Y axis on Pareto
  estimatedContainmentTimeSec: number;
  remainingViolations: number;
  criticalWorkflowAvailability: number; // percentage (0 - 100%)
  recoveryRequirements: string;
  isParetoOptimal: boolean;
  recommendedFor: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  shortTitle: string;
  description: string;
  expectedDetection: string;
  actualSimulatedDetection: string;
  resultExplanation: string;
  primaryAgentId: string;
  compromisedAgentIds: string[];
  suspiciousAgentIds: string[];
  severity: SeverityLevel;
  simulatedSteps: {
    stepIndex: number;
    title: string;
    description: string;
    sourceAgent: string;
    targetAgent: string;
    action: string;
    isViolation: boolean;
    blastRadius: number;
  }[];
}

export interface HumanApprovalRequest {
  requestId: string;
  requestingAgent: string;
  requestedAction: string;
  securityReason: string;
  riskScore: number;
  evidence: string;
  potentialImpact: string;
  alternativeInterventions: string[];
  recommendedAction: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface AutomatedResponseRule {
  ruleId: string;
  name: string;
  triggerCondition: string;
  action: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  description: string;
}

export interface AgentIncident {
  incidentId: string;
  detectionTime: string;
  suspectedAgent: string;
  suspectedAgentName: string;
  relatedAgents: string[];
  initialEvent: string;
  category: EventCategory;
  severity: SeverityLevel;
  communicationHistorySnippet: string;
  candidateCausalRelationships: string[];
  propagationAnalysis: {
    reachableCount: number;
    blastRadiusScore: number;
    criticalAssetsAtRisk: string[];
  };
  appliedInterventionId: string;
  counterfactualAlternativeIds: string[];
  finalSimulatedOutcome: string;
  analystNotes: string;
  recoveryStatus: 'uncontained' | 'contained' | 'investigating' | 'recovered';
}

export interface SecurityAuditLogEntry {
  auditId: string;
  timestamp: string;
  actor: string;
  eventType: 
    | 'policy_decision'
    | 'permission_change'
    | 'security_alert'
    | 'intervention_applied'
    | 'agent_isolated'
    | 'agent_restricted'
    | 'human_approval'
    | 'recovery_action'
    | 'config_change';
  target: string;
  outcome: 'success' | 'blocked' | 'escalated' | 'modified';
  explanation: string;
  relatedIncidentId?: string;
  metadata?: Record<string, any>;
}

export interface SystemSettings {
  simulationSpeed: number;
  autoContainmentEnabled: boolean;
  strictTenantIsolation: boolean;
  defaultAlarmThreshold: number;
  enablePayloadAstSanitization: boolean;
  requireHumanApprovalForRootTools: boolean;
  telemetrySamplingRateHz: number;
}

