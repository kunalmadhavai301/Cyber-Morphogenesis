import React, { useState } from 'react';
import { MathEquation } from '../components/shared/MathEquation';
import { MATHEMATICAL_FORMULATIONS } from '../data/paperData';
import { 
  Network, 
  Cpu, 
  GitFork, 
  Zap, 
  ShieldCheck, 
  ArrowDown, 
  ArrowRight, 
  Layers, 
  BookOpen, 
  Code2,
  CheckCircle2
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [equationFilter, setEquationFilter] = useState<string>('all');

  const pipelineStages = [
    {
      id: 1,
      name: "Stage 1: Dynamic Cyber Graph Construction",
      section: "Section II-A",
      icon: <Network className="w-5 h-5 text-cyan-400" />,
      purpose: "Converts streaming NetFlow and system audit records into a time-windowed multigraph preserving flow volumes, duration, and packet counts.",
      inputs: "Raw NetFlow v9/IPFIX flow records, host process logs (ProcSAGE), Zeek connection logs.",
      outputs: "Attributed, directed temporal multigraph G_t = (V_t, E_t, X_t, W_t) with edge-weight features.",
      math: "\\mathcal{G}_t = (\\mathcal{V}_t, \\mathcal{E}_t, \\mathbf{X}_t, \\mathbf{W}_t)",
      status: "Fully Implemented in Platform & Simulation"
    },
    {
      id: 2,
      name: "Stage 2: Edge-Centric E-GraphSAGE Encoder",
      section: "Section II-A (Eq. 5)",
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      purpose: "Computes structural node embeddings by concatenating edge features (Top-1 edge share S_1 and edge entropy H) directly into spatial message passing, overcoming NAT collapse.",
      inputs: "Node feature matrix X_t, incident edge weight vectors e_uv.",
      outputs: "NAT-invariant node embedding vectors h_v^(l) for all 32 network entities.",
      math: "\\mathbf{h}_v^{(l)} = \\sigma \\left( \\mathbf{W}_{\\text{self}}^{(l)} \\mathbf{h}_v^{(l-1)} + \\mathbf{W}_{\\text{neigh}}^{(l)} \\sum_{u \\in \\mathcal{N}(v)} \\frac{\\mathbf{h}_u^{(l-1)} \\parallel \\mathbf{e}_{uv}}{\\sqrt{|\\mathcal{N}(v)||\\mathcal{N}(u)|}} \\right)",
      status: "Implemented in Architecture & Simulation"
    },
    {
      id: 3,
      name: "Stage 3: Time-Lagged Causal Discovery Engine",
      section: "Section II-B (Eq. 7 & 8)",
      icon: <GitFork className="w-5 h-5 text-emerald-400" />,
      purpose: "Distinguishes genuine multi-hop attack propagation from spurious correlations caused by coordinated DDoS distractions using Vector Autoregressive F-tests and Benjamini-Hochberg FDR control.",
      inputs: "Temporal time-series signals X_i(t) across sliding observation windows delta-t.",
      outputs: "Directed Causal DAG G_causal with Structural Hamming Distance = 15.",
      math: "H_0: X_v(t) \\perp\\!\\!\\!\\perp X_u(t - \\tau) \\mid \\mathbf{PA}_v(t) \\setminus \\{u\\}",
      status: "Fully Implemented (Interactive in Causal Lab & Python)"
    },
    {
      id: 4,
      name: "Stage 4: C-TGNN Forecasting & Counterfactual Defense",
      section: "Section II-D & II-E (Eq. 9 - 13)",
      icon: <Zap className="w-5 h-5 text-rose-400" />,
      purpose: "Restricts temporal GNN message passing exclusively along verified causal edges for multi-step forecasting (h=1,3,5), and evaluates prospective do-calculus surgeries to find the Pareto optimal defense.",
      inputs: "Causal DAG G_causal, current infection vector H_t, prospective defense candidate action a.",
      outputs: "Optimal policy a* achieving 9.60% ASR and 5.01% SDR.",
      math: "a^* = \\arg\\min_{a \\in \\mathcal{A}} [\\mathbb{E}[Y_{\\text{compromise}} \\mid do(a)] + \\lambda \\mathcal{C}_{\\text{disruption}}(a)]",
      status: "Fully Implemented in Sandbox & Pareto Optimizer"
    }
  ];

  const currentStageInfo = pipelineStages.find(s => s.id === selectedStage) || pipelineStages[0];

  const filteredEquations = equationFilter === 'all' 
    ? MATHEMATICAL_FORMULATIONS 
    : MATHEMATICAL_FORMULATIONS.filter(eq => eq.section.toLowerCase().includes(equationFilter.toLowerCase()));

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            System Architecture & Technical Methodology
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section II: Complete algorithmic pipeline, Structural Causal Modeling, and KaTeX mathematical formulations
          </p>
        </div>
      </div>

      {/* Interactive 4-Stage Architecture Pipeline */}
      <div className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Cyber Morphogenesis Pipeline (Click any stage to inspect inputs, outputs, and equations):
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {pipelineStages.map((stg) => {
            const isSelected = stg.id === selectedStage;
            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStage(stg.id)}
                className={`p-4 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-cyan-400 shadow-glow-cyan'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                      {stg.icon}
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">
                      STAGE {stg.id}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-zinc-100 mb-1 leading-snug">
                    {stg.name.split(':')[1] || stg.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {stg.section}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>{isSelected ? 'Currently Inspecting' : 'Click to Inspect'}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-700">
                {currentStageInfo.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100">{currentStageInfo.name}</h3>
                <span className="text-xs font-mono text-cyan-400">{currentStageInfo.section}</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              {currentStageInfo.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
              <span className="text-zinc-500 uppercase text-[10px]">Inputs</span>
              <p className="text-zinc-300 font-sans text-xs">{currentStageInfo.inputs}</p>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
              <span className="text-zinc-500 uppercase text-[10px]">Outputs</span>
              <p className="text-zinc-300 font-sans text-xs">{currentStageInfo.outputs}</p>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="text-[10px] font-mono uppercase text-zinc-400">Core Mathematical Formulation:</div>
            <div className="py-2 text-center overflow-x-auto">
              <MathEquation math={currentStageInfo.math} display={true} />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
            <strong>Detailed Operational Purpose:</strong> {currentStageInfo.purpose}
          </div>
        </div>
      </div>

      {/* Mathematical Formulations Section */}
      <div className="space-y-6 pt-4">
        <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              Mathematical Equation Viewer (KaTeX)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Exact mathematical expressions extracted from Section II of the research paper
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs font-mono">
            {['all', 'II-A', 'II-B', 'II-D', 'II-E'].map(sec => (
              <button
                key={sec}
                onClick={() => setEquationFilter(sec)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  equationFilter === sec 
                    ? 'bg-zinc-800 text-cyan-400 font-bold' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sec === 'all' ? 'All (13 Equations)' : `Sec ${sec}`}
              </button>
            ))}
          </div>
        </div>

        {/* Equation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEquations.map(eq => (
            <div key={eq.id} className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-xs text-zinc-100">{eq.name}</span>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-zinc-500">Sec {eq.section}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-400">Eq. ({eq.number})</span>
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 overflow-x-auto text-center py-3">
                <MathEquation math={eq.latex} display={true} />
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {eq.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
