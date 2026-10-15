import React, { useState } from 'react';
import { TABLE_VI_NAT_SWEEP } from '../../data/paperData';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { Sliders, ShieldCheck, AlertTriangle, Layers, Shuffle } from 'lucide-react';

export const NatCrossoverChart: React.FC = () => {
  const [sliderK, setSliderK] = useState<number>(4);
  const [showInterpolation, setShowInterpolation] = useState<boolean>(true);

  const chartData = TABLE_VI_NAT_SWEEP
    .filter(row => showInterpolation || !row.isIntermediate)
    .map(row => ({
      k: row.k,
      label: `k=${row.k}`,
      'Node Degree AUC [2]': row.nodeDegreeAuc,
      'Edge Weight AUC [2]': row.edgeWeightAuc,
      'Causal Discovery AUC (Ours)': row.causalDiscoveryAuc,
      isIntermediate: row.isIntermediate
    }));

  // Find closest point to slider
  const currentRecord = TABLE_VI_NAT_SWEEP.reduce((prev, curr) => 
    Math.abs(curr.k - sliderK) < Math.abs(prev.k - sliderK) ? curr : prev
  );

  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            Table VI: Sensitivity to NAT Identity Collapse Ratio (k)
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-mono">
              RQ4 Separation AUC
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Empirical confirmation of Hasibuzzaman [2] crossover phenomenon vs. Causal Discovery invariance
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={showInterpolation}
              onChange={(e) => setShowInterpolation(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span>Show Interpolated Range (k=32)</span>
          </label>
        </div>
      </div>

      {/* Multi-Line Crossover Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="label" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis domain={[0.45, 1.02]} stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} 
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

            {/* Failure Trough Shaded Area */}
            <ReferenceArea x1="k=2" x2="k=8" stroke="#f43f5e" strokeOpacity={0.2} fill="#f43f5e" fillOpacity={0.06} />

            <Line 
              type="monotone" 
              dataKey="Causal Discovery AUC (Ours)" 
              stroke="#22d3ee" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#22d3ee' }} 
            />
            <Line 
              type="monotone" 
              dataKey="Edge Weight AUC [2]" 
              stroke="#fb923c" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#fb923c' }} 
            />
            <Line 
              type="monotone" 
              dataKey="Node Degree AUC [2]" 
              stroke="#818cf8" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#818cf8' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Ratio Slider */}
      <div className="bg-zinc-900/90 p-4 rounded-lg border border-zinc-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Interactive NAT Collapse Slider (k = {sliderK}):
          </span>
          <span className="text-[11px] text-zinc-400">
            {sliderK === 1 
              ? 'Full NAT Collapse (All attackers behind 1 IP)' 
              : sliderK >= 64 
              ? 'Full IP Visibility (No NAT)' 
              : 'Intermediate Crossover Regime'}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="128"
          step="1"
          value={sliderK}
          onChange={(e) => setSliderK(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />

        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>k=1 (Full NAT)</span>
          <span>k=4 (Failure Trough)</span>
          <span>k=16 (Transition)</span>
          <span>k=64 (Dispersed)</span>
          <span>k=128 (Visible)</span>
        </div>

        {/* Current State Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Node Degree AUC</div>
            <div className={`text-base font-bold mt-0.5 ${currentRecord.nodeDegreeAuc > 0.8 ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {currentRecord.nodeDegreeAuc.toFixed(3)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {currentRecord.nodeDegreeAuc < 0.65 ? 'Blind under NAT' : 'High separation'}
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Edge Weight AUC</div>
            <div className={`text-base font-bold mt-0.5 ${currentRecord.edgeWeightAuc < 0.6 ? 'text-rose-400' : 'text-amber-400'}`}>
              {currentRecord.edgeWeightAuc.toFixed(3)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {currentRecord.edgeWeightAuc <= 0.55 ? 'Collapses to chance (0.504)' : 'Preserves volume'}
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded border border-cyan-500/30">
            <div className="text-[10px] text-cyan-400 uppercase font-bold">Causal Discovery AUC</div>
            <div className="text-base font-bold mt-0.5 text-cyan-300">
              {currentRecord.causalDiscoveryAuc.toFixed(3)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              Invariant (0.976–0.986)
            </div>
          </div>
        </div>

        {/* Dynamic Interpretation */}
        <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed font-sans">
          <strong>Regime Diagnosis:</strong> {currentRecord.state}
        </div>
      </div>
    </div>
  );
};
