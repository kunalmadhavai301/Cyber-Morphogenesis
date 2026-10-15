import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MathEquation } from '../components/shared/MathEquation';
import { NatCrossoverChart } from '../components/nat/NatCrossoverChart';
import { 
  Sliders, 
  Network, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Zap, 
  ArrowRight,
  Info
} from 'lucide-react';

export const NatAnalysisPage: React.FC = () => {
  const [internalHosts, setInternalHosts] = useState<number>(8);
  const [attackFlows, setAttackFlows] = useState<number>(4500);
  const [benignFlows, setBenignFlows] = useState<number>(1200);

  // Dynamic calculations for edge weight concentration
  const totalVolume = attackFlows + (benignFlows * Math.max(1, internalHosts - 1));
  const top1Share = totalVolume > 0 ? (attackFlows / totalVolume) : 0;
  
  // Normalized entropy calculation
  const probs = totalVolume > 0 ? [
    attackFlows / totalVolume,
    ...Array(Math.max(1, internalHosts - 1)).fill(benignFlows / totalVolume)
  ] : [];
  const rawEntropy = -probs.reduce((sum, p) => p > 0 ? sum + p * Math.log2(p) : sum, 0);
  const maxEntropy = internalHosts > 1 ? Math.log2(internalHosts) : 1;
  const normEntropy = internalHosts > 1 ? Math.max(0, Math.min(1, rawEntropy / maxEntropy)) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            NAT Identity-Collapse & Edge-Weight Concentration
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section II-A, Section III-F & Table VI: Overcoming node-degree blindness under perimeter address translation
          </p>
        </div>
      </div>

      {/* Theorem & Conceptual Context Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Hasibuzzaman's Theorem: Node-Degree Blindness [2]
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Under Network Address Translation (NAT) and perimeter load balancers, multiple internal host identities are translated into a single externally visible IP address:
          </p>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-400">
            <span className="text-rose-400 font-bold">Node Degree Failure:</span> When k internal endpoints communicate through 1 gateway, the external degree remains invariant at <code className="text-zinc-200 font-bold">deg(v) = 1</code> regardless of attack severity. Conventional GNNs relying on neighbor counting fail completely (AUC = 0.612).
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            The Cyber Morphogenesis Concentration Solution
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            By preserving Top-1 Edge Share <MathEquation math="S_1(v, t)" /> and Normalized Edge Entropy <MathEquation math="\mathcal{H}_{\text{edge}}(t)" /> inside E-GraphSAGE layers, the graph captures volume spikes independently of vertex degrees:
          </p>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-400">
            <span className="text-emerald-400 font-bold">Causal Discovery Invariance:</span> Integrating time-lagged residual variances with flow concentration preserves high separation (AUC = 0.976–0.986) across the entire collapse spectrum.
          </div>
        </div>
      </div>

      {/* Table VI Crossover Chart Component */}
      <NatCrossoverChart />

      {/* Interactive Edge Concentration Playground */}
      <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
        <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Interactive Edge-Weight Concentration Simulator
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">Eq. (3) & (4)</span>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Internal Hosts Behind NAT (k):</span>
              <strong className="text-cyan-400">{internalHosts}</strong>
            </div>
            <input
              type="range"
              min="2"
              max="32"
              value={internalHosts}
              onChange={(e) => setInternalHosts(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Attacker Flow Volume:</span>
              <strong className="text-rose-400">{attackFlows} KB/s</strong>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={attackFlows}
              onChange={(e) => setAttackFlows(Number(e.target.value))}
              className="w-full accent-rose-400"
            />
          </div>

          <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Benign Flow Volume per Host:</span>
              <strong className="text-emerald-400">{benignFlows} KB/s</strong>
            </div>
            <input
              type="range"
              min="100"
              max="3000"
              step="100"
              value={benignFlows}
              onChange={(e) => setBenignFlows(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
          </div>
        </div>

        {/* Live Feature Output Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Perimeter Node Degree</div>
            <div className="text-xl font-bold text-zinc-400 mt-1">deg = 1</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Degree Blind to {internalHosts} Hosts</div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Total Gateway Volume</div>
            <div className="text-xl font-bold text-zinc-100 mt-1">{totalVolume.toLocaleString()} KB/s</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Aggregated Traffic</div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-cyan-500/30">
            <div className="text-[10px] text-cyan-400 uppercase font-bold">Top-1 Edge Share S_1</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">{(top1Share * 100).toFixed(1)}%</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Eq. (3) Concentration</div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-amber-500/30">
            <div className="text-[10px] text-amber-400 uppercase font-bold">Normalized Entropy H</div>
            <div className="text-xl font-bold text-amber-300 mt-1">{normEntropy.toFixed(3)}</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Eq. (4) Dispersion</div>
          </div>
        </div>
      </div>
    </div>
  );
};
