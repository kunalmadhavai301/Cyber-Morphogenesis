import React from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { AgentNetworkGraph } from '../components/agent-security/AgentNetworkGraph';
import { AgentInspector } from '../components/agent-security/AgentInspector';
import { EdgeInspector } from '../components/agent-security/EdgeInspector';
import { 
  GitFork, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Info, 
  Sliders, 
  ArrowRight,
  RefreshCw,
  Search,
  Eye
} from 'lucide-react';

export const AgentNetworkPage: React.FC = () => {
  const { 
    agents, 
    connections, 
    selectedAgentId, 
    selectedEdgeId,
    navigate,
    resetSimulation
  } = useAgentSecurity();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Interactive Multi-Agent Communication Graph
              </h1>
              <p className="text-xs text-zinc-400">
                Visualizing inter-agent message flows, causal coordination vectors, and isolated subgraphs in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => resetSimulation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset Layout</span>
          </button>
          <button
            onClick={() => navigate('/propagation')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-semibold text-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Propagation Blast Radius</span>
          </button>
        </div>
      </div>

      {/* Network Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-200">Autonomous Topology Studio</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  ({agents.length} Nodes &bull; {connections.length} Channels)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                <span>Click Node to Inspect</span>
                <span>&bull;</span>
                <span>Click Line to Inspect Channel</span>
              </div>
            </div>

            {/* SVG Agent Network Graph with hitboxes and inspector overlays */}
            <AgentNetworkGraph />
          </div>

          {/* Topology Legend & Guidance */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-glow-emerald"></span>
              <span className="text-zinc-300 text-[11px]">Normal / Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-zinc-300 text-[11px]">Elevated / Suspicious</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-glow-rose"></span>
              <span className="text-zinc-300 text-[11px]">Critical / Isolated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
              <span className="text-zinc-300 text-[11px]">Active Stream</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zinc-600"></span>
              <span className="text-zinc-300 text-[11px]">Throttled Channel</span>
            </div>
          </div>
        </div>

        {/* Side Inspector (Node or Edge) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedEdgeId ? (
            <div className="sticky top-20">
              <EdgeInspector />
            </div>
          ) : (
            <div className="sticky top-20">
              <AgentInspector />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
