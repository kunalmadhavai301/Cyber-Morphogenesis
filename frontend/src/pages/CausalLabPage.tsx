import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MathEquation } from '../components/shared/MathEquation';
import { VarTestRunner } from '../components/causal/VarTestRunner';
import { CausalReconstructionCard } from '../components/causal/CausalReconstructionCard';
import { 
  GitFork, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  Terminal, 
  ArrowRight,
  Info
} from 'lucide-react';

export const CausalLabPage: React.FC = () => {
  const { navigate } = useSimulation();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-cyan-400" />
            Causal Discovery Laboratory
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section II-B: Structural Causal Modeling, Vector Autoregressive Independence Tests, and Benjamini-Hochberg FDR Control
          </p>
        </div>

        <button
          onClick={() => navigate('/reproducibility')}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs font-mono text-cyan-300 hover:bg-zinc-800 flex items-center gap-1.5"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Python Statistical Code</span>
        </button>
      </div>

      {/* Structural Causal Model & Identification Assumptions Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SCM Definition */}
        <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            The Structural Causal Model (SCM)
          </h3>
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <MathEquation 
              math="\mathcal{M} = \langle \mathbf{U}, \mathbf{V}, \mathbf{F}, P(\mathbf{U}) \rangle" 
              display={true} 
            />
          </div>
          <div className="space-y-1.5 text-xs text-zinc-400 leading-relaxed font-sans">
            <div><strong className="text-zinc-200">U (Exogenous):</strong> Unobserved background noise variables, stochastic traffic perturbations, and external red-team strategy seeds.</div>
            <div><strong className="text-zinc-200">V (Endogenous):</strong> Observable security state variables across network hosts (port scan counts, authentication anomalies, NetFlow volumes).</div>
            <div><strong className="text-zinc-200">F (Structural Assignments):</strong> Deterministic functions <MathEquation math="X_i(t) = f_i(\mathbf{PA}_i(t), \mathbf{U}_i(t))" /> mapping causal predecessors in past time windows to current host state.</div>
          </div>
        </div>

        {/* 4 Necessary Causal Assumptions */}
        <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Formal Causal Identification Assumptions
          </h3>
          <div className="space-y-2 text-xs font-sans">
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
              <strong className="text-zinc-200 font-mono text-[11px]">1. Causal Sufficiency:</strong>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                No unobserved latent confounders simultaneously influence the attacker trajectory and multi-protocol telemetry.
              </p>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
              <strong className="text-zinc-200 font-mono text-[11px]">2. Temporal Precedence:</strong>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                An effect cannot precede its cause: <MathEquation math="X_u(t - \tau) \rightarrow X_v(t)" /> requires <MathEquation math="\tau > 0" />.
              </p>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
              <strong className="text-zinc-200 font-mono text-[11px]">3. Causal Faithfulness:</strong>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Observed conditional independencies in empirical distributions are consequences of the underlying DAG topology.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Testing Pipeline */}
      <VarTestRunner />

      {/* Table II Comparison Card */}
      <CausalReconstructionCard />

      {/* Scientific Transparency Notice */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 font-mono flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-zinc-200 font-bold">Implementation Provenance & Simplification Note:</div>
          <p className="text-[11px] font-sans leading-relaxed">
            The browser demonstration executes interactive autoregressive conditional independence tests for selectable node pairs. For the full 200 observation window matrix evaluation reported in Table II, execute the standalone Python engine: <code className="text-cyan-300">python research/run_experiments.py</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
