import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { 
  AIAgent, 
  AgentConnection, 
  AgentCommunicationEvent, 
  AgentIntervention, 
  SimulationScenario, 
  HumanApprovalRequest, 
  AutomatedResponseRule, 
  AgentIncident,
  BehaviorGuardWeights,
  RiskThresholds,
  AgentState,
  AgentPermissionProfile,
  SecurityAuditLogEntry,
  SystemSettings
} from '../types/agentSecurity';
import { 
  INITIAL_AI_AGENTS, 
  INITIAL_AGENT_CONNECTIONS, 
  INITIAL_AGENT_EVENTS, 
  DEFAULT_BEHAVIOR_GUARD_WEIGHTS, 
  DEFAULT_RISK_THRESHOLDS,
  AGENT_DEFENSE_INTERVENTIONS,
  SIMULATION_SCENARIOS,
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_AUTOMATED_RULES,
  INITIAL_AGENT_INCIDENTS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_SYSTEM_SETTINGS
} from '../data/agentSecurityData';

interface AgentSecurityContextType {
  // Navigation & Routing
  currentPath: string;
  navigate: (path: string) => void;

  // Agents and Network
  agents: AIAgent[];
  connections: AgentConnection[];
  selectedAgent: AIAgent | null;
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  selectedEdge: AgentConnection | null;
  selectedEdgeId: string | null;
  setSelectedEdgeId: (id: string | null) => void;
  upstreamAgents: AIAgent[];
  downstreamAgents: AIAgent[];
  createAgent: (agent: Partial<AIAgent>) => void;
  updateAgent: (id: string, updates: Partial<AIAgent>) => void;
  removeAgent: (id: string) => void;
  
  // Events and Monitoring
  events: AgentCommunicationEvent[];
  selectedEvent: AgentCommunicationEvent | null;
  setSelectedEvent: (event: AgentCommunicationEvent | null) => void;
  severityFilter: string;
  setSeverityFilter: (s: string) => void;
  agentFilter: string;
  setAgentFilter: (a: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  policyFilter: string;
  setPolicyFilter: (p: string) => void;
  eventSearchQuery: string;
  setEventSearchQuery: (q: string) => void;

  // Behavior Guard & Risk
  behaviorWeights: BehaviorGuardWeights;
  setBehaviorWeights: React.Dispatch<React.SetStateAction<BehaviorGuardWeights>>;
  riskThresholds: RiskThresholds;
  setRiskThresholds: React.Dispatch<React.SetStateAction<RiskThresholds>>;
  calculateAgentRiskScore: (agent: AIAgent) => number;
  getRiskClassification: (score: number) => 'low' | 'elevated' | 'high' | 'critical';

  // Scenario Simulator
  activeScenario: SimulationScenario;
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
  scenarioStep: number;
  isScenarioRunning: boolean;
  startScenario: () => void;
  pauseScenario: () => void;
  resumeScenario: () => void;
  stepForward: () => void;
  restartScenario: () => void;
  allScenarios: SimulationScenario[];

  // Counterfactual Defense
  activeIntervention: AgentIntervention;
  activeInterventionId: string;
  setActiveInterventionId: (id: string) => void;
  comparisonIntervention: AgentIntervention;
  comparisonInterventionId: string;
  setComparisonInterventionId: (id: string) => void;
  allInterventions: AgentIntervention[];

  // Zero-Trust & Permissions
  toggleAgentPermission: (agentId: string, capability: keyof AgentPermissionProfile) => void;
  isolateAgent: (agentId: string) => void;
  restrictAgent: (agentId: string) => void;
  quarantineAgent: (agentId: string) => void;
  recoverAgent: (agentId: string) => void;

  // Human Approval & Policies
  approvalRequests: HumanApprovalRequest[];
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  simulateApproval: (requestId: string) => void;
  automatedRules: AutomatedResponseRule[];
  toggleRule: (ruleId: string) => void;
  updateRuleThreshold: (ruleId: string, threshold: number) => void;

  // Incidents
  incidents: AgentIncident[];
  selectedIncident: AgentIncident | null;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  updateAnalystNotes: (incidentId: string, notes: string) => void;

  // Audit Logs
  auditLogs: SecurityAuditLogEntry[];
  addAuditLog: (entry: Omit<SecurityAuditLogEntry, 'auditId' | 'timestamp'>) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // General Simulation
  resetSimulation: () => void;
}

const AgentSecurityContext = createContext<AgentSecurityContextType | undefined>(undefined);

export const AgentSecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation Router
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      return pathname === '' || pathname === '/' ? '/' : pathname;
    }
    return '/';
  });

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Agents & Connections
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AI_AGENTS);
  const [connections, setConnections] = useState<AgentConnection[]>(INITIAL_AGENT_CONNECTIONS);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('code-01');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AgentCommunicationEvent | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [policyFilter, setPolicyFilter] = useState<string>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');

  // Behavior Guard & Risk
  const [behaviorWeights, setBehaviorWeights] = useState<BehaviorGuardWeights>(DEFAULT_BEHAVIOR_GUARD_WEIGHTS);
  const [riskThresholds, setRiskThresholds] = useState<RiskThresholds>(DEFAULT_RISK_THRESHOLDS);

  // Scenario Simulator
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen-02');
  const [scenarioStep, setScenarioStep] = useState<number>(2);
  const [isScenarioRunning, setIsScenarioRunning] = useState<boolean>(false);

  // Counterfactual Interventions
  const [activeInterventionId, setActiveInterventionId] = useState<string>('int-10');
  const [comparisonInterventionId, setComparisonInterventionId] = useState<string>('int-06');

  // Governance & Approvals
  const [approvalRequests, setApprovalRequests] = useState<HumanApprovalRequest[]>(INITIAL_APPROVAL_REQUESTS);
  const [automatedRules, setAutomatedRules] = useState<AutomatedResponseRule[]>(INITIAL_AUTOMATED_RULES);
  const [events, setEvents] = useState<AgentCommunicationEvent[]>(INITIAL_AGENT_EVENTS);
  const [incidents, setIncidents] = useState<AgentIncident[]>(INITIAL_AGENT_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-2026-0042');
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);

  const allScenarios = SIMULATION_SCENARIOS;
  const activeScenario = useMemo(() => {
    return allScenarios.find(s => s.id === activeScenarioId) || allScenarios[0];
  }, [allScenarios, activeScenarioId]);

  const allInterventions = AGENT_DEFENSE_INTERVENTIONS;
  const activeIntervention = useMemo(() => {
    return allInterventions.find(i => i.id === activeInterventionId) || allInterventions[9];
  }, [allInterventions, activeInterventionId]);

  const comparisonIntervention = useMemo(() => {
    return allInterventions.find(i => i.id === comparisonInterventionId) || allInterventions[5];
  }, [allInterventions, comparisonInterventionId]);

  // Selected Agent Object
  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    return agents.find(a => a.id === selectedAgentId) || null;
  }, [agents, selectedAgentId]);

  // Selected Edge Object
  const selectedEdge = useMemo(() => {
    if (!selectedEdgeId) return null;
    return connections.find(c => c.id === selectedEdgeId) || null;
  }, [connections, selectedEdgeId]);

  // Upstream & Downstream Dependencies of Selected Agent
  const upstreamAgents = useMemo(() => {
    if (!selectedAgent) return [];
    return agents.filter(a => selectedAgent.upstreamDependencies.includes(a.id));
  }, [agents, selectedAgent]);

  const downstreamAgents = useMemo(() => {
    if (!selectedAgent) return [];
    return agents.filter(a => selectedAgent.downstreamDependencies.includes(a.id));
  }, [agents, selectedAgent]);

  // Dynamic Risk Calculation
  const calculateAgentRiskScore = (agent: AIAgent): number => {
    const dev = agent.anomalyScore * 100;
    const perm = agent.policyViolationCount * 25;
    const comm = agent.incomingMessages > 80 ? 60 : 20;
    const prop = agent.downstreamDependencies.length * 12;
    const fail = agent.policyViolationCount > 1 ? 75 : 10;
    const loop = agent.id === 'res-01' && activeScenarioId === 'scen-03' ? 85 : 10;
    const data = agent.id === 'data-01' && activeScenarioId === 'scen-07' ? 80 : 15;
    const coord = (agent.id === 'code-01' || agent.id === 'tool-01') && activeScenarioId === 'scen-05' ? 90 : 20;

    const composite = (
      dev * behaviorWeights.weightA +
      perm * behaviorWeights.weightB +
      comm * behaviorWeights.weightC +
      prop * behaviorWeights.weightD +
      fail * behaviorWeights.weightE +
      loop * behaviorWeights.weightF +
      data * behaviorWeights.weightG +
      coord * behaviorWeights.weightH
    ) / 100;

    return Number(Math.min(0.99, Math.max(0.02, composite)).toFixed(2));
  };

  const getRiskClassification = (score: number): 'low' | 'elevated' | 'high' | 'critical' => {
    const s = score * 100;
    if (s < riskThresholds.low) return 'low';
    if (s < riskThresholds.elevated) return 'elevated';
    if (s < riskThresholds.high) return 'high';
    return 'critical';
  };

  // Scenario playback timer
  useEffect(() => {
    if (!isScenarioRunning) return;
    const intervalTime = Math.max(800, 2500 / settings.simulationSpeed);
    const interval = setInterval(() => {
      setScenarioStep(prev => {
        if (prev >= activeScenario.simulatedSteps.length - 1) {
          setIsScenarioRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);
    return () => clearInterval(interval);
  }, [isScenarioRunning, activeScenario, settings.simulationSpeed]);

  // Audit Logger Helper
  const addAuditLog = (entry: Omit<SecurityAuditLogEntry, 'auditId' | 'timestamp'>) => {
    const newLog: SecurityAuditLogEntry = {
      ...entry,
      auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Apply scenario step modifications to agents
  useEffect(() => {
    setAgents(prev => {
      return prev.map(agent => {
        let currentStatus: AgentState = 'healthy';
        let containmentStatus: AIAgent['containmentStatus'] = 'uncontained';
        let riskScore = agent.riskScore;

        if (activeScenario.compromisedAgentIds.includes(agent.id) && scenarioStep > 0) {
          currentStatus = 'suspicious';
          containmentStatus = 'monitored';
          riskScore = 0.82;
        } else if (activeScenario.suspiciousAgentIds.includes(agent.id) && scenarioStep > 1) {
          currentStatus = 'observing';
          containmentStatus = 'monitored';
          riskScore = 0.52;
        } else if (activeScenario.id === 'scen-06') {
          currentStatus = agent.id === 'data-01' || agent.id === 'ana-01' ? 'observing' : 'healthy';
          containmentStatus = 'uncontained';
          riskScore = 0.22;
        }

        // Apply active defensive policy
        if (activeIntervention.key === 'isolate_agent' && agent.id === activeScenario.primaryAgentId) {
          currentStatus = 'isolated';
          containmentStatus = 'isolated';
          riskScore = Math.max(0.15, riskScore - 0.5);
        } else if (activeIntervention.key === 'restrict_tools' && agent.id === activeScenario.primaryAgentId) {
          currentStatus = 'restricted';
          containmentStatus = 'throttled';
          riskScore = Math.max(0.25, riskScore - 0.35);
        } else if (activeIntervention.key === 'joint_defense' && activeScenario.compromisedAgentIds.includes(agent.id)) {
          currentStatus = 'restricted';
          containmentStatus = 'monitored';
          riskScore = 0.20;
        }

        return {
          ...agent,
          currentStatus,
          containmentStatus,
          riskScore: Number(riskScore.toFixed(2))
        };
      });
    });

    // Update connections
    setConnections(prev => {
      return prev.map(conn => {
        let status = conn.status;
        let isSuspicious = conn.isSuspicious;

        if (activeIntervention.key === 'isolate_agent' && (conn.source === activeScenario.primaryAgentId || conn.target === activeScenario.primaryAgentId)) {
          status = 'blocked';
        } else if (activeIntervention.key === 'rate_limit' && conn.source === activeScenario.primaryAgentId) {
          status = 'throttled';
        } else if (activeIntervention.key === 'joint_defense' && conn.id === 'conn-code-tool') {
          status = 'throttled';
        } else {
          status = 'active';
        }

        return {
          ...conn,
          status,
          isSuspicious
        };
      });
    });
  }, [scenarioStep, activeScenario, activeIntervention]);

  // Scenario Controls
  const startScenario = () => {
    setScenarioStep(0);
    setIsScenarioRunning(true);
    addAuditLog({
      actor: 'Simulation Engine',
      eventType: 'config_change',
      target: activeScenario.id,
      outcome: 'success',
      explanation: `Started scenario: ${activeScenario.name}`
    });
  };

  const pauseScenario = () => setIsScenarioRunning(false);
  const resumeScenario = () => setIsScenarioRunning(true);
  const stepForward = () => setScenarioStep(prev => Math.min(activeScenario.simulatedSteps.length - 1, prev + 1));
  const restartScenario = () => {
    setScenarioStep(0);
    setIsScenarioRunning(true);
  };

  // Agent Management CRUD
  const createAgent = (newAgentData: Partial<AIAgent>) => {
    const id = newAgentData.id || `agent-${Date.now().toString().slice(-4)}`;
    const newAgent: AIAgent = {
      id,
      name: newAgentData.name || 'New Custom Agent',
      role: newAgentData.role || 'analysis',
      roleDescription: newAgentData.roleDescription || 'Custom agent node added to simulation fleet.',
      trustLevel: newAgentData.trustLevel ?? 90,
      riskScore: 0.15,
      currentStatus: 'healthy',
      healthStatus: 'optimal',
      permissionProfile: newAgentData.permissionProfile || {
        canReadDocuments: true,
        canReadDatasets: true,
        canSendMessagesTo: ['orch-01'],
        canRequestTools: false,
        allowedTools: [],
        canExecuteWorkflowSteps: false,
        canWriteOutput: true,
        canAccessExternalAPI: false,
        dataScopes: ['internal_tasks']
      },
      allowedTools: newAgentData.allowedTools || [],
      communicationCount: 12,
      incomingMessages: 6,
      outgoingMessages: 6,
      anomalyScore: 0.05,
      policyViolationCount: 0,
      lastActivity: 'Provisioned in agent registry',
      downstreamDependencies: [],
      upstreamDependencies: ['orch-01'],
      containmentStatus: 'uncontained',
      x: 350 + Math.random() * 200,
      y: 350 + Math.random() * 100,
      activeTask: 'Standing by for instructions'
    };

    setAgents(prev => [...prev, newAgent]);
    // Connect to Orchestrator by default
    setConnections(prev => [
      ...prev,
      {
        id: `conn-orch-${id}`,
        source: 'orch-01',
        target: id,
        channelType: 'delegation',
        messageFrequency: 10,
        status: 'active',
        isSuspicious: false,
        causalStrength: 0.85,
        isCandidateCausal: true,
        isVerifiedCausal: true
      }
    ]);

    addAuditLog({
      actor: 'Agent Identity Registry',
      eventType: 'permission_change',
      target: id,
      outcome: 'success',
      explanation: `Provisioned new agent ${newAgent.name} (${id}) with least-privilege role: ${newAgent.role}`
    });
  };

  const updateAgent = (id: string, updates: Partial<AIAgent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addAuditLog({
      actor: 'Agent Identity Registry',
      eventType: 'config_change',
      target: id,
      outcome: 'modified',
      explanation: `Updated configuration attributes for agent ${id}`
    });
  };

  const removeAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    setConnections(prev => prev.filter(c => c.source !== id && c.target !== id));
    if (selectedAgentId === id) setSelectedAgentId(null);
    addAuditLog({
      actor: 'Agent Identity Registry',
      eventType: 'config_change',
      target: id,
      outcome: 'success',
      explanation: `De-registered agent ${id} from security platform`
    });
  };

  // State Mutators
  const toggleAgentPermission = (agentId: string, capability: keyof AgentPermissionProfile) => {
    let newVal: any = false;
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a;
      const current = a.permissionProfile[capability];
      newVal = typeof current === 'boolean' ? !current : current;
      return {
        ...a,
        permissionProfile: {
          ...a.permissionProfile,
          [capability]: newVal
        }
      };
    }));

    addAuditLog({
      actor: 'Permission Manager',
      eventType: 'permission_change',
      target: agentId,
      outcome: 'modified',
      explanation: `Toggled permission '${capability}' to ${newVal} for agent ${agentId}`
    });
  };

  const isolateAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, currentStatus: 'isolated', containmentStatus: 'isolated' } : a));
    setConnections(prev => prev.map(c => (c.source === agentId || c.target === agentId) ? { ...c, status: 'blocked' } : c));
    addAuditLog({
      actor: 'Defensive Intervention Engine',
      eventType: 'agent_isolated',
      target: agentId,
      outcome: 'blocked',
      explanation: `Severed all ingress and egress channels for agent ${agentId}. Status: ISOLATED.`
    });
  };

  const restrictAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, currentStatus: 'restricted', containmentStatus: 'throttled' } : a));
    addAuditLog({
      actor: 'Defensive Intervention Engine',
      eventType: 'agent_restricted',
      target: agentId,
      outcome: 'modified',
      explanation: `Restricted tool capabilities and enabled strict AST output sanitization for ${agentId}.`
    });
  };

  const quarantineAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, currentStatus: 'suspicious', containmentStatus: 'quarantined' } : a));
    addAuditLog({
      actor: 'Defensive Intervention Engine',
      eventType: 'intervention_applied',
      target: agentId,
      outcome: 'escalated',
      explanation: `Quarantined agent ${agentId}; serialized memory context for forensic investigation.`
    });
  };

  const recoverAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, currentStatus: 'recovering', containmentStatus: 'monitored' } : a));
    setConnections(prev => prev.map(c => (c.source === agentId || c.target === agentId) ? { ...c, status: 'active' } : c));
    addAuditLog({
      actor: 'Recovery Manager',
      eventType: 'recovery_action',
      target: agentId,
      outcome: 'success',
      explanation: `Reinstated agent ${agentId} from containment. Re-initialized baseline context.`
    });
  };

  const approveRequest = (requestId: string) => {
    setApprovalRequests(prev => prev.map(r => r.requestId === requestId ? { ...r, status: 'approved' } : r));
    addAuditLog({
      actor: 'Human Approval Center',
      eventType: 'human_approval',
      target: requestId,
      outcome: 'success',
      explanation: `SOC Analyst authorized request ${requestId}`
    });
  };

  const rejectRequest = (requestId: string) => {
    setApprovalRequests(prev => prev.map(r => r.requestId === requestId ? { ...r, status: 'rejected' } : r));
    addAuditLog({
      actor: 'Human Approval Center',
      eventType: 'human_approval',
      target: requestId,
      outcome: 'blocked',
      explanation: `SOC Analyst rejected request ${requestId}`
    });
  };

  const simulateApproval = (requestId: string) => {
    alert(`[SIMULATION]: Evaluated in isolated container. Request ${requestId} passed AST verification without side-effects.`);
  };

  const toggleRule = (ruleId: string) => {
    setAutomatedRules(prev => prev.map(r => r.ruleId === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const updateRuleThreshold = (ruleId: string, threshold: number) => {
    setAutomatedRules(prev => prev.map(r => r.ruleId === ruleId ? { ...r, threshold } : r));
  };

  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId) return null;
    return incidents.find(i => i.incidentId === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);

  const updateAnalystNotes = (incidentId: string, notes: string) => {
    setIncidents(prev => prev.map(i => i.incidentId === incidentId ? { ...i, analystNotes: notes } : i));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog({
      actor: 'Settings Manager',
      eventType: 'config_change',
      target: 'system',
      outcome: 'modified',
      explanation: `Updated platform configuration settings`
    });
  };

  const resetSimulation = () => {
    setAgents(INITIAL_AI_AGENTS);
    setConnections(INITIAL_AGENT_CONNECTIONS);
    setSelectedAgentId('code-01');
    setSelectedEdgeId(null);
    setEvents(INITIAL_AGENT_EVENTS);
    setActiveScenarioId('scen-02');
    setScenarioStep(0);
    setIsScenarioRunning(false);
    setActiveInterventionId('int-10');
    setComparisonInterventionId('int-06');
    setApprovalRequests(INITIAL_APPROVAL_REQUESTS);
    setAutomatedRules(INITIAL_AUTOMATED_RULES);
    setIncidents(INITIAL_AGENT_INCIDENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(DEFAULT_SYSTEM_SETTINGS);
  };

  return (
    <AgentSecurityContext.Provider value={{
      currentPath,
      navigate,
      agents,
      connections,
      selectedAgent,
      selectedAgentId,
      setSelectedAgentId,
      selectedEdge,
      selectedEdgeId,
      setSelectedEdgeId,
      upstreamAgents,
      downstreamAgents,
      createAgent,
      updateAgent,
      removeAgent,
      events,
      selectedEvent,
      setSelectedEvent,
      severityFilter,
      setSeverityFilter,
      agentFilter,
      setAgentFilter,
      categoryFilter,
      setCategoryFilter,
      policyFilter,
      setPolicyFilter,
      eventSearchQuery,
      setEventSearchQuery,
      behaviorWeights,
      setBehaviorWeights,
      riskThresholds,
      setRiskThresholds,
      calculateAgentRiskScore,
      getRiskClassification,
      activeScenario,
      activeScenarioId,
      setActiveScenarioId,
      scenarioStep,
      isScenarioRunning,
      startScenario,
      pauseScenario,
      resumeScenario,
      stepForward,
      restartScenario,
      allScenarios,
      activeIntervention,
      activeInterventionId,
      setActiveInterventionId,
      comparisonIntervention,
      comparisonInterventionId,
      setComparisonInterventionId,
      allInterventions,
      toggleAgentPermission,
      isolateAgent,
      restrictAgent,
      quarantineAgent,
      recoverAgent,
      approvalRequests,
      approveRequest,
      rejectRequest,
      simulateApproval,
      automatedRules,
      toggleRule,
      updateRuleThreshold,
      incidents,
      selectedIncident,
      selectedIncidentId,
      setSelectedIncidentId,
      updateAnalystNotes,
      auditLogs,
      addAuditLog,
      settings,
      updateSettings,
      resetSimulation
    }}>
      {children}
    </AgentSecurityContext.Provider>
  );
};

export const useAgentSecurity = () => {
  const context = useContext(AgentSecurityContext);
  if (!context) {
    throw new Error('useAgentSecurity must be used within an AgentSecurityProvider');
  }
  return context;
};
