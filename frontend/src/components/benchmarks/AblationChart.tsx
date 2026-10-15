import React, { useState } from 'react';
import { TABLE_V_ABLATION } from '../../data/paperData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  Cell 
} from 'recharts';
import { Layers, ShieldCheck, AlertTriangle } from 'lucide-react';

export const AblationChart: React.FC = () => {
  const [metricKey, setMetricKey] = useState<'f1' | 'asrDrop' | 'falseAlarmRate'>('f1');

  const chartData = TABLE_V_ABLATION.map(item => ({
    name: item.configuration.replace('Framework', '').replace('Cyber Morphogenesis', 'Full Framework').trim(),
    fullName: item.configuration,
    f1: item.f1,
    precision: item.precision,
    recall: item.recall,
    asrDrop: item.asrDrop,
    falseAlarmRate: item.falseAlarmRate,
    deltaF1: item.deltaF1,
    isFull: item.isFull
  }));

  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            Table V: Architectural Ablation Study
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 font-mono">
              Paper-Reported (Table V)
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Systematically isolating Causal Discovery, Temporal Graph Dynamics, and Counterfactual Reasoning
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-xs font-mono">
          <button
            onClick={() => setMetricKey('f1')}
            className={`px-2.5 py-1 rounded transition-colors ${
              metricKey === 'f1' ? 'bg-zinc-800 text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            F1-Score (%)
          </button>
          <button
            onClick={() => setMetricKey('asrDrop')}
            className={`px-2.5 py-1 rounded transition-colors ${
              metricKey === 'asrDrop' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ASR Drop (%)
          </button>
          <button
            onClick={() => setMetricKey('falseAlarmRate')}
            className={`px-2.5 py-1 rounded transition-colors ${
              metricKey === 'falseAlarmRate' ? 'bg-zinc-800 text-rose-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            False Alarm (%)
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
            <YAxis 
              domain={metricKey === 'falseAlarmRate' ? [0, 6] : [40, 100]} 
              stroke="#71717a" 
              tick={{ fill: '#a1a1aa', fontSize: 11 }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} 
            />
            <Bar dataKey={metricKey} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.isFull 
                      ? '#22d3ee' 
                      : metricKey === 'falseAlarmRate' 
                      ? '#f43f5e' 
                      : '#818cf8'
                  } 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Ablation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/60">
              <th className="py-2.5 px-3">Configuration</th>
              <th className="py-2.5 px-3">F1-Score</th>
              <th className="py-2.5 px-3">Precision</th>
              <th className="py-2.5 px-3">Recall</th>
              <th className="py-2.5 px-3">ASR Drop%</th>
              <th className="py-2.5 px-3 text-right">False Alarm Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {TABLE_V_ABLATION.map((row, idx) => (
              <tr 
                key={idx} 
                className={row.isFull ? 'bg-cyan-500/10 font-medium' : 'bg-transparent text-zinc-300'}
              >
                <td className="py-2.5 px-3 font-semibold text-zinc-200">
                  {row.configuration}
                </td>
                <td className="py-2.5 px-3 font-bold text-cyan-400">{row.f1.toFixed(2)}%</td>
                <td className="py-2.5 px-3 text-zinc-300">{row.precision.toFixed(2)}%</td>
                <td className="py-2.5 px-3 text-zinc-300">{row.recall.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">{row.asrDrop.toFixed(2)}%</td>
                <td className="py-2.5 px-3 text-right">
                  <span className={`px-2 py-0.5 rounded font-mono ${
                    row.falseAlarmRate > 1.0 ? 'bg-rose-500/20 text-rose-400' : 'text-zinc-400'
                  }`}>
                    {row.falseAlarmRate.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
