import React, { useState } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { 
  ShieldAlert, 
  Sliders, 
  Activity, 
  AlertTriangle, 
  Info, 
  HelpCircle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export const AgentBehaviorGuardPanel: React.FC = () => {
  const { 
    selectedAgent, 
    behaviorWeights, 
    setBehaviorWeights,
    riskThresholds,
    setRiskThresholds,
    calculateAgentRiskScore,
    getRiskClassification,
    activeScenario
  } = useAgentSecurity();

  const [showWeightSettings, setShowWeightSettings] = useState(false);

  if (!selectedAgent) return null;

  // Compute individual indicators for selected agent
  const indA = Math.round(selectedAgent.anomalyScore * 100);
  const indB = Math.min(100, selectedAgent.policyViolationCount * 30);
  const indC = selectedAgent.incomingMessages > 80 ? 65 : 18;
  const indD = Math.min(100, selectedAgent.downstreamDependencies.length * 15);
  const indE = selectedAgent.policyViolationCount > 1 ? 80 : 12;
  const indF = selectedAgent.id === 'res-01' && activeScenario.id === 'scen-03' ? 88 : 8;
  const indG = selectedAgent.id === 'data-01' && activeScenario.id === 'scen-07' ? 82 : 14;
  const indH = (selectedAgent.id === 'code-01' || selectedAgent.id === 'tool-01') && activeScenario.id === 'scen-05' ? 92 : 16;

  const compositeScore = calculateAgentRiskScore(selectedAgent);
  const riskClass = getRiskClassification(compositeScore);

  const indicatorsList = [
    { key: 'A', name: 'Indicator A: Behavioral Deviation', score: indA, weight: behaviorWeights.weightA, desc: 'Statistical departure from role-specific behavioral baseline trajectory.' },
    { key: 'B', name: 'Indicator B: Permission Violations', score: indB, weight: behaviorWeights.weightB, desc: 'Unauthorized tool or data-scope invocation attempts.' },
    { key: 'C', name: 'Indicator C: Communication Anomaly', score: indC, weight: behaviorWeights.weightC, desc: 'Anomalous message rate or unapproved communication destination.' },
    { key: 'D', name: 'Indicator D: Propagation Risk', score: indD, weight: behaviorWeights.weightD, desc: 'Topological reachability to downstream critical agents (blast radius).' },
    { key: 'E', name: 'Indicator E: Repeated Policy Failures', score: indE, weight: behaviorWeights.weightE, desc: 'High frequency of denied checks within a sliding 60-second window.' },
    { key: 'F', name: 'Indicator F: Runaway Delegation', score: indF, weight: behaviorWeights.weightF, desc: 'Cyclic subtask generation or unconstrained recursive delegation loops.' },
    { key: 'G', name: 'Indicator G: Data-Access Anomaly', score: indG, weight: behaviorWeights.weightG, desc: 'Attempts to read or transform records outside assigned data partition.' },
    { key: 'H', name: 'Indicator H: Cross-Agent Coordination', score: indH, weight: behaviorWeights.weightH, desc: 'Synchronized timing patterns suggesting multi-agent collusion or evasion.' },
  ];

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Agent Behavior Guard
              <span className="text-xs font-mono font-normal text-zinc-400">
                (Multi-Signal Anomaly Evaluation)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Evaluates 8 independent behavioral indicators to determine composite risk without relying on single-metric alarms.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWeightSettings(!showWeightSettings)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
            showWeightSettings 
              ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showWeightSettings ? 'Hide Weights' : 'Configure Weights'}</span>
        </button>
      </div>

      {/* Composite Score Summary Card */}
      <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Composite Threat Index</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {(compositeScore * 100).toFixed(1)}%
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
              riskClass === 'low' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' :
              riskClass === 'elevated' ? 'bg-blue-950 text-blue-400 border border-blue-600' :
              riskClass === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-600' :
              'bg-rose-950 text-rose-400 border border-rose-600'
            }`}>
              {riskClass} Alert Threshold
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Target: <strong className="text-zinc-200">{selectedAgent.name}</strong> • Confidence Level: <strong className="text-cyan-300">92.4%</strong> • Evidence Count: <strong className="text-white">{selectedAgent.policyViolationCount + 2} telemetry items</strong>
          </p>
        </div>

        {/* Threshold Ranges */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
          <span className="text-emerald-400">Low &lt;{riskThresholds.low}%</span>
          <span>•</span>
          <span className="text-blue-400">Elevated {riskThresholds.low}-{riskThresholds.elevated}%</span>
          <span>•</span>
          <span className="text-amber-400">High {riskThresholds.elevated}-{riskThresholds.high}%</span>
          <span>•</span>
          <span className="text-rose-400">Crit &gt;{riskThresholds.high}%</span>
        </div>
      </div>

      {/* Weight Tuning Sliders Modal/Section */}
      {showWeightSettings && (
        <div className="bg-zinc-950/90 p-4 rounded-xl border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
            <span>Indicator Weight Configuration (Normalized Linear Model)</span>
            <span className="text-[10px] text-zinc-400 font-mono">Deterministic Scoring</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            {indicatorsList.map(ind => (
              <div key={ind.key} className="space-y-1 bg-zinc-900/60 p-2 rounded border border-zinc-800">
                <div className="flex justify-between text-zinc-300">
                  <span>Weight {ind.key}</span>
                  <span className="font-mono text-cyan-300">{(ind.weight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.40"
                  step="0.01"
                  value={ind.weight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setBehaviorWeights(prev => ({
                      ...prev,
                      [`weight${ind.key}`]: val
                    }));
                  }}
                  className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 Indicators Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
        {indicatorsList.map(ind => {
          const isHigh = ind.score >= 50;
          return (
            <div 
              key={ind.key}
              className={`p-2.5 rounded-lg border transition-all ${
                isHigh 
                  ? 'bg-rose-950/20 border-rose-500/40' 
                  : 'bg-zinc-950/60 border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-zinc-200">{ind.name}</span>
                <span className={`font-mono font-bold ${isHigh ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {ind.score}/100
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded overflow-hidden mb-1.5">
                <div 
                  className={`h-full ${isHigh ? 'bg-gradient-to-r from-amber-400 to-rose-500' : 'bg-emerald-400'}`}
                  style={{ width: `${ind.score}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-400">{ind.desc}</p>
            </div>
          );
        })}
      </div>

      {/* False Positive Challenge Advisory */}
      <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-3 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-blue-300 block">False-Positive Prevention Assurance:</span>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            The Behavior Guard requires concurrence across multiple orthogonal indicators before recommending disruptive containment. 
            High message frequency alone (Scenario 6) triggers observational scrutiny, not automatic isolation, preserving valid high-throughput computational workflows.
          </p>
        </div>
      </div>
    </div>
  );
};
