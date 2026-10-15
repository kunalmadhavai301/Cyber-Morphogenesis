import React, { useState } from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { AgentPropagationPanel } from '../components/agent-security/AgentPropagationPanel';
import { 
  Workflow, 
  Layers, 
  ShieldAlert, 
  ShieldCheck, 
  GitFork, 
  ArrowRight, 
  AlertTriangle, 
  Activity, 
  Lock,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const PropagationPage: React.FC = () => {
  const { 
    agents, 
    connections, 
    selectedAgentId, 
    setSelectedAgentId,
    calculateAgentRiskScore,
    getRiskClassification,
    navigate,
    resetSimulation
  } = useAgentSecurity();

  // Root agent for blast radius calculation
  const [rootAgentId, setRootAgentId] = useState<string>(selectedAgentId || 'code-01');

  const rootAgent = agents.find(a => a.id === rootAgentId) || agents[0];

  // Calculate 1-hop, 2-hop, 3-hop downstream blast radius
  const hop1Ids = connections
    .filter(c => c.source === rootAgent.id && c.status === 'active')
    .map(c => c.target);

  const hop2Ids = connections
    .filter(c => hop1Ids.includes(c.source) && c.status === 'active' && c.target !== rootAgent.id && !hop1Ids.includes(c.target))
    .map(c => c.target);

  const hop3Ids = connections
    .filter(c => hop2Ids.includes(c.source) && c.status === 'active' && c.target !== rootAgent.id && !hop1Ids.includes(c.target) && !hop2Ids.includes(c.target))
    .map(c => c.target);

  const totalReachableCount = hop1Ids.length + hop2Ids.length + hop3Ids.length;
  const blastRadiusRatio = ((totalReachableCount / Math.max(1, agents.length - 1)) * 100).toFixed(0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Multi-Agent Risk Propagation & Blast Radius Analysis
              </h1>
              <p className="text-xs text-zinc-400">
                Forecast dynamic compromise cascades, topological reachability, and severed causal containment paths.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/defense')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-colors shadow-glow-emerald"
          >
            <span>Apply Interventions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Root Node Selector & Reachability Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Origin Node Selector & Metrics */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Hypothetical Compromise Origin
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">do(X) Root</span>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Select Vulnerable / Compromised Agent:</label>
            <select
              value={rootAgent.id}
              onChange={(e) => {
                setRootAgentId(e.target.value);
                setSelectedAgentId(e.target.value);
              }}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id}) &mdash; {a.role}
                </option>
              ))}
            </select>
          </div>

          {/* Root Agent Stats */}
          <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Current Health:</span>
              <span className="font-mono text-emerald-400 font-bold uppercase">{rootAgent.currentStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Base Anomaly Score:</span>
              <span className="font-mono text-cyan-400 font-bold">{(rootAgent.anomalyScore * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Total Downstream Dependents:</span>
              <span className="font-mono text-purple-400 font-bold">{rootAgent.downstreamDependencies.length} Agents</span>
            </div>
          </div>

          {/* Blast Radius Score Dial */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-950/40 via-zinc-950 to-zinc-900 border border-purple-800/40 text-center space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-purple-300">
              Downstream Blast Radius Exposure
            </div>
            <div className="text-3xl font-bold font-mono text-purple-400">
              {blastRadiusRatio}%
            </div>
            <div className="text-[11px] text-zinc-400">
              {totalReachableCount} of {agents.length - 1} fleet agents reachable via unconstrained pathways
            </div>
          </div>
        </div>

        {/* Right: Multi-Hop Reachability Breakdown */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Topological Reachability Breakdown
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Directed Cascades</span>
          </div>

          <div className="space-y-3">
            {/* Hop 1 */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-cyan-400">1-Hop Direct Reachability (Immediate)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {hop1Ids.length} Agents
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hop1Ids.length === 0 ? (
                  <span className="text-zinc-500 italic text-[11px]">No active direct outgoing channels</span>
                ) : (
                  hop1Ids.map(id => {
                    const ag = agents.find(a => a.id === id);
                    return (
                      <span key={id} className="px-2 py-1 rounded bg-zinc-900 border border-cyan-800/40 text-cyan-300 font-mono text-[10px]">
                        {ag ? ag.name : id} ({id})
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Hop 2 */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-amber-400">2-Hop Transitive Reachability (Secondary)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {hop2Ids.length} Agents
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hop2Ids.length === 0 ? (
                  <span className="text-zinc-500 italic text-[11px]">No secondary cascading nodes</span>
                ) : (
                  hop2Ids.map(id => {
                    const ag = agents.find(a => a.id === id);
                    return (
                      <span key={id} className="px-2 py-1 rounded bg-zinc-900 border border-amber-800/40 text-amber-300 font-mono text-[10px]">
                        {ag ? ag.name : id} ({id})
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Hop 3 */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-purple-400">3-Hop Distant Propagation (Perimeter)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  {hop3Ids.length} Agents
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hop3Ids.length === 0 ? (
                  <span className="text-zinc-500 italic text-[11px]">Zero perimeter penetration paths</span>
                ) : (
                  hop3Ids.map(id => {
                    const ag = agents.find(a => a.id === id);
                    return (
                      <span key={id} className="px-2 py-1 rounded bg-zinc-900 border border-purple-800/40 text-purple-300 font-mono text-[10px]">
                        {ag ? ag.name : id} ({id})
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Propagation Panel with T0-T5 State Cascade */}
      <AgentPropagationPanel />
    </div>
  );
};
