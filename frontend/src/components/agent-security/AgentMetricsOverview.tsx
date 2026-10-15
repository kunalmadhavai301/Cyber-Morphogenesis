import React from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  RotateCcw, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Radio, 
  FileCheck2,
  Lock,
  Workflow
} from 'lucide-react';

export const AgentMetricsOverview: React.FC = () => {
  const { agents, events, approvalRequests, incidents, resetSimulation } = useAgentSecurity();

  const totalAgents = agents.length;
  const healthyCount = agents.filter(a => a.currentStatus === 'healthy').length;
  const observingCount = agents.filter(a => a.currentStatus === 'observing').length;
  const suspiciousCount = agents.filter(a => a.currentStatus === 'suspicious').length;
  const restrictedCount = agents.filter(a => a.currentStatus === 'restricted').length;
  const isolatedCount = agents.filter(a => a.currentStatus === 'isolated').length;

  const totalViolations = agents.reduce((acc, a) => acc + a.policyViolationCount, 0);
  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;
  const blockedRequestsCount = events.filter(e => e.policyDecision === 'denied').length;
  const suspiciousLinksCount = 2; // conn-code-tool, conn-res-ana
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;

  // Maximum blast radius across non-healthy agents
  const maxBlastRadius = Math.max(
    ...agents.filter(a => a.currentStatus !== 'healthy').map(a => a.downstreamDependencies.length),
    0
  );

  return (
    <div className="space-y-4">
      {/* Research Positioning & Provenance Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-cyan-950/40 border border-cyan-500/30 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Category B: Synthetic Simulation
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                10 Simulated Agents • Zero-Trust Policy Gateway
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              AI Agent Security: Causal Monitoring & Counterfactual Containment
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Cyber Morphogenesis investigates how causal discovery and counterfactual defense can support security in dynamic, 
              interconnected systems. Its AI-agent security extension models agent interactions as a temporal communication graph, 
              analyzes suspicious coordination, estimates potential behavioral propagation, and evaluates containment strategies 
              while accounting for operational disruption.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-all shadow-sm"
              title="Reset all agent states, scenario steps, and telemetry to initial baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Simulation</span>
            </button>
          </div>
        </div>

        {/* 5 Scientific Principles Callout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-3 mt-3 border-t border-zinc-800/80 text-[11px]">
          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800">
            <span className="text-cyan-400 font-bold block uppercase tracking-wider">Beyond Detection</span>
            <span className="text-zinc-400">Traces multi-agent infection spread rather than isolated alerts.</span>
          </div>
          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800">
            <span className="text-cyan-400 font-bold block uppercase tracking-wider">Beyond Correlation</span>
            <span className="text-zinc-400">Tests Granger causality with Benjamini-Hochberg FDR control.</span>
          </div>
          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800">
            <span className="text-cyan-400 font-bold block uppercase tracking-wider">Beyond Static Defense</span>
            <span className="text-zinc-400">Adapts interventions continuously as behavioral dynamics shift.</span>
          </div>
          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800">
            <span className="text-cyan-400 font-bold block uppercase tracking-wider">Beyond Black-Box</span>
            <span className="text-zinc-400">Explains trade-offs via Pearl's <span className="font-mono text-cyan-300">do</span>-calculus and Pareto curves.</span>
          </div>
          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800 col-span-2 sm:col-span-1">
            <span className="text-cyan-400 font-bold block uppercase tracking-wider">Independent Layer</span>
            <span className="text-zinc-400">Enforcement boundary cannot be overridden by monitored agents.</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Fleet Status</span>
            <Workflow className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white">{totalAgents}</span>
            <span className="text-[11px] text-zinc-400">Total Agents</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {healthyCount} Healthy • {observingCount} Observing
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Suspicious & Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-400">{suspiciousCount}</span>
            <span className="text-[11px] text-zinc-400">Agents</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            Behavior Guard alerts active
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Contained / Isolated</span>
            <ShieldX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-rose-400">{restrictedCount + isolatedCount}</span>
            <span className="text-[11px] text-zinc-400">Contained</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            {restrictedCount} Restricted • {isolatedCount} Isolated
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Policy Violations</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-cyan-400">{totalViolations}</span>
            <span className="text-[11px] text-zinc-400">Intercepted</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            {blockedRequestsCount} Gateway Denials
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Est. Blast Radius</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-rose-300">{maxBlastRadius}</span>
            <span className="text-[11px] text-zinc-400">Downstream Nodes</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            {suspiciousLinksCount} Suspicious Channels
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Human Approvals</span>
            <FileCheck2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-purple-300">{pendingApprovalsCount}</span>
            <span className="text-[11px] text-zinc-400">Pending Review</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            {criticalIncidentsCount} Open Incidents
          </div>
        </div>
      </div>
    </div>
  );
};
