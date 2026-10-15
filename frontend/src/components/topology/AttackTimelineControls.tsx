import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ATTACK_STAGES } from '../../data/attackStages';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Users, 
  Zap,
  Info
} from 'lucide-react';

export const AttackTimelineControls: React.FC = () => {
  const { 
    activeStage, 
    setActiveStage, 
    isPlaying, 
    setIsPlaying, 
    playbackSpeed, 
    setPlaybackSpeed,
    nextStage, 
    prevStage, 
    restartPlayback,
    currentStageData 
  } = useSimulation();

  return (
    <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-4">
      {/* Control Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              Coordinated Multi-Agent Attack Playback
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-cyan-400 font-mono">
                Stage {activeStage} of {ATTACK_STAGES.length - 1}
              </span>
            </h4>
            <div className="text-[11px] text-zinc-400 font-mono">
              Stochastic game simulation (Agent 1 Recon, Agent 2 Infiltration, Agent 3 Volumetric Flood)
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={restartPlayback}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Restart to Step 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={prevStage}
            disabled={activeStage === 0}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 font-medium text-xs flex items-center gap-1.5 transition-colors"
            title={isPlaying ? "Pause Playback" : "Play Timeline"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-cyan-400" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={nextStage}
            disabled={activeStage === ATTACK_STAGES.length - 1}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 ml-1 text-xs">
            {[0.5, 1, 2].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-zinc-800 text-cyan-400 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stepper Dots & Slider */}
      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-1.5">
          {ATTACK_STAGES.map((stg) => {
            const isCurrent = stg.step === activeStage;
            const isPast = stg.step < activeStage;
            return (
              <button
                key={stg.step}
                onClick={() => setActiveStage(stg.step)}
                className={`p-2 rounded-lg text-left transition-all border ${
                  isCurrent
                    ? 'bg-rose-500/15 border-rose-500/50 shadow-glow-rose'
                    : isPast
                    ? 'bg-zinc-900/90 border-zinc-700/80 hover:bg-zinc-800'
                    : 'bg-zinc-950/60 border-zinc-800/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isCurrent ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
                    STEP {stg.step}
                  </span>
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
                </div>
                <div className="text-xs font-semibold text-zinc-200 truncate">
                  {stg.name.split('—')[1] || stg.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
        {/* Left: Stage Overview & Technical Description */}
        <div className="lg:col-span-2 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-zinc-100">{currentStageData.name}</span>
            <span className="text-[11px] text-zinc-400 italic">{currentStageData.subtitle}</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {currentStageData.description}
          </p>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-cyan-300 flex items-start gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span><strong>Technical Dynamic:</strong> {currentStageData.technicalMechanism}</span>
          </div>
        </div>

        {/* Right: Telemetry Live Impact Stats */}
        <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-2 text-xs font-mono">
          <div className="text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800 pb-1">
            Dynamic Telemetry Snapshot
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Affected Hosts:</span>
            <span className="font-bold text-rose-400">{currentStageData.metrics.affectedHosts} / 32</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Total Flow Rate:</span>
            <span className="font-bold text-zinc-200">{currentStageData.metrics.totalVolume.toLocaleString()} KB/s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Top-1 Concentration S_1:</span>
            <span className="font-bold text-cyan-400">{(currentStageData.metrics.top1Concentration * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Normalized Entropy H:</span>
            <span className="font-bold text-amber-400">{currentStageData.metrics.edgeEntropy.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Active Adversary Agents Banner */}
      {currentStageData.activeAgents.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-rose-400" />
            Active Malicious Agents in Current Time Window:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentStageData.activeAgents.map(ag => (
              <div key={ag.id} className="p-2 rounded bg-zinc-900/90 border border-rose-500/20 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <strong className="text-rose-400">{ag.name}</strong>
                  <span className="text-zinc-500">{ag.role}</span>
                </div>
                <div className="text-zinc-300 text-[11px] mt-1 font-mono">
                  {ag.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
