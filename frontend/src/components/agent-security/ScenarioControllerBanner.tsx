import React from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';

export const ScenarioControllerBanner: React.FC = () => {
  const { 
    allScenarios, 
    activeScenario, 
    setActiveScenarioId, 
    scenarioStep, 
    isScenarioRunning,
    startScenario,
    pauseScenario,
    resumeScenario,
    stepForward,
    restartScenario 
  } = useAgentSecurity();

  const totalSteps = activeScenario.simulatedSteps.length;
  const currentStepData = activeScenario.simulatedSteps[scenarioStep] || activeScenario.simulatedSteps[0];

  return (
    <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-xl p-4 space-y-3 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Scenario Selector & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              Interactive Defensive Scenario Simulator
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Deterministic Seed 42
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeScenario.id}
              onChange={(e) => setActiveScenarioId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-100 font-semibold text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {allScenarios.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-lg border border-zinc-800 shrink-0">
          {isScenarioRunning ? (
            <button
              onClick={pauseScenario}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={resumeScenario}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>{scenarioStep >= totalSteps - 1 ? 'Replay' : 'Play'}</span>
            </button>
          )}

          <button
            onClick={stepForward}
            disabled={scenarioStep >= totalSteps - 1}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-medium transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          <button
            onClick={restartScenario}
            className="flex items-center gap-1 px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            title="Restart Scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="px-2 font-mono text-[11px] text-zinc-400 border-l border-zinc-800">
            Step <strong className="text-cyan-300">{scenarioStep + 1}</strong> of {totalSteps}
          </div>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-rose-500 h-full transition-all duration-300"
          style={{ width: `${((scenarioStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Detail Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
        <div className="space-y-1">
          <span className="text-zinc-400 text-[10px] uppercase font-mono block">Current Simulated Action:</span>
          <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 font-mono">
            <span className="text-cyan-400">[{currentStepData.sourceAgent} ➔ {currentStepData.targetAgent}]</span>
            <span>{currentStepData.title}</span>
          </h4>
          <p className="text-[11px] text-zinc-300">{currentStepData.description}</p>
        </div>

        <div className="space-y-1">
          <span className="text-zinc-400 text-[10px] uppercase font-mono block">Expected Scientific Detection:</span>
          <p className="text-[11px] text-zinc-300 leading-relaxed">{activeScenario.expectedDetection}</p>
        </div>

        <div className="space-y-1">
          <span className="text-zinc-400 text-[10px] uppercase font-mono block">Simulated Detection & Explanation:</span>
          <p className="text-[11px] text-cyan-300 leading-relaxed font-sans">{activeScenario.resultExplanation}</p>
        </div>
      </div>
    </div>
  );
};
