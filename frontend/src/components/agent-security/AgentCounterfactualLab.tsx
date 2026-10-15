import React from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { MathEquation } from '../shared/MathEquation';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { 
  ShieldCheck, 
  ShieldX, 
  Sliders, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export const AgentCounterfactualLab: React.FC = () => {
  const { 
    allInterventions, 
    activeIntervention, 
    setActiveInterventionId,
    comparisonIntervention,
    setComparisonInterventionId,
    selectedAgent
  } = useAgentSecurity();

  // Pareto chart dataset
  const chartData = allInterventions.map(int => ({
    id: int.id,
    name: int.name,
    key: int.key,
    disruption: int.operationalDisruption,
    risk: int.residualRisk,
    containmentTime: int.estimatedContainmentTimeSec,
    isOptimal: int.isParetoOptimal,
    isSelected: int.id === activeIntervention.id,
    isComparison: int.id === comparisonIntervention.id
  }));

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-5 shadow-xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Agent Counterfactual Defense Lab
              <span className="text-xs font-mono font-normal text-cyan-400">
                (Pearlian \(do\)-Calculus & Pareto Analysis)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Evaluates prospective graph surgeries to find Pareto-optimal containment balancing threat mitigation against workflow disruption.
            </p>
          </div>
        </div>

        {/* Math notation indicator */}
        <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono text-cyan-300">
          <MathEquation math="\mathcal{M}_{do(X_i = x^*)} \Longrightarrow P(Y \mid do(X_i = x^*))" />
        </div>
      </div>

      {/* Intervention Selector & Policy Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          Available Defensive Interventions (Click to Select Primary):
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
          {allInterventions.map(int => {
            const isSelected = int.id === activeIntervention.id;
            const isComp = int.id === comparisonIntervention.id;
            return (
              <div
                key={int.id}
                onClick={() => setActiveInterventionId(int.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/50' 
                    : isComp
                    ? 'bg-amber-950/40 border-amber-500/50 text-zinc-200'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-1">
                    <span>{int.id.toUpperCase()}</span>
                    {int.isParetoOptimal && (
                      <span className="px-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/40 text-[9px] font-bold">
                        PARETO
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-xs leading-snug line-clamp-1">{int.name}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">{int.description}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 mt-2 border-t border-zinc-800/80">
                  <span className="text-rose-400">Risk: {int.residualRisk}%</span>
                  <span className="text-amber-400">Disrupt: {int.operationalDisruption}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison & Pareto Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Left: Recharts Pareto Frontier Plot */}
        <div className="lg:col-span-6 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 font-mono flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Pareto Trade-Off: Disruption vs. Residual Risk
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Lower-Left is Optimal</span>
          </div>

          <div className="h-[280px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  type="number" 
                  dataKey="disruption" 
                  name="Operational Disruption" 
                  unit="%" 
                  stroke="#71717a"
                  domain={[0, 45]}
                  label={{ value: 'Operational Disruption (%) →', position: 'insideBottom', offset: -10, fill: '#a1a1aa', fontSize: 11 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="risk" 
                  name="Residual Risk" 
                  unit="%" 
                  stroke="#71717a"
                  domain={[0, 90]}
                  label={{ value: 'Residual Security Risk (%) →', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-zinc-950 border border-zinc-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-bold text-white">{data.name}</div>
                        <div className="text-rose-400 font-mono">Residual Risk: {data.risk}%</div>
                        <div className="text-amber-400 font-mono">Operational Disruption: {data.disruption}%</div>
                        <div className="text-cyan-300 font-mono">Containment Time: {data.containmentTime}s</div>
                        <div className={`text-[10px] font-bold ${data.isOptimal ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {data.isOptimal ? '✓ Pareto Optimal Frontier' : '⚠ Suboptimal / Dominated'}
                        </div>
                      </div>
                    );
                  }}
                />
                {/* Reference lines */}
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Safety Target', fill: '#10b981', fontSize: 10 }} />
                <Scatter name="Interventions" data={chartData}>
                  {chartData.map((entry, index) => {
                    let fill = entry.isOptimal ? '#06b6d4' : '#71717a';
                    if (entry.isSelected) fill = '#38bdf8';
                    if (entry.isComparison) fill = '#f59e0b';
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fill} 
                        stroke={entry.isSelected || entry.isComparison ? '#ffffff' : '#000000'}
                        strokeWidth={entry.isSelected || entry.isComparison ? 2 : 1}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Primary Selected</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Comparison Baseline</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-500"></span> Suboptimal Alternative</span>
          </div>
        </div>

        {/* Right: Pairwise Comparison Inspector */}
        <div className="lg:col-span-6 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-zinc-200 font-mono">
              Pairwise Counterfactual Comparison
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 text-[11px]">Compare with:</span>
              <select
                value={comparisonIntervention.id}
                onChange={(e) => setComparisonInterventionId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-amber-300 font-mono text-xs px-2 py-0.5 rounded focus:outline-none"
              >
                {allInterventions.map(int => (
                  <option key={int.id} value={int.id}>{int.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-zinc-400 font-mono text-[11px]">Metric</div>
            <div className="font-bold text-cyan-300 font-mono truncate">{activeIntervention.key.toUpperCase()}</div>
            <div className="font-bold text-amber-300 font-mono truncate">{comparisonIntervention.key.toUpperCase()}</div>

            {/* Row 1: Residual Risk */}
            <div className="text-zinc-300 text-[11px]">Residual Risk</div>
            <div className="font-mono text-cyan-300 font-bold">{activeIntervention.residualRisk}%</div>
            <div className="font-mono text-amber-300 font-bold">{comparisonIntervention.residualRisk}%</div>

            {/* Row 2: Operational Disruption */}
            <div className="text-zinc-300 text-[11px]">Workflow Disruption</div>
            <div className="font-mono text-cyan-300">{activeIntervention.operationalDisruption}%</div>
            <div className="font-mono text-amber-300">{comparisonIntervention.operationalDisruption}%</div>

            {/* Row 3: Containment Time */}
            <div className="text-zinc-300 text-[11px]">Containment Time</div>
            <div className="font-mono text-cyan-300">{activeIntervention.estimatedContainmentTimeSec}s</div>
            <div className="font-mono text-amber-300">{comparisonIntervention.estimatedContainmentTimeSec}s</div>

            {/* Row 4: Workflow Availability */}
            <div className="text-zinc-300 text-[11px]">Workflow Availability</div>
            <div className="font-mono text-cyan-300">{activeIntervention.criticalWorkflowAvailability}%</div>
            <div className="font-mono text-amber-300">{comparisonIntervention.criticalWorkflowAvailability}%</div>

            {/* Row 5: Isolated Agents */}
            <div className="text-zinc-300 text-[11px]">Isolated Agents</div>
            <div className="font-mono text-cyan-300">{activeIntervention.isolatedAgentsCount} nodes</div>
            <div className="font-mono text-amber-300">{comparisonIntervention.isolatedAgentsCount} nodes</div>
          </div>

          {/* Pearlian do-calculus Explanation */}
          <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800 text-xs space-y-1.5">
            <span className="font-semibold text-cyan-300 block">Pearlian \(do\)-Calculus Formulation:</span>
            <div className="font-mono text-[11px] text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-800">
              {activeIntervention.doCalculus}
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Why <strong className="text-zinc-200">Joint Defense</strong> dominates naive isolation: Completely isolating an agent eliminates downstream propagation but drops workflow availability to 64.8%. 
              In contrast, selective permission restriction paired with downstream AST verification achieves 10.6% residual risk with 95.2% availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
