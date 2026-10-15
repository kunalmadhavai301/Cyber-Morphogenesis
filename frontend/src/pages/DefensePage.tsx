import React from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { AgentCounterfactualLab } from '../components/agent-security/AgentCounterfactualLab';
import { 
  ShieldCheck, 
  GitFork, 
  Sliders, 
  ArrowRight, 
  Activity, 
  Lock, 
  CheckCircle2, 
  RefreshCw,
  Zap
} from 'lucide-react';

export const DefensePage: React.FC = () => {
  const { 
    activeIntervention, 
    allInterventions, 
    setActiveInterventionId,
    navigate,
    resetSimulation
  } = useAgentSecurity();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Defensive Counterfactual Intervention Lab
              </h1>
              <p className="text-xs text-zinc-400">
                Evaluate Pearlian causal interventions, compare containment velocity against workflow disruption, and discover Pareto-optimal controls.
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
            <span>Reset Interventions</span>
          </button>
          <button
            onClick={() => navigate('/policies')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <span>Automate into Rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Counterfactual Lab with 10 interventions, Pareto Curve & Side-by-side comparison */}
      <AgentCounterfactualLab />
    </div>
  );
};
