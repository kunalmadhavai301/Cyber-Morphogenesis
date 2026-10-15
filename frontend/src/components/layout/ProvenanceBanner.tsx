import React, { useState } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { ShieldAlert, Cpu, Info, ChevronDown, ChevronUp, AlertTriangle, Lock } from 'lucide-react';

export const ProvenanceBanner: React.FC = () => {
  const { settings, activeScenario, isScenarioRunning, navigate } = useAgentSecurity();
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="bg-zinc-950/90 border-b border-zinc-800/80 text-xs px-4 py-2 sticky top-14 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 font-mono font-bold text-[10px] border border-cyan-800/60 uppercase">
            <Cpu className="w-3 h-3 text-cyan-400" />
            SIMULATED RESEARCH PLATFORM (SEED 42)
          </span>

          <span className="text-zinc-400 text-[11px] hidden md:inline">
            All multi-agent telemetry, causal linkages, and defensive interventions are simulated for research, testing, and demonstration.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-zinc-400 hidden sm:inline">Active Policy:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
              Zero-Trust Enforcement Active
            </span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-zinc-400 hover:text-cyan-400 flex items-center gap-1 text-[11px] font-mono transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Platform Notice</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Disclaimer Drawer */}
      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-zinc-800 text-zinc-300 text-[11px] leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn">
          <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="font-semibold text-zinc-100 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulated Research & Testing</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              All agent communications, risks, and security events shown on this platform are simulated for research, testing, and demonstration purposes.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="font-semibold text-zinc-100 flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Independent Security Layer</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              The platform demonstrates how an independent AI agent security layer monitors, intercepts, and protects interconnected multi-agent systems.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="font-semibold text-zinc-100 flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>No Production Credentials</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              It does not represent live production data from third-party systems unless explicitly configured in application settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
