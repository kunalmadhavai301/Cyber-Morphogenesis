import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  ReferenceLine,
  Line
} from 'recharts';
import { TABLE_IV_DEFENSE_POLICIES } from '../../data/paperData';
import { ShieldCheck, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

export const ParetoTradeoffChart: React.FC = () => {
  const { mode, activePolicy, setActivePolicyId } = useSimulation();

  const data = TABLE_IV_DEFENSE_POLICIES.map(p => {
    const isPaper = mode === 'paper';
    const metrics = isPaper ? p.paperReported : p.simulationSample;
    return {
      id: p.id,
      name: p.name,
      doCalculus: p.doCalculus,
      sdr: metrics.sdr,
      asr: metrics.asr,
      ttc: metrics.ttc,
      affected: metrics.affectedHosts,
      isParetoOptimal: p.id === 'p1' || p.id === 'p3' || p.id === 'p5',
      isDominated: p.id === 'p2' || p.id === 'p4',
      unfavorableNote: p.paperReported.unfavorableNote,
      isActive: p.id === activePolicy.id
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-zinc-950 border border-zinc-700 p-3 rounded-lg shadow-xl text-xs font-mono space-y-1.5 max-w-xs">
          <div className="font-bold text-zinc-100 border-b border-zinc-800 pb-1">
            {d.name}
          </div>
          <div className="text-[11px] text-cyan-400">
            Formulation: <code>{d.doCalculus}</code>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-zinc-400">Attack Success:</span>
              <div className="font-bold text-rose-400 text-sm">{d.asr.toFixed(2)}%</div>
            </div>
            <div>
              <span className="text-zinc-400">Service Disruption:</span>
              <div className="font-bold text-amber-400 text-sm">{d.sdr.toFixed(2)}%</div>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400">
            Affected: <strong>{d.affected}</strong> hosts | TTC: <strong>{d.ttc}s</strong>
          </div>
          {d.isDominated && (
            <div className="text-[10px] text-rose-300 bg-rose-500/10 p-1 rounded border border-rose-500/20 flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400 mt-0.5" />
              <span>Pareto Dominated: Worse ASR and higher operational disruption than baseline.</span>
            </div>
          )}
          {d.id === 'p5' && (
            <div className="text-[10px] text-emerald-300 bg-emerald-500/10 p-1 rounded border border-emerald-500/20 flex items-start gap-1">
              <ShieldCheck className="w-3 h-3 shrink-0 text-emerald-400 mt-0.5" />
              <span>Pareto Frontier: Optimal security-vs-availability balance.</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
      {/* Title & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            Counterfactual Pareto Optimization Frontier
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 font-mono">
              ASR vs. SDR Trade-Off
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            X-axis: Service Disruption Rate (SDR %) — Y-axis: Attack Success Rate (ASR %, lower is better)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Pareto Optimal
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Dominated / Rerouted
          </span>
        </div>
      </div>

      {/* Recharts Scatter Plot */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              type="number" 
              dataKey="sdr" 
              name="Service Disruption Rate" 
              unit="%" 
              domain={[0, 25]}
              stroke="#71717a"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
            />
            <YAxis 
              type="number" 
              dataKey="asr" 
              name="Attack Success Rate" 
              unit="%" 
              domain={[5, 32]}
              stroke="#71717a"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
            />
            <ZAxis range={[120, 250]} />
            <Tooltip content={<CustomTooltip />} />

            {/* Baseline threshold line */}
            <ReferenceLine y={27.00} stroke="#71717a" strokeDasharray="4 4" label={{ value: 'Baseline ASR (27%)', fill: '#71717a', fontSize: 10, position: 'right' }} />

            <Scatter 
              name="Defensive Policies" 
              data={data} 
              onClick={(node: any) => {
                if (node && node.id) setActivePolicyId(node.id);
              }}
              className="cursor-pointer"
            >
              {data.map((entry, index) => {
                let fill = '#34d399'; // Optimal green
                if (entry.isDominated) fill = '#f43f5e'; // Dominated red
                if (entry.id === activePolicy.id) fill = '#22d3ee'; // Selected cyan
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fill} 
                    stroke={entry.id === activePolicy.id ? '#ffffff' : '#09090b'}
                    strokeWidth={entry.id === activePolicy.id ? 3 : 1.5}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Scientific Rationale Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 font-mono">
        <div className="p-3 rounded-lg bg-zinc-950/80 border border-rose-500/30 text-rose-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DMZ Host 1 Isolation Failure (Table IV)</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Isolating DMZ Host 1 yields <strong>ASR = 29.00%</strong> (worse than baseline 27.00%) with <strong>9.98% SDR</strong>. The adversary adaptively reroutes lateral movement via Web Server 2 and Auth Proxy without encountering gateway choke-point throttling.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950/80 border border-emerald-500/30 text-emerald-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Joint Morphogenesis Defense Optimality</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Policy 5 achieves <strong>ASR = 9.60%</strong> (17.40 pp absolute drop, <strong>64.44% relative reduction</strong>) while maintaining <strong>SDR = 5.01%</strong>, proving that combining ingress choke-point throttling with selective isolation is Pareto-superior to naively cutting off internal hosts.
          </p>
        </div>
      </div>
    </div>
  );
};
