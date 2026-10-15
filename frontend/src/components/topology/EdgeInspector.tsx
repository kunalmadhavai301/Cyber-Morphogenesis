import React from 'react';
import { NetworkEdge } from '../../types/cyber';
import { 
  GitCommit, 
  Activity, 
  Clock, 
  BarChart2, 
  AlertCircle, 
  Scissors, 
  Minimize2, 
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface EdgeInspectorProps {
  edge: NetworkEdge | null;
  onClose?: () => void;
}

export const EdgeInspector: React.FC<EdgeInspectorProps> = ({ edge, onClose }) => {
  if (!edge) {
    return (
      <div className="glass-panel p-5 rounded-xl border border-zinc-800 text-center text-zinc-500 py-12">
        <GitCommit className="w-10 h-10 mx-auto mb-3 opacity-30 text-zinc-400" />
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">Edge Telemetry Inspector</div>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
          Click any directed connection between nodes to inspect its flow features, edge-weight concentration, and VAR causal test statistics.
        </p>
      </div>
    );
  }

  const getInterventionBadge = () => {
    switch (edge.interventionStatus) {
      case 'severed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 font-semibold"><Scissors className="w-3 h-3" /> SEVERED (do)</span>;
      case 'throttled':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center gap-1 font-semibold"><Minimize2 className="w-3 h-3" /> THROTTLED (do)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">NORMAL ROUTING</span>;
    }
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800 text-zinc-200 space-y-4">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">Flow Directed Edge</div>
          {getInterventionBadge()}
        </div>
        <div className="mt-2 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 font-mono text-xs flex items-center justify-between">
          <span className="text-zinc-200 font-bold">{edge.source}</span>
          <span className="text-cyan-400 font-bold px-1.5">──[{edge.proto}]──►</span>
          <span className="text-zinc-200 font-bold">{edge.target}</span>
        </div>
      </div>

      {/* Primary Flow Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
        <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Traffic Vol.</div>
          <div className="font-bold text-zinc-100 mt-0.5">{edge.trafficVolume} KB/s</div>
        </div>
        <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Packets</div>
          <div className="font-bold text-cyan-400 mt-0.5">{edge.packetCount}</div>
        </div>
        <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Duration</div>
          <div className="font-bold text-zinc-100 mt-0.5">{edge.flowDuration}s</div>
        </div>
      </div>

      {/* Paper Formulas: Edge Weight Concentration & Entropy (Eq. 3 & Eq. 4) */}
      <div className="bg-zinc-900/90 p-3.5 rounded-lg border border-zinc-800 space-y-3">
        <div className="text-xs font-mono font-semibold text-zinc-200 flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
          <span>Edge-Centric Concentration Features</span>
          <span className="text-[10px] text-zinc-400 font-normal">Section II-A</span>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-zinc-300">Top-1 Edge Share S_1(v, t):</span>
            <span className="font-bold text-cyan-400 font-mono">{(edge.edgeWeightConcentration * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              style={{ width: `${edge.edgeWeightConcentration * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            max_e w_e / sum_e w_e (Preserves volume signal under NAT collapse)
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-zinc-300">Normalized Edge Entropy H(v, t):</span>
            <span className="font-bold text-amber-400 font-mono">{edge.edgeEntropy.toFixed(3)}</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
              style={{ width: `${edge.edgeEntropy * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 font-mono">
            - sum p_i log2(p_i) / log2(|E|) (Drop indicates concentrated lateral movement)
          </div>
        </div>
      </div>

      {/* Causal Verification vs Statistical Correlation */}
      <div className="space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-400">Statistical Correlation:</span>
          {edge.correlationStatus === 'strong' ? (
            <span className="text-rose-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Pearson r &gt; 0.75
            </span>
          ) : edge.correlationStatus === 'moderate' ? (
            <span className="text-amber-400 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> Moderate Pearson r ≈ 0.45
            </span>
          ) : (
            <span className="text-zinc-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Weak / Negligible
            </span>
          )}
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-400">Causal DAG Verification:</span>
          {edge.causalStatus === 'verified' ? (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Causal Link (p &lt; 0.05 FDR)
            </span>
          ) : edge.causalStatus === 'candidate' ? (
            <span className="text-amber-400 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> Candidate Causal Edge
            </span>
          ) : (
            <span className="text-zinc-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Rejected by FDR Control
            </span>
          )}
        </div>

        {/* Granger / VAR p-value display */}
        <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
          <span className="text-zinc-400">Time-Lagged VAR p-value:</span>
          {edge.pValGranger !== undefined ? (
            <span className="font-bold text-cyan-300 font-mono">
              p = {edge.pValGranger.toFixed(4)} (Significant)
            </span>
          ) : (
            <span className="text-zinc-500 text-[11px] font-mono">
              p &gt; 0.05 (Non-causal under H_0)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
