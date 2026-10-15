export type DataCategory = 
  | 'A' // Paper-Reported Results
  | 'B' // Synthetic Interactive Simulation
  | 'C' // Independently Reproduced Results
  | 'D'; // Real Dataset Evaluation

export type DisplayMode = 'paper' | 'simulation';

export type GraphViewMode = 'telemetry' | 'correlation' | 'causal';

export type NetworkZone = 'external' | 'perimeter' | 'dmz' | 'corporate' | 'ot' | 'core';

export type NodeStatus = 'benign' | 'recon' | 'compromised' | 'isolated' | 'protected';

export interface NetworkNode {
  id: string;
  name: string;
  zone: NetworkZone;
  ip: string;
  role: string;
  trust: number;
  inDegree: number;
  outDegree: number;
  riskScore: number;
  status: NodeStatus;
  attackStage: number;
  telemetryConfidence: number;
  incomingVolume: number;
  outgoingVolume: number;
  affectedServices: string[];
  x: number;
  y: number;
}

export type InterventionLinkStatus = 'normal' | 'throttled' | 'severed';

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  proto: string;
  trafficVolume: number;
  packetCount: number;
  flowDuration: number;
  edgeWeight: number;
  edgeWeightConcentration: number; // S_1(v, t)
  edgeEntropy: number; // H(v, t)
  timestamp: string;
  anomalyScore: number;
  correlationStatus: 'none' | 'moderate' | 'strong';
  causalStatus: 'none' | 'candidate' | 'verified';
  interventionStatus: InterventionLinkStatus;
  pValGranger?: number;
  isUnderAttack?: boolean;
}

export interface AttackStage {
  step: number;
  name: string;
  subtitle: string;
  description: string;
  technicalMechanism: string;
  activeAgents: {
    id: string;
    name: string;
    role: string;
    action: string;
  }[];
  compromisedNodes: string[];
  suspiciousNodes: string[];
  highVolumeEdges: string[];
  metrics: {
    affectedHosts: number;
    totalVolume: number;
    avgRiskScore: number;
    top1Concentration: number;
    edgeEntropy: number;
  };
}

export interface InterventionPolicy {
  id: string;
  key: string;
  name: string;
  doCalculus: string;
  description: string;
  rationale: string;
  isolatedNodes: string[];
  throttledEdges: string[];
  severedEdges: string[];
  paperReported: {
    asr: number;
    affectedHosts: number;
    ttc: number;
    sdr: number;
    asrRelReduction?: number;
    asrAbsReduction?: number;
    unfavorableNote?: string;
  };
  simulationSample: {
    asr: number;
    affectedHosts: number;
    ttc: number;
    sdr: number;
  };
}

export interface ForecastingModelRecord {
  model: string;
  isProposed?: boolean;
  precision: { h1: number; h3: number; h5: number };
  recall: { h1: number; h3: number; h5: number };
  f1: { h1: number; h3: number; h5: number };
  degradationDelta: number;
}

export interface AblationRecord {
  configuration: string;
  isFull?: boolean;
  f1: number;
  precision: number;
  recall: number;
  asrDrop: number;
  falseAlarmRate: number;
  deltaF1: number;
  notes: string;
}

export interface NatSensitivityRecord {
  k: number;
  label: string;
  nodeDegreeAuc: number;
  edgeWeightAuc: number;
  causalDiscoveryAuc: number;
  state: string;
  isIntermediate?: boolean;
}

export interface ReferenceRecord {
  id: number;
  authors: string;
  title: string;
  venue: string;
  year: number;
  volume?: string;
  issue?: string;
  artNo?: string;
  pages?: string;
  doi?: string;
  keyContribution: string;
}

export interface VarPairTestResult {
  u: string;
  v: string;
  uName: string;
  vName: string;
  lag: number;
  fStat: number;
  pValue: number;
  critValue: number;
  rank: number;
  isCausal: boolean;
  interpretation: string;
}
