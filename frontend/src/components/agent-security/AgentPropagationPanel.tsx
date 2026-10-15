import React from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { 
  GitCommit, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Clock,
  Radio,
  FileCheck2,
  Workflow
} from 'lucide-react';

export const AgentPropagationPanel: React.FC = () => {
  const { selectedAgent, downstreamAgents, activeScenario, activeIntervention, agents } = useAgentSecurity();

  const sourceAgent = selectedAgent || agents[0];
  const reachableCount = downstreamAgents.length;
  const blastRadiusScore = Math.min(100, reachableCount * 22 + (sourceAgent?.riskScore || 0.3) * 35);
  const propagationDepth = reachableCount > 3 ? 3 : reachableCount > 0 ? 2 : 1;

  const timelineSteps = [
    { code: 'T0', time: '12:00:00', title: 'Suspicious Behavior Initiated', desc: `${sourceAgent.name} initiated uncharacteristic tool execution requests.`, status: 'completed' },
    { code: 'T1', time: '12:00:02', title: 'Behavior Guard Detection', desc: 'Indicator B (Permission Violations) exceeded the 30% Elevated alert threshold.', status: 'completed' },
    { code: 'T2', time: '12:00:05', title: 'Causal Coordination Traced', desc: 'VAR Granger test identified directed dependencies towards downstream tool execution proxies.', status: 'completed' },
    { code: 'T3', time: '12:00:08', title: 'Blast Radius Estimated', desc: `${reachableCount} downstream agents identified within potential blast radius.`, status: 'completed' },
    { code: 'T4', time: '12:00:11', title: 'Intervention Selected', desc: `Applied ${activeIntervention.name} under Pearlian do-calculus.`, status: 'active' },
    { code: 'T5', time: '12:00:14', title: 'Post-Intervention Evaluated', desc: `Residual risk reduced to ${activeIntervention.residualRisk}% with ${activeIntervention.criticalWorkflowAvailability}% workflow availability.`, status: 'pending' },
  ];

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Attack & Failure Propagation Prediction
              <span className="text-xs font-mono font-normal text-rose-400">
                (Blast Radius & Reachability)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Evaluates directed topological reachability from suspicious agents down into mission-critical workflow components.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Estimated Blast Radius:</span>
          <div className="text-lg font-bold font-mono text-rose-400">{blastRadiusScore.toFixed(1)} / 100</div>
        </div>
      </div>

      {/* Propagation Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Reachable Agents</span>
          <span className="text-base font-bold font-mono text-rose-400">{reachableCount} Nodes</span>
          <span className="text-[10px] text-zinc-400 block">Direct and indirect</span>
        </div>
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Propagation Depth</span>
          <span className="text-base font-bold font-mono text-amber-400">{propagationDepth} Hops</span>
          <span className="text-[10px] text-zinc-400 block">Max delegation depth</span>
        </div>
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Critical Assets at Risk</span>
          <span className="text-base font-bold font-mono text-cyan-300">Reporting & Verif</span>
          <span className="text-[10px] text-zinc-400 block">Downstream crown jewels</span>
        </div>
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Intervention Status</span>
          <span className="text-base font-bold font-mono text-emerald-400">{activeIntervention.key.toUpperCase()}</span>
          <span className="text-[10px] text-zinc-400 block">{activeIntervention.remainingSuspiciousPaths} paths remaining</span>
        </div>
      </div>

      {/* Blast Radius Path Map */}
      <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2">
        <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Workflow className="w-4 h-4 text-rose-400" />
          Predicted Propagation Trajectory from {sourceAgent.name}:
        </span>

        {downstreamAgents.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">No downstream agents reachable. Threat is topologically self-contained.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-500/50 text-amber-300 rounded font-mono text-xs font-bold">
              [SRC] {sourceAgent.name}
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
            {downstreamAgents.map((agent, i) => (
              <React.Fragment key={agent.id}>
                <span className="px-2.5 py-1 bg-zinc-900 border border-rose-600/40 text-rose-300 rounded font-mono text-xs">
                  {agent.name}
                </span>
                {i < downstreamAgents.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Propagation Timeline T0 - T5 */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-400" />
          Temporal Incident Propagation Timeline (T0 ➔ T5):
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {timelineSteps.map(step => (
            <div 
              key={step.code}
              className={`p-2.5 rounded-lg border transition-all ${
                step.status === 'active' 
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md' 
                  : 'bg-zinc-950/60 border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-cyan-400">{step.code} ({step.time})</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-bold ${
                  step.status === 'completed' ? 'bg-emerald-950 text-emerald-400' :
                  step.status === 'active' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {step.status}
                </span>
              </div>
              <h4 className="font-semibold text-zinc-200 text-xs">{step.title}</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
