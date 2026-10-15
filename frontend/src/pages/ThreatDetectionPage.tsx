import React from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { ScenarioControllerBanner } from '../components/agent-security/ScenarioControllerBanner';
import { AgentCausalAnalysisPanel } from '../components/agent-security/AgentCausalAnalysisPanel';
import { 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  GitFork, 
  Activity, 
  Lock, 
  Terminal,
  Zap,
  ArrowRight
} from 'lucide-react';

export const ThreatDetectionPage: React.FC = () => {
  const { 
    allScenarios, 
    activeScenario, 
    activeScenarioId, 
    setActiveScenarioId,
    scenarioStep,
    isScenarioRunning,
    startScenario,
    pauseScenario,
    resumeScenario,
    stepForward,
    restartScenario,
    agents,
    navigate
  } = useAgentSecurity();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Multi-Agent Threat Simulation & Detection Lab
              </h1>
              <p className="text-xs text-zinc-400">
                Execute predefined multi-agent attack scenarios (A–H) and reconstruct hidden adversarial coordination vectors.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/propagation')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <span>Analyze Blast Radius</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Scenario Controller Banner */}
      <ScenarioControllerBanner />

      {/* Predefined Scenarios A-H Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span>Predefined Multi-Agent Attack Scenarios</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              8 Adversarial Templates
            </span>
          </h2>
          <span className="text-xs text-zinc-400 font-mono">Select a scenario to load trajectory</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allScenarios.map(scen => {
            const isSelected = activeScenarioId === scen.id;
            return (
              <div
                key={scen.id}
                onClick={() => setActiveScenarioId(scen.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-zinc-900 border-cyan-500 shadow-glow-cyan'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    scen.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    scen.severity === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {scen.severity}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {scen.simulatedSteps.length} Steps
                  </span>
                </div>

                <div className="font-semibold text-xs text-zinc-100 mb-1 leading-snug">
                  {scen.name}
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {scen.description}
                </p>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-500">Detection:</span>
                  <span className="text-zinc-300 truncate max-w-[120px]">{scen.expectedDetection}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Scenario Step-by-Step Trajectory & Inspector */}
      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-800/60">
                ACTIVE SCENARIO
              </span>
              <h3 className="text-sm font-bold text-zinc-100">{activeScenario.name}</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{activeScenario.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-zinc-400 font-mono">
              Step {scenarioStep + 1} of {activeScenario.simulatedSteps.length}
            </span>
          </div>
        </div>

        {/* Step Progression Timeline */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeScenario.simulatedSteps.map((st, idx) => {
              const isPast = idx < scenarioStep;
              const isCurrent = idx === scenarioStep;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    isCurrent
                      ? 'bg-zinc-900 border-cyan-500 shadow-glow-cyan'
                      : isPast
                      ? 'bg-zinc-950/70 border-emerald-800/40 opacity-80'
                      : 'bg-zinc-950/40 border-zinc-800/60 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-zinc-400 font-bold">
                      Step #{st.stepIndex} (T+{idx})
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isCurrent && <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                  </div>

                  <div className="font-semibold text-zinc-200 mb-1 text-[11px]">
                    {st.title}
                  </div>

                  <div className="text-[10px] text-zinc-400 font-mono mb-2">
                    {st.sourceAgent} &rarr; <strong className="text-zinc-300">{st.targetAgent}</strong>
                  </div>

                  <div className="text-[10px] text-zinc-400 leading-tight">
                    {st.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation & Recommended Defense */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-amber-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Adversarial Impact Assessment</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              {activeScenario.resultExplanation}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-emerald-400 mb-1">
              <Zap className="w-4 h-4" />
              <span>Simulated Security Detection</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              {activeScenario.actualSimulatedDetection}
            </p>
          </div>
        </div>
      </div>

      {/* Causal Coordination Analysis: Granger Causality & BH-FDR */}
      <AgentCausalAnalysisPanel />
    </div>
  );
};
