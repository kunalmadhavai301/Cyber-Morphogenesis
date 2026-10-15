import React, { useState } from 'react';
import { 
  FileCode, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Play, 
  CheckCircle2, 
  FileSpreadsheet, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const ReproducibilityPage: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedFastCmd, setCopiedFastCmd] = useState(false);

  const reproCommand = `uv run --with numpy,scipy,networkx,pandas,scikit-learn python research/run_experiments.py`;
  const fastCommand = `python research/run_experiments.py --fast`;

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const csvFiles = [
    { name: "results_causal_reconstruction.csv", desc: "Table II: Causal Discovery vs Pearson Correlation (SHD, Precision, Recall, F1)" },
    { name: "results_forecasting.csv", desc: "Table III: Multi-horizon forecasting across h=1, 3, 5 for C-TGNN and baselines" },
    { name: "results_counterfactual_defense.csv", desc: "Table IV: 1,000 Monte Carlo trials for 5 defense policies under do-calculus" },
    { name: "results_ablation.csv", desc: "Table V: Architectural ablation study isolating causal and temporal modules" },
    { name: "results_nat_sweep.csv", desc: "Table VI: Controlled sweep across NAT collapse ratios k in {1, 2, 4, 8, 16, 64, 128}" },
    { name: "experiment_config.json", desc: "Complete JSON metadata with random seed=42, observation windows, and hyperparameters" }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-emerald-400" />
            Experiment Reproducibility Laboratory
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section III-A: Independent execution environment, exact random seeds, and downloadable benchmark datasets
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-zinc-900 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Category C: Ready to Run
          </span>
        </div>
      </div>

      {/* Reproducibility Command Callout Box */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              Primary One-Line Reproduction Command
            </div>
            <div className="text-[11px] text-zinc-400">
              Executes the full 32-node testbed simulation with 200 time-slotted windows and 1,000 Monte Carlo evaluations
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-400">
            uv / Python 3.13
          </span>
        </div>

        {/* Command 1: Full UV */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 font-mono text-xs">
          <code className="text-emerald-300 break-all select-all">
            {reproCommand}
          </code>
          <button
            onClick={() => copyToClipboard(reproCommand, setCopiedCmd)}
            className="shrink-0 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700/60"
            title="Copy Command to Clipboard"
          >
            {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Command 2: Fast Demo */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-mono text-zinc-400">Fast Demonstration Run (50 windows, 100 trials):</div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between gap-3 font-mono text-xs">
            <code className="text-cyan-300 select-all">{fastCommand}</code>
            <button
              onClick={() => copyToClipboard(fastCommand, setCopiedFastCmd)}
              className="shrink-0 p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700/60"
              title="Copy Fast Command"
            >
              {copiedFastCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Benchmark Files List */}
      <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
        <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-100 font-mono flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            Generated Experiment Benchmark Data Files
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">Stored in research/ directory</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {csvFiles.map((file, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300">{file.name}</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">{file.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reproducibility Specification Matrix */}
      <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3 font-mono text-xs">
        <div className="font-bold text-zinc-100 uppercase text-xs">Experiment Configuration Parameters:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Random Seed</div>
            <div className="text-base font-bold text-cyan-300 mt-0.5">seed = 42</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Observation Windows</div>
            <div className="text-base font-bold text-zinc-200 mt-0.5">200 Windows</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Monte Carlo Trials</div>
            <div className="text-base font-bold text-zinc-200 mt-0.5">1,000 Trials</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">FDR Threshold α</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">α = 0.05</div>
          </div>
        </div>
      </div>
    </div>
  );
};
