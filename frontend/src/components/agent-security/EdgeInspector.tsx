import React from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { 
  Radio, 
  ArrowRight, 
  Activity, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  XCircle,
  Sliders,
  X
} from 'lucide-react';

export const EdgeInspector: React.FC = () => {
  const { selectedEdge, setSelectedEdgeId, agents } = useAgentSecurity();

  if (!selectedEdge) return null;

  const srcAgent = agents.find(a => a.id === selectedEdge.source);
  const tgtAgent = agents.find(a => a.id === selectedEdge.target);

  return (
    <div className="bg-zinc-950/95 border border-cyan-500/40 rounded-xl p-4 text-xs space-y-3 relative shadow-2xl backdrop-blur-md">
      <button
        onClick={() => setSelectedEdgeId(null)}
        className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-100 p-1 rounded"
        title="Close Inspector"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 text-cyan-400" />
        <span className="font-mono font-bold text-zinc-200">Communication Channel Inspector</span>
      </div>

      <div className="flex items-center gap-2 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 font-mono">
        <span className="text-cyan-300 font-bold">{srcAgent?.name || selectedEdge.source}</span>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-cyan-300 font-bold">{tgtAgent?.name || selectedEdge.target}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Channel Type</span>
          <span className="text-zinc-200 uppercase font-bold">{selectedEdge.channelType}</span>
        </div>
        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Throughput Rate</span>
          <span className="text-amber-300">{selectedEdge.messageFrequency} msgs/min</span>
        </div>
        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Causal Strength</span>
          <span className="text-emerald-400 font-bold">{(selectedEdge.causalStrength * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
          <span className="text-zinc-400 block text-[10px]">Channel Policy Status</span>
          <span className={`uppercase font-bold ${
            selectedEdge.status === 'active' ? 'text-emerald-400' :
            selectedEdge.status === 'throttled' ? 'text-amber-400' :
            selectedEdge.status === 'blocked' ? 'text-rose-400' : 'text-blue-400'
          }`}>
            {selectedEdge.status}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-zinc-400 bg-zinc-900/40 p-2 rounded border border-zinc-800">
        Causal Classification: <strong className="text-zinc-200">
          {selectedEdge.isVerifiedCausal ? 'Verified Causal DAG Link (BH-FDR Passed)' :
           selectedEdge.isCandidateCausal ? 'Candidate Causal Dependency' : 'Uncorrelated Telemetry'}
        </strong>
      </div>
    </div>
  );
};
