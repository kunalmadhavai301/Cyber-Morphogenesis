import React, { useRef } from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { 
  Sliders, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  RefreshCw, 
  Download, 
  Upload, 
  AlertTriangle, 
  Lock, 
  CheckCircle2,
  FileCode,
  Radio
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    riskThresholds, 
    setRiskThresholds, 
    behaviorWeights, 
    setBehaviorWeights,
    resetSimulation,
    agents,
    connections,
    events,
    auditLogs
  } = useAgentSecurity();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export full platform state to JSON
  const handleExportState = () => {
    const fullState = {
      exportTimestamp: new Date().toISOString(),
      seed: 42,
      settings,
      riskThresholds,
      behaviorWeights,
      agents,
      connections,
      events,
      auditLogs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai-agent-security-state-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import state from JSON
  const handleImportState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.settings) updateSettings(parsed.settings);
          if (parsed.riskThresholds) setRiskThresholds(parsed.riskThresholds);
          if (parsed.behaviorWeights) setBehaviorWeights(parsed.behaviorWeights);
          alert("Simulation parameters and policies imported successfully!");
        } catch (err) {
          alert("Failed to parse configuration file: Invalid JSON format.");
        }
      };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Platform Settings & Security Gateway Parameters
              </h1>
              <p className="text-xs text-zinc-400">
                Tune telemetry engine sampling, autonomous defense triggers, AST sanitization, and deterministic seeds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Reset all settings and simulation state to factory defaults?")) {
                resetSimulation();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Factory Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Simulation Controls & Autonomous Defense */}
        <div className="space-y-5">
          {/* Simulation Engine Tuning */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Simulation Engine Calibration</h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Seed: 42 (PRNG Deterministic)
              </span>
            </div>

            {/* Simulation Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">Trajectory Execution Velocity</span>
                <span className="text-cyan-400 font-mono font-bold">{settings.simulationSpeed}x Speed</span>
              </div>
              <div className="flex items-center gap-2">
                {[0.5, 1.0, 2.0, 5.0].map(speed => (
                  <button
                    key={speed}
                    onClick={() => updateSettings({ simulationSpeed: speed })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                      settings.simulationSpeed === speed
                        ? 'bg-cyan-600 border-cyan-400 text-zinc-950 font-bold shadow-glow-cyan'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Containment Engine */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-zinc-200">Autonomous Causal Containment</div>
                  <div className="text-[11px] text-zinc-400">
                    Automatically isolate or throttle agents when composite risk exceeds Critical cutoff
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ autoContainmentEnabled: !settings.autoContainmentEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                    settings.autoContainmentEnabled
                      ? 'bg-emerald-600 border-emerald-400'
                      : 'bg-zinc-800 border-zinc-700'
                  }`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.autoContainmentEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* AST Code Sanitization */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-zinc-200">Strict AST Code Sanitization</div>
                  <div className="text-[11px] text-zinc-400">
                    Parse and validate generated Python/Shell scripts before allowing execution gateway dispatch
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ enablePayloadAstSanitization: !settings.enablePayloadAstSanitization })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                    settings.enablePayloadAstSanitization
                      ? 'bg-cyan-600 border-cyan-400'
                      : 'bg-zinc-800 border-zinc-700'
                  }`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.enablePayloadAstSanitization ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Import / Export Platform State */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Configuration Snapshot & Portability</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Export current weights, policies, agent fleet states, and audit records to JSON, or restore a previously saved state.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExportState}
                className="flex-1 py-2 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-700 text-xs font-mono text-cyan-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export State (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-700 text-xs font-mono text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import State (JSON)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportState}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Risk Threshold Cutoffs */}
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Risk Classification Cutoffs</h2>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">0 - 100 Scale</span>
            </div>

            {/* Low Cutoff */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">Low Risk Ceiling</span>
                <span className="font-mono text-zinc-300">{riskThresholds.low}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={riskThresholds.low}
                onChange={(e) => setRiskThresholds(prev => ({ ...prev, low: Number(e.target.value) }))}
                className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[10px] text-zinc-500">Scores below this threshold are marked Nominal / Healthy.</div>
            </div>

            {/* Elevated Cutoff */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-medium">Elevated Risk Ceiling</span>
                <span className="font-mono text-zinc-300">{riskThresholds.elevated}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="70"
                value={riskThresholds.elevated}
                onChange={(e) => setRiskThresholds(prev => ({ ...prev, elevated: Number(e.target.value) }))}
                className="w-full accent-cyan-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[10px] text-zinc-500">Triggers enhanced anomaly observation and telemetry logging.</div>
            </div>

            {/* High Cutoff */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium">High Risk Ceiling</span>
                <span className="font-mono text-zinc-300">{riskThresholds.high}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="85"
                value={riskThresholds.high}
                onChange={(e) => setRiskThresholds(prev => ({ ...prev, high: Number(e.target.value) }))}
                className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[10px] text-zinc-500">Requires dual-key approval on sensitive tools and rate-limits tokens.</div>
            </div>

            {/* Critical Cutoff */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-400 font-medium">Critical Risk Ceiling</span>
                <span className="font-mono text-zinc-300">{riskThresholds.critical}%</span>
              </div>
              <input
                type="range"
                min="85"
                max="98"
                value={riskThresholds.critical}
                onChange={(e) => setRiskThresholds(prev => ({ ...prev, critical: Number(e.target.value) }))}
                className="w-full accent-rose-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[10px] text-zinc-500">Triggers automated causal isolation and severs all outgoing channels.</div>
            </div>
          </div>

          {/* Research & Simulation Disclaimer */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Simulated Evaluation Notice</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              All agent communications, policy evaluations, and risk propagation metrics operate in an isolated synthetic simulation sandbox. No live external production credentials or third-party LLM API keys are called directly by this demonstration interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
