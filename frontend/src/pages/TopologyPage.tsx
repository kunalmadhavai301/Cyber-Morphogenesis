import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { NetworkGraph } from '../components/topology/NetworkGraph';
import { NodeInspector } from '../components/topology/NodeInspector';
import { EdgeInspector } from '../components/topology/EdgeInspector';
import { AttackTimelineControls } from '../components/topology/AttackTimelineControls';
import { 
  Network, 
  Layers, 
  ShieldCheck, 
  Activity, 
  HelpCircle, 
  Cpu,
  Info
} from 'lucide-react';

export const TopologyPage: React.FC = () => {
  const { 
    selectedNode, 
    selectedEdge, 
    graphViewMode, 
    activePolicy, 
    nodes, 
    edges 
  } = useSimulation();

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            Dynamic Cyber Network Explorer
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-zinc-800 text-cyan-300 border border-zinc-700">
              32 Nodes • 5 Functional Subnets
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Attributed temporal multigraph G_t = (V_t, E_t, X_t, W_t) with real-time multi-agent attack playback and counterfactual surgery
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            Active Policy: <strong className="text-cyan-400">{activePolicy.name}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Graph + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Network Graph Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <NetworkGraph />
          <AttackTimelineControls />
        </div>

        {/* Right 1 col: Node or Edge Inspector */}
        <div className="lg:col-span-1 space-y-4">
          {selectedEdge ? (
            <EdgeInspector edge={selectedEdge} />
          ) : (
            <NodeInspector node={selectedNode} />
          )}

          {/* Graph View Mode Explanation Card */}
          <div className="glass-panel p-4 rounded-xl border border-zinc-800 text-xs font-mono space-y-2">
            <div className="text-[11px] font-bold text-zinc-200 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current View Mode:</span>
            </div>
            {graphViewMode === 'telemetry' && (
              <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                <strong className="text-zinc-200">Mode A (Raw Telemetry):</strong> Shows all observed synthetic NetFlow connections, packet streams, and raw volumetric flows.
              </p>
            )}
            {graphViewMode === 'correlation' && (
              <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                <strong className="text-amber-300">Mode B (Correlation Graph):</strong> Highlights statistical correlations. Notice dashed warning links: volumetric DDoS floods create strong Pearson correlations with innocent nodes (spurious non-causal associations).
              </p>
            )}
            {graphViewMode === 'causal' && (
              <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
                <strong className="text-cyan-300">Mode C (Causal DAG):</strong> Shows only edges verified by time-lagged VAR conditional independence tests under Benjamini-Hochberg FDR control (SHD = 15). Spurious associations are rejected.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
