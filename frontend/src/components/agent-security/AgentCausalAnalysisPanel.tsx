import React, { useState } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { CAUSAL_AGENT_RELATIONSHIPS } from '../../data/agentSecurityData';
import { CausalAgentRelationship } from '../../types/agentSecurity';
import { MathEquation } from '../shared/MathEquation';
import { 
  GitFork, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Activity,
  ArrowRight,
  ShieldCheck,
  Search,
  Sliders,
  Filter
} from 'lucide-react';

export const AgentCausalAnalysisPanel: React.FC = () => {
  const { agents } = useAgentSecurity();
  const [selectedRel, setSelectedRel] = useState<CausalAgentRelationship>(CAUSAL_AGENT_RELATIONSHIPS[0]);
  const [fdrAlpha, setFdrAlpha] = useState<number>(0.05);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredRels = CAUSAL_AGENT_RELATIONSHIPS.filter(rel => {
    if (filterType === 'verified') return rel.isVerified;
    if (filterType === 'candidate') return rel.isCandidate && !rel.isVerified;
    if (filterType === 'spurious') return !rel.isCandidate && !rel.isVerified;
    return true;
  });

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Causal Agent Coordination Analysis
              <span className="text-xs font-mono font-normal text-cyan-400">
                (Time-Lagged Granger & BH-FDR)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Differentiates genuine causal coordination from spurious co-occurrence caused by shared prompts or synchronized triggers.
            </p>
          </div>
        </div>

        {/* Alpha Selector */}
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs">
          <span className="text-zinc-400 font-mono">FDR Cutoff \(\alpha\):</span>
          <select
            value={fdrAlpha}
            onChange={(e) => setFdrAlpha(parseFloat(e.target.value))}
            className="bg-zinc-900 text-cyan-300 font-mono px-2 py-0.5 rounded border border-zinc-700 focus:outline-none"
          >
            <option value="0.01">0.01 (Strict)</option>
            <option value="0.05">0.05 (Paper Default)</option>
            <option value="0.10">0.10 (Exploratory)</option>
          </select>
        </div>
      </div>

      {/* 4 Epistemological Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 font-mono text-[10px] block">1. Observed Comm</span>
          <span className="text-sm font-semibold text-zinc-200">Telemetry Stream</span>
          <p className="text-[10px] text-zinc-400 mt-0.5">Raw message packets exchanged across agents.</p>
        </div>
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-amber-400 font-mono text-[10px] block">2. Statistical Correlation</span>
          <span className="text-sm font-semibold text-amber-300">Pearson \(\rho &gt; 0.65\)</span>
          <p className="text-[10px] text-zinc-400 mt-0.5">Prone to confounders and shared prompts.</p>
        </div>
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
          <span className="text-blue-400 font-mono text-[10px] block">3. Candidate Causal</span>
          <span className="text-sm font-semibold text-blue-300">Time-Lagged Granger</span>
          <p className="text-[10px] text-zinc-400 mt-0.5">Past activity predicts future behavior with lag \(L\).</p>
        </div>
        <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-cyan-800/40">
          <span className="text-cyan-400 font-mono text-[10px] block">4. Verified Causal</span>
          <span className="text-sm font-semibold text-cyan-300">BH-FDR Corrected</span>
          <p className="text-[10px] text-zinc-400 mt-0.5">Survives conditional independence testing.</p>
        </div>
      </div>

      {/* Main Analysis Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Relationship List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>Evaluated Agent Pairs ({filteredRels.length})</span>
            <div className="flex gap-1">
              {['all', 'verified', 'spurious'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                    filterType === t ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
            {filteredRels.map((rel, idx) => {
              const isSelected = selectedRel.sourceAgent === rel.sourceAgent && selectedRel.targetAgent === rel.targetAgent;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRel(rel)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-zinc-900 border-cyan-500/60 shadow-md' 
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold">
                      <span className="text-zinc-200">{rel.sourceAgent}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-zinc-200">{rel.targetAgent}</span>
                    </div>

                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold ${
                      rel.isVerified ? 'bg-cyan-950 text-cyan-400 border border-cyan-600/40' :
                      rel.isCandidate ? 'bg-blue-950 text-blue-400 border border-blue-600/40' :
                      'bg-rose-950 text-rose-400 border border-rose-600/40'
                    }`}>
                      {rel.isVerified ? 'Verified DAG Edge' : rel.isCandidate ? 'Candidate' : 'Spurious Rejected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                    <span>Lag: L={rel.timeLag} step</span>
                    <span>F-Stat: {rel.fStatistic.toFixed(2)}</span>
                    <span className={rel.pValueFdrCorrected < fdrAlpha ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                      p_BH = {rel.pValueFdrCorrected.toFixed(4)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Causal Inspector */}
        <div className="lg:col-span-7 bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-zinc-200 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Causal Evidence Inspector
            </span>
            <span className="text-xs font-mono text-cyan-300">
              {selectedRel.sourceAgent} ➔ {selectedRel.targetAgent}
            </span>
          </div>

          {/* Test Statistics Table */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400 text-[10px] block">Test Applied</span>
              <span className="font-semibold text-zinc-200">{selectedRel.statisticalTest}</span>
            </div>
            <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400 text-[10px] block">Raw Granger p-Value</span>
              <span className="font-mono text-zinc-200">{selectedRel.pValueRaw.toFixed(5)}</span>
            </div>
            <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400 text-[10px] block">BH-FDR Corrected p</span>
              <span className={`font-mono font-bold ${selectedRel.pValueFdrCorrected < fdrAlpha ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedRel.pValueFdrCorrected.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Observed Evidence */}
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-zinc-300">Empirical Telemetry Evidence:</span>
            <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 text-zinc-300 leading-relaxed font-sans text-xs">
              {selectedRel.observedEvidence}
            </div>
          </div>

          {/* Confounding & Alternative Explanations */}
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-zinc-300">Alternative Explanations & Confounders Tested:</span>
            <ul className="space-y-1">
              {selectedRel.alternativeExplanations.map((alt, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-400 bg-zinc-900/40 px-2 py-1 rounded text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>{alt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Formal Methodology Callout */}
          <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-lg p-2.5 text-[11px] text-zinc-400 space-y-1">
            <div className="font-mono text-cyan-300 font-bold">Formal Decision Rule:</div>
            <p>
              An edge is admitted into the defensive causal DAG if and only if:
            </p>
            <div className="py-1 flex justify-center">
              <MathEquation math="\mathcal{H}_0: X_{i, t-L} \perp\!\!\perp X_{j, t} \mid \mathbf{S} \quad \text{rejected at } p_{\text{FDR}} < \alpha" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
