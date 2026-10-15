import React from 'react';
import { TABLE_II_CAUSAL_RECONSTRUCTION } from '../../data/paperData';
import { ShieldAlert, CheckCircle2, TrendingDown, ArrowRight, Info } from 'lucide-react';

export const CausalReconstructionCard: React.FC = () => {
  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            Table II: Causal Graph Reconstruction vs. Correlation Baseline
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-mono">
              Paper-Reported (RQ1)
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Evaluating Structural Hamming Distance (SHD) and edge recovery metrics on the 32-node testbed
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/60">
              <th className="py-2.5 px-3">Methodology</th>
              <th className="py-2.5 px-3">Precision</th>
              <th className="py-2.5 px-3">Recall</th>
              <th className="py-2.5 px-3">F1-Score</th>
              <th className="py-2.5 px-3 text-right">SHD (Lower=Best)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {TABLE_II_CAUSAL_RECONSTRUCTION.map((row, idx) => {
              const isOurs = row.method.includes('Ours');
              return (
                <tr 
                  key={idx} 
                  className={isOurs ? 'bg-cyan-500/10 font-medium' : 'bg-transparent text-zinc-300'}
                >
                  <td className="py-3 px-3 flex items-center gap-2">
                    {isOurs ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                    )}
                    <span className={isOurs ? 'text-cyan-300 font-bold' : 'text-zinc-200'}>
                      {row.method}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-300">{row.precision.toFixed(3)}</td>
                  <td className="py-3 px-3 text-zinc-300">{row.recall.toFixed(3)}</td>
                  <td className="py-3 px-3 text-zinc-300">{row.f1.toFixed(3)}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded font-bold text-sm ${
                      isOurs 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {row.shd}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Critical Scientific Interpretation */}
      <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
        <div className="font-semibold text-zinc-200 flex items-center gap-1.5 font-mono text-[11px]">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scientific Findings & Honest Trade-off Analysis:</span>
        </div>
        <ul className="space-y-1.5 text-zinc-400 text-[11px] leading-relaxed list-disc list-inside">
          <li>
            <strong className="text-zinc-200">Structural Accuracy (SHD 15 vs 19):</strong> The proposed causal discovery engine achieved an absolute reduction of 4 structural edits, successfully suppressing spurious cross-subnet edges created by volumetric flooding.
          </li>
          <li>
            <strong className="text-zinc-200">Identical Precision (0.167):</strong> Both methods exhibited identical precision due to background Poisson noise and edge density in the unmonitored testbed intervals.
          </li>
          <li>
            <strong className="text-zinc-200">Conservative Edge Selection Trade-Off:</strong> Causal discovery produced lower recall (0.286 vs 0.429) and F1 (0.211 vs 0.240). As explicitly documented in the paper, the method trades off recall in order to guarantee causal validity and prevent self-inflicted denial-of-service from false defensive isolations.
          </li>
        </ul>
      </div>
    </div>
  );
};
