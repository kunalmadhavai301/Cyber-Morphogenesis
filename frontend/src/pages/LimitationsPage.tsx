import React from 'react';
import { LIMITATIONS, FUTURE_DIRECTIONS } from '../data/paperData';
import { MathEquation } from '../components/shared/MathEquation';
import { 
  AlertTriangle, 
  Compass, 
  ShieldAlert, 
  Clock, 
  Server, 
  Cpu, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

export const LimitationsPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Research Limitations & Future Horizons
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section IV-B & IV-C: Explicit scientific caveats, scalability boundaries, and future research roadmap
          </p>
        </div>
      </div>

      {/* The 4 Formal Limitations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">
            Four Key Research Limitations (Section IV-B)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LIMITATIONS.map(lim => (
            <div 
              key={lim.id}
              className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-xs text-zinc-100 font-mono">
                  Limitation {lim.id}: {lim.title}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  lim.severity.includes('High') 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {lim.severity}
                </span>
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center font-mono text-xs overflow-x-auto">
                <MathEquation math={lim.formula} display={true} />
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {lim.description}
              </p>

              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Impact on Defense:</strong> {lim.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The 3 Future Research Directions */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">
            Future Research Directions (Section IV-C)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FUTURE_DIRECTIONS.map(dir => (
            <div 
              key={dir.id}
              className="glass-panel p-5 rounded-xl border border-zinc-800 glass-panel-hover space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-sm text-zinc-100">
                  {dir.title}
                </h3>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  {dir.tagline}
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {dir.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
