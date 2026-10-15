import React from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { AgentBehaviorGuardPanel } from '../components/agent-security/AgentBehaviorGuardPanel';
import { AgentEventMonitor } from '../components/agent-security/AgentEventMonitor';
import { 
  Activity, 
  ShieldAlert, 
  Sliders, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  RefreshCw,
  Info,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

export const MonitoringPage: React.FC = () => {
  const { 
    agents, 
    events, 
    behaviorWeights, 
    setBehaviorWeights, 
    riskThresholds, 
    setRiskThresholds, 
    calculateAgentRiskScore,
    getRiskClassification,
    resetSimulation
  } = useAgentSecurity();

  // 12 Detection Categories metadata
  const detectionCategories = [
    { id: 'cat-1', name: 'Unexpected Inter-Agent Communication', count: 18, risk: 'elevated' },
    { id: 'cat-2', name: 'Repeated Policy Gateway Denials', count: 14, risk: 'high' },
    { id: 'cat-3', name: 'Anomalous Message Burst Frequency', count: 26, risk: 'elevated' },
    { id: 'cat-4', name: 'Unauthorized Tool Invocation Attempts', count: 11, risk: 'critical' },
    { id: 'cat-5', name: 'Out-of-Profile Permission Escalation', count: 7, risk: 'critical' },
    { id: 'cat-6', name: 'Suspicious Instruction & Context Propagation', count: 9, risk: 'high' },
    { id: 'cat-7', name: 'Attempted Human Approval Bypass', count: 4, risk: 'critical' },
    { id: 'cat-8', name: 'Unusual Dataset / Memory Store Access', count: 15, risk: 'elevated' },
    { id: 'cat-9', name: 'Repeated Downstream Task Execution Failures', count: 8, risk: 'elevated' },
    { id: 'cat-10', name: 'Runaway Agent Delegation Loops', count: 5, risk: 'high' },
    { id: 'cat-11', name: 'Conflicting or Mutated Workflow Instructions', count: 6, risk: 'high' },
    { id: 'cat-12', name: 'Unapproved External Socket / API Calls', count: 3, risk: 'critical' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Agent Behavior Guard & Anomaly Telemetry
              </h1>
              <p className="text-xs text-zinc-400">
                Continuous statistical and causal telemetry scoring across 12 behavioral anomaly categories and 8 indicators.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => resetSimulation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset Weights & Telemetry</span>
          </button>
        </div>
      </div>

      {/* 12 Detection Categories Overview Grid */}
      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-200">12 Monitored Behavioral Anomaly Categories</h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Real-time Interception Filters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {detectionCategories.map(cat => (
            <div key={cat.id} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className={`w-2 h-2 rounded-full ${
                  cat.risk === 'critical' ? 'bg-rose-500' :
                  cat.risk === 'high' ? 'bg-amber-500' : 'bg-cyan-500'
                }`} />
                <span className="text-[10px] font-mono text-zinc-400">{cat.count} alerts</span>
              </div>
              <div className="text-[11px] text-zinc-300 font-medium leading-snug line-clamp-2">
                {cat.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8 Behavior Indicators with Weight Sliders & Live Re-computation */}
      <AgentBehaviorGuardPanel />

      {/* Live Event Stream with Filter Drawer */}
      <AgentEventMonitor />
    </div>
  );
};
