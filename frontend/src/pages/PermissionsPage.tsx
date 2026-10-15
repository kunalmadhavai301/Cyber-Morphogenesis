import React from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { AgentZeroTrustManager } from '../components/agent-security/AgentZeroTrustManager';
import { 
  Lock, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  Cpu, 
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const PermissionsPage: React.FC = () => {
  const { 
    agents, 
    toggleAgentPermission,
    navigate,
    resetSimulation
  } = useAgentSecurity();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Agent Permissions & Zero-Trust Capability Matrix
              </h1>
              <p className="text-xs text-zinc-400">
                Granular capability entitlement boundaries, Policy Gateway simulation, and 10-layer defense architecture.
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
            <span>Reset Permissions</span>
          </button>
          <button
            onClick={() => navigate('/incidents')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <span>Incident Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zero Trust Capability Matrix, Gateway Simulator & 10-Component Architecture */}
      <AgentZeroTrustManager />
    </div>
  );
};
