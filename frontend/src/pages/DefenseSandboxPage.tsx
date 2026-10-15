import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MathEquation } from '../components/shared/MathEquation';
import { ParetoTradeoffChart } from '../components/defense/ParetoTradeoffChart';
import { TABLE_IV_DEFENSE_POLICIES } from '../data/paperData';
import { 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Scissors, 
  Minimize2, 
  Clock, 
  Cpu, 
  CheckCircle2,
  TrendingDown,
  Info
} from 'lucide-react';

export const DefenseSandboxPage: React.FC = () => {
  const { mode, activePolicy, setActivePolicyId } = useSimulation();

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Counterfactual Defense Sandbox
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section II-E & Table IV: Simulating hypothetical defensive surgeries via Pearl's do-calculus: P(Y | do(X = x))
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300">
            Mode: <strong className={mode === 'paper' ? 'text-emerald-400' : 'text-cyan-400'}>
              {mode === 'paper' ? 'Paper-Reported Results (Table IV)' : 'Interactive Simulation Mode'}
            </strong>
          </span>
        </div>
      </div>

      {/* Pearlian Intervention Notation Box */}
      <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Pearlian do-Calculus vs. Observational Association
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">Eq. (10) & (13)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
            <div className="text-zinc-400 font-semibold text-[11px]">Observational Conditioning:</div>
            <div className="text-sm font-bold text-zinc-300 py-1">
              <MathEquation math="P(Y \mid X = x)" />
            </div>
            <p className="text-zinc-500 text-[11px] font-sans">
              Passive observation of telemetry without altering graph topology. In dynamic cyber systems, this is vulnerable to confounding from decoy volumetric floods.
            </p>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-cyan-500/30 space-y-1">
            <div className="text-cyan-400 font-semibold text-[11px]">Pearlian Counterfactual Intervention:</div>
            <div className="text-sm font-bold text-cyan-300 py-1">
              <MathEquation math="P(Y \mid do(X = x))" />
            </div>
            <p className="text-zinc-400 text-[11px] font-sans">
              Graph surgery that severs all incoming causal edges to node X and fixes its state to x, simulating prospective defensive actions without risking production downtime.
            </p>
          </div>
        </div>
      </div>

      {/* The Five Defensive Policies Cards */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Select Defensive Policy to Apply to Cyber Topology:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {TABLE_IV_DEFENSE_POLICIES.map((p, idx) => {
            const isSelected = p.id === activePolicy.id;
            const metrics = mode === 'paper' ? p.paperReported : p.simulationSample;
            const isUnfavorable = p.id === 'p2';
            const isJoint = p.id === 'p5';

            return (
              <button
                key={p.id}
                onClick={() => setActivePolicyId(p.id)}
                className={`p-4 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? isJoint
                      ? 'bg-zinc-900 border-cyan-400 shadow-glow-cyan'
                      : isUnfavorable
                      ? 'bg-zinc-900 border-rose-500/70 shadow-glow-rose'
                      : 'bg-zinc-900 border-zinc-400'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-zinc-500">POLICY {idx + 1}</span>
                    {isJoint && <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">Optimal</span>}
                    {isUnfavorable && <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">Rerouted</span>}
                  </div>

                  <div className="font-bold text-xs text-zinc-200 mb-1 leading-snug">
                    {p.name}
                  </div>

                  <div className="text-[10px] text-cyan-300 font-mono mb-2 overflow-x-hidden">
                    <MathEquation math={p.doCalculus} />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">ASR:</span>
                    <strong className={metrics.asr <= 10.3 ? 'text-emerald-400' : 'text-rose-400'}>
                      {metrics.asr.toFixed(2)}%
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">SDR:</span>
                    <strong className={metrics.sdr > 10 ? 'text-rose-400' : 'text-amber-400'}>
                      {metrics.sdr.toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Policy Detailed Rationale & Visual Modification Pill */}
      <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-100 text-sm">{activePolicy.name}</span>
            <span className="text-cyan-400 text-xs"><MathEquation math={activePolicy.doCalculus} /></span>
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">
            Updated on 32-Node Network Explorer
          </span>
        </div>

        <p className="text-zinc-300 text-xs font-sans leading-relaxed">
          {activePolicy.description} {activePolicy.rationale}
        </p>

        {activePolicy.paperReported.unfavorableNote && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 font-sans">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>Scientific Transparency Note:</strong> {activePolicy.paperReported.unfavorableNote}
            </div>
          </div>
        )}

        {/* Reduction metrics callout for Joint Defense */}
        {activePolicy.id === 'p5' && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase text-zinc-400 font-mono">Relative ASR Reduction:</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                64.44%
              </div>
              <div className="text-[10px] text-zinc-400">
                Formula: (27.00% - 9.60%) / 27.00% × 100
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-zinc-400 font-mono">Absolute Percentage-Point Drop:</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                17.40 pp
              </div>
              <div className="text-[10px] text-zinc-400">
                Formula: 27.00% - 9.60% absolute difference
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Pareto Chart */}
      <ParetoTradeoffChart />

      {/* Four Counterfactual Primitives Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-rose-400 font-mono">
            <Scissors className="w-4 h-4" />
            <span>1. Host Isolation</span>
          </div>
          <div className="text-[11px] font-mono text-cyan-300">
            <MathEquation math="do(\mathcal{E}_{\text{incident}}(v) = \emptyset)" />
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Sets communication capacity of all incident edges to zero in the cyber graph. Severed links rendered as dashed rose-red lines.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400 font-mono">
            <Minimize2 className="w-4 h-4" />
            <span>2. Link Throttling</span>
          </div>
          <div className="text-[11px] font-mono text-cyan-300">
            <MathEquation math="do(\omega(u,v) \leftarrow \gamma \omega(u,v))" />
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Restricts bandwidth by scaling edge weight with gamma in (0, 1). Chokes volumetric DDoS floods while preserving legitimate flows.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 font-mono">
            <Clock className="w-4 h-4" />
            <span>3. Adaptive Timeout</span>
          </div>
          <div className="text-[11px] font-mono text-cyan-300">
            <MathEquation math="do(\Delta t_{\text{flow}} \uparrow)" />
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Increases flow expiration timeout rules to force ephemeral C2 connections into persistent NetFlow logs before eviction.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>4. Joint Defense</span>
          </div>
          <div className="text-[11px] font-mono text-cyan-300">
            <MathEquation math="a^* = \arg\min [\mathbb{E}[Y] + \lambda \mathcal{C}]" />
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Solves multi-objective optimization balancing threat containment against operational availability. Reaches Pareto optimality.
          </p>
        </div>
      </div>
    </div>
  );
};
