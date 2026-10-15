import React from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { IncidentInvestigationWorkspace } from '../components/agent-security/IncidentInvestigationWorkspace';
import { 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { 
    incidents, 
    selectedIncidentId, 
    setSelectedIncidentId,
    navigate,
    resetSimulation
  } = useAgentSecurity();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Incident Response & Forensic Investigation Workspace
              </h1>
              <p className="text-xs text-zinc-400">
                7-stage incident lifecycle management, causal coordination forensic graphs, analyst notes, and JSON/CSV export.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/audit')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <span>Immutable Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Incident Case Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {incidents.map(inc => {
          const isSelected = selectedIncidentId === inc.incidentId;
          return (
            <button
              key={inc.incidentId}
              onClick={() => setSelectedIncidentId(inc.incidentId)}
              className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all shrink-0 ${
                isSelected
                  ? 'bg-zinc-900 border-cyan-500 text-cyan-300 shadow-glow-cyan'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                inc.severity === 'critical' ? 'bg-rose-500' :
                inc.severity === 'high' ? 'bg-amber-500' : 'bg-cyan-500'
              }`} />
              <span className="truncate max-w-[140px]">{inc.suspectedAgentName}: {inc.initialEvent}</span>
            </button>
          );
        })}
      </div>

      {/* 7-Stage Timeline, Causal Forensic Graph & Analyst Notes */}
      <IncidentInvestigationWorkspace />
    </div>
  );
};
