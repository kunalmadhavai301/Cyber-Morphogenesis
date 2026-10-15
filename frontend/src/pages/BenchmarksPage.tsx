import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ForecastingChart } from '../components/benchmarks/ForecastingChart';
import { AblationChart } from '../components/benchmarks/AblationChart';
import { DatasetBenchmarkTable } from '../components/benchmarks/DatasetBenchmarkTable';
import { 
  TrendingUp, 
  Layers, 
  Database, 
  Award, 
  Download, 
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

export const BenchmarksPage: React.FC = () => {
  const { mode } = useSimulation();
  const [activeTab, setActiveTab] = useState<'forecasting' | 'ablation' | 'datasets'>('forecasting');

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Experimental Results & Benchmark Suite
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Empirical evaluations: Multi-Horizon Forecasting (Table III), Architectural Ablation (Table V), and Dataset Benchmark Standards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
            Data Source: <strong className={mode === 'paper' ? 'text-emerald-400' : 'text-cyan-400'}>
              {mode === 'paper' ? 'Paper-Reported Results' : 'Interactive Simulation'}
            </strong>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('forecasting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'forecasting'
              ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Multi-Horizon Forecasting (Table III)</span>
        </button>

        <button
          onClick={() => setActiveTab('ablation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'ablation'
              ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ablation Study (Table V)</span>
        </button>

        <button
          onClick={() => setActiveTab('datasets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'datasets'
              ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Public Datasets & CSV Import</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6">
          <ForecastingChart />
        </div>
      )}

      {activeTab === 'ablation' && (
        <div className="space-y-6">
          <AblationChart />
        </div>
      )}

      {activeTab === 'datasets' && (
        <div className="space-y-6">
          <DatasetBenchmarkTable />
        </div>
      )}
    </div>
  );
};
