import React from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { AgentPermissionProfile } from '../../types/agentSecurity';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowDownRight,
  ArrowUpLeft,
  Wrench,
  Database,
  Radio,
  FileCode,
  Terminal,
  Cpu
} from 'lucide-react';

export const AgentInspector: React.FC = () => {
  const { 
    selectedAgent, 
    upstreamAgents, 
    downstreamAgents, 
    toggleAgentPermission,
    isolateAgent,
    restrictAgent,
    quarantineAgent,
    recoverAgent,
    getRiskClassification
  } = useAgentSecurity();

  if (!selectedAgent) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
        <p className="text-sm">Select an agent node on the graph to inspect its telemetry, permissions, and dependencies.</p>
      </div>
    );
  }

  const riskClass = getRiskClassification(selectedAgent.riskScore);
  const riskPercent = Math.round(selectedAgent.riskScore * 100);

  const getRiskBadge = () => {
    switch (riskClass) {
      case 'low': return 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50';
      case 'elevated': return 'bg-blue-950/80 text-blue-400 border-blue-600/50';
      case 'high': return 'bg-amber-950/80 text-amber-400 border-amber-600/50';
      case 'critical': return 'bg-rose-950/80 text-rose-400 border-rose-600/50';
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              {selectedAgent.name}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
              {selectedAgent.id}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{selectedAgent.roleDescription}</p>
        </div>

        <div className="text-right">
          <div className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${getRiskBadge()}`}>
            {riskClass} Risk: {riskPercent}%
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Status: <strong className="text-zinc-200 uppercase">{selectedAgent.currentStatus}</strong>
          </div>
        </div>
      </div>

      {/* Telemetry & Trust Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Trust Level</span>
          <span className="text-base font-bold font-mono text-emerald-400">{selectedAgent.trustLevel}/100</span>
          <div className="w-full bg-zinc-800 h-1 rounded mt-1 overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${selectedAgent.trustLevel}%` }} />
          </div>
        </div>

        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Anomaly Score</span>
          <span className="text-base font-bold font-mono text-amber-400">{(selectedAgent.anomalyScore * 100).toFixed(1)}%</span>
          <div className="w-full bg-zinc-800 h-1 rounded mt-1 overflow-hidden">
            <div className="bg-amber-400 h-full" style={{ width: `${selectedAgent.anomalyScore * 100}%` }} />
          </div>
        </div>

        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Messages In / Out</span>
          <span className="text-base font-bold font-mono text-cyan-300">{selectedAgent.incomingMessages} / {selectedAgent.outgoingMessages}</span>
          <span className="text-[10px] text-zinc-400 block">Total: {selectedAgent.communicationCount}</span>
        </div>

        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Policy Violations</span>
          <span className="text-base font-bold font-mono text-rose-400">{selectedAgent.policyViolationCount}</span>
          <span className="text-[10px] text-zinc-400 block">Containment: {selectedAgent.containmentStatus}</span>
        </div>
      </div>

      {/* Active Task & Activity */}
      <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 text-xs">
        <div className="text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Active Task: <strong className="text-zinc-200">{selectedAgent.activeTask || 'Idle'}</strong></span>
          <span className="text-[10px] text-zinc-400 font-mono">{selectedAgent.lastActivity}</span>
        </div>
      </div>

      {/* Upstream & Downstream Dependencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Upstream */}
        <div className="bg-zinc-950/50 p-3 rounded-lg border border-cyan-900/30">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-2">
            <ArrowUpLeft className="w-4 h-4" />
            <span>Upstream Causal Influences ({upstreamAgents.length})</span>
          </div>
          {upstreamAgents.length === 0 ? (
            <p className="text-[11px] text-zinc-400 italic">Root workflow initiator; no upstream agent influences.</p>
          ) : (
            <div className="space-y-1">
              {upstreamAgents.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-zinc-900/60 px-2 py-1 rounded text-[11px]">
                  <span className="font-mono text-zinc-200">{a.name}</span>
                  <span className="text-zinc-400 font-mono">{a.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Downstream Blast Radius */}
        <div className="bg-zinc-950/50 p-3 rounded-lg border border-rose-900/30">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-2">
            <ArrowDownRight className="w-4 h-4" />
            <span>Downstream Blast Radius ({downstreamAgents.length} Agents)</span>
          </div>
          {downstreamAgents.length === 0 ? (
            <p className="text-[11px] text-zinc-400 italic">Leaf terminal agent; zero downstream dependencies.</p>
          ) : (
            <div className="space-y-1">
              {downstreamAgents.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-zinc-900/60 px-2 py-1 rounded text-[11px]">
                  <span className="font-mono text-zinc-200">{a.name}</span>
                  <span className="text-rose-400 font-mono">{a.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zero-Trust Permission Editor */}
      <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            Zero-Trust Capability Profile (Least Privilege Enforcement)
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">Interactive Toggle</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          {[
            { key: 'canReadDocuments' as keyof AgentPermissionProfile, label: 'Read Documents' },
            { key: 'canReadDatasets' as keyof AgentPermissionProfile, label: 'Read Datasets' },
            { key: 'canRequestTools' as keyof AgentPermissionProfile, label: 'Request Tools' },
            { key: 'canExecuteWorkflowSteps' as keyof AgentPermissionProfile, label: 'Execute Steps' },
            { key: 'canWriteOutput' as keyof AgentPermissionProfile, label: 'Write Outputs' },
            { key: 'canAccessExternalAPI' as keyof AgentPermissionProfile, label: 'Access Ext. API' },
          ].map(perm => {
            const isGranted = Boolean(selectedAgent.permissionProfile[perm.key]);
            return (
              <button
                key={perm.key}
                onClick={() => toggleAgentPermission(selectedAgent.id, perm.key)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition-all text-left ${
                  isGranted 
                    ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 line-through'
                }`}
              >
                <span>{perm.label}</span>
                {isGranted ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : <XCircle className="w-3 h-3 text-zinc-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Allowed tools & data scopes */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap gap-2 text-[10px]">
          <span className="text-zinc-400">Allowed Tools:</span>
          {selectedAgent.allowedTools.length === 0 ? (
            <span className="text-zinc-400 italic">None (pure LLM reasoning)</span>
          ) : (
            selectedAgent.allowedTools.map(tool => (
              <span key={tool} className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono border border-zinc-700">
                {tool}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Manual Containment Action Triggers */}
      <div className="pt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-400 font-medium">Independent Containment:</span>
        <button
          onClick={() => isolateAgent(selectedAgent.id)}
          className="px-3 py-1.5 rounded-md bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Isolate Agent</span>
        </button>
        <button
          onClick={() => restrictAgent(selectedAgent.id)}
          className="px-3 py-1.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/60 text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Restrict Tools</span>
        </button>
        <button
          onClick={() => quarantineAgent(selectedAgent.id)}
          className="px-3 py-1.5 rounded-md bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/60 text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Quarantine & Freeze</span>
        </button>
        <button
          onClick={() => recoverAgent(selectedAgent.id)}
          className="px-3 py-1.5 rounded-md bg-violet-950/80 hover:bg-violet-900 text-violet-200 border border-violet-700/60 text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
          <span>Recover & Reinstate</span>
        </button>
      </div>
    </div>
  );
};
