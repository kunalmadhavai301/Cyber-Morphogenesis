import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { TABLE_III_FORECASTING } from '../../data/paperData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Award, Layers, Zap } from 'lucide-react';

export const ForecastingChart: React.FC = () => {
  const { mode } = useSimulation();
  const [selectedMetric, setSelectedMetric] = useState<'f1' | 'precision' | 'recall'>('f1');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // Chart data formatted for horizons h=1, h=3, h=5
  const chartData = [
    {
      horizon: 'h = 1 Step',
      'C-TGNN (Proposed)': TABLE_III_FORECASTING[0][selectedMetric].h1,
      'Static GCN': TABLE_III_FORECASTING[1][selectedMetric].h1,
      'LSTM': TABLE_III_FORECASTING[2][selectedMetric].h1,
      'Random Walk': TABLE_III_FORECASTING[3][selectedMetric].h1,
    },
    {
      horizon: 'h = 3 Steps',
      'C-TGNN (Proposed)': TABLE_III_FORECASTING[0][selectedMetric].h3,
      'Static GCN': TABLE_III_FORECASTING[1][selectedMetric].h3,
      'LSTM': TABLE_III_FORECASTING[2][selectedMetric].h3,
      'Random Walk': TABLE_III_FORECASTING[3][selectedMetric].h3,
    },
    {
      horizon: 'h = 5 Steps',
      'C-TGNN (Proposed)': TABLE_III_FORECASTING[0][selectedMetric].h5,
      'Static GCN': TABLE_III_FORECASTING[1][selectedMetric].h5,
      'LSTM': TABLE_III_FORECASTING[2][selectedMetric].h5,
      'Random Walk': TABLE_III_FORECASTING[3][selectedMetric].h5,
    }
  ];

  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            Table III: Multi-Horizon Attack Propagation Forecasting
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 font-mono">
              RQ2 (Horizons h = 1, 3, 5)
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Causal-TGNN restricts spatial message passing exclusively along verified causal DAG edges
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-xs font-mono">
            {(['f1', 'precision', 'recall'] as const).map(m => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-2.5 py-1 rounded capitalize transition-all ${
                  selectedMetric === m
                    ? 'bg-zinc-800 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m === 'f1' ? 'F1-Score' : m}
              </button>
            ))}
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 rounded ${chartType === 'bar' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500'}`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-1 rounded ${chartType === 'line' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500'}`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="horizon" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis domain={[0.2, 1.0]} stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="C-TGNN (Proposed)" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Static GCN" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="LSTM" fill="#fb923c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Random Walk" fill="#71717a" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="horizon" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis domain={[0.2, 1.0]} stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="C-TGNN (Proposed)" stroke="#22d3ee" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="Static GCN" stroke="#818cf8" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="LSTM" stroke="#fb923c" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Random Walk" stroke="#71717a" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Degradation Analysis Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        {TABLE_III_FORECASTING.map(model => (
          <div 
            key={model.model}
            className={`p-3 rounded-lg border ${
              model.isProposed 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
                : 'bg-zinc-950/70 border-zinc-800 text-zinc-300'
            }`}
          >
            <div className="text-[10px] text-zinc-400 truncate uppercase">{model.model}</div>
            <div className="text-base font-bold mt-1 text-zinc-100">
              {model.f1.h1.toFixed(3)} <span className="text-[10px] text-zinc-500 font-normal">➔ {model.f1.h5.toFixed(3)}</span>
            </div>
            <div className={`text-[11px] mt-0.5 font-bold ${model.isProposed ? 'text-emerald-400' : 'text-rose-400'}`}>
              Delta: {model.degradationDelta.toFixed(3)} {model.isProposed ? '(Graceful)' : '(Severe)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
