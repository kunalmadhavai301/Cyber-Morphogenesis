import React, { useState } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { AgentIncident } from '../../types/agentSecurity';
import { 
  FileText, 
  Download, 
  ShieldAlert, 
  Activity, 
  Clock, 
  GitFork, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  FileCode,
  Edit3
} from 'lucide-react';

export const IncidentInvestigationWorkspace: React.FC = () => {
  const { incidents, selectedIncident, setSelectedIncidentId, updateAnalystNotes } = useAgentSecurity();
  const [activePhase, setActivePhase] = useState<string>('detection');

  const currentInc = selectedIncident || incidents[0];

  const phases = [
    { id: 'detection', label: '1. Initial Detection' },
    { id: 'evidence', label: '2. Evidence Collection' },
    { id: 'causal', label: '3. Causal Investigation' },
    { id: 'impact', label: '4. Impact Estimation' },
    { id: 'intervention', label: '5. Intervention Selection' },
    { id: 'containment', label: '6. Containment' },
    { id: 'recovery', label: '7. Verification & Recovery' }
  ];

  // Export JSON Report
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentInc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentInc.incidentId}-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['IncidentID', 'DetectionTime', 'SuspectedAgent', 'Category', 'Severity', 'BlastRadiusScore', 'ReachableAgents', 'AppliedIntervention', 'RecoveryStatus'];
    const row = [
      currentInc.incidentId,
      currentInc.detectionTime,
      `"${currentInc.suspectedAgentName}"`,
      currentInc.category,
      currentInc.severity,
      currentInc.propagationAnalysis.blastRadiusScore,
      currentInc.propagationAnalysis.reachableCount,
      currentInc.appliedInterventionId,
      currentInc.recoveryStatus
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), row.join(',')].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `${currentInc.incidentId}-report.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Security Incident Investigation Workspace
              <span className="text-xs font-mono font-normal text-cyan-400">
                ({currentInc.incidentId})
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              End-to-end multi-agent forensic timeline, causal coordination audit, and exportable compliance reports.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Incident Selection Dropdown if multiple */}
      <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 text-xs">
        <span className="text-zinc-400">Active Incident Case:</span>
        <select
          value={currentInc.incidentId}
          onChange={(e) => setSelectedIncidentId(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-cyan-300 font-mono text-xs px-2 py-0.5 rounded focus:outline-none"
        >
          {incidents.map(inc => (
            <option key={inc.incidentId} value={inc.incidentId}>
              {inc.incidentId} - {inc.suspectedAgentName} ({inc.category})
            </option>
          ))}
        </select>
      </div>

      {/* Investigation Stepper Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {phases.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePhase(p.id)}
            className={`px-3 py-1.5 rounded-md font-mono text-[11px] whitespace-nowrap transition-colors border ${
              activePhase === p.id 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 font-bold' 
                : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Investigation Details Card */}
      <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3.5 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
          <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
            <span className="text-zinc-400 block text-[10px]">Suspected Node</span>
            <span className="text-zinc-200 font-bold">{currentInc.suspectedAgentName}</span>
          </div>
          <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
            <span className="text-zinc-400 block text-[10px]">Detection Timestamp</span>
            <span className="text-zinc-300">{currentInc.detectionTime}</span>
          </div>
          <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
            <span className="text-zinc-400 block text-[10px]">Blast Radius Score</span>
            <span className="text-rose-400 font-bold">{currentInc.propagationAnalysis.blastRadiusScore}%</span>
          </div>
          <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
            <span className="text-zinc-400 block text-[10px]">Forensic Status</span>
            <span className="text-emerald-400 font-bold uppercase">{currentInc.recoveryStatus}</span>
          </div>
        </div>

        {/* Phase-specific detail preview */}
        <div className="space-y-1.5 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
          <span className="font-semibold text-zinc-200 block text-xs">Initial Trigger & Telemetry Snippet:</span>
          <p className="text-zinc-300 font-mono text-[11px]">{currentInc.initialEvent}</p>
          <div className="bg-zinc-950 p-2 rounded text-[11px] font-mono text-cyan-300 border border-zinc-800">
            {currentInc.communicationHistorySnippet}
          </div>
        </div>

        {/* Causal relationships identified */}
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-zinc-200">Reconstructed Causal Edges:</span>
          <div className="space-y-1">
            {currentInc.candidateCausalRelationships.map((edge, i) => (
              <div key={i} className="bg-zinc-900/60 px-2.5 py-1.5 rounded font-mono text-[11px] text-cyan-300 border border-zinc-800 flex items-center gap-2">
                <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                <span>{edge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analyst Notes Editor */}
        <div className="space-y-1.5 pt-1">
          <label className="font-semibold text-zinc-300 flex items-center gap-1.5 text-xs">
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            SOC Analyst Investigation Notes:
          </label>
          <textarea
            value={currentInc.analystNotes}
            onChange={(e) => updateAnalystNotes(currentInc.incidentId, e.target.value)}
            rows={3}
            placeholder="Document forensic findings, root cause hypotheses, and containment justifications..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-zinc-200 text-xs font-sans focus:outline-none focus:border-cyan-500 leading-relaxed"
          />
        </div>

        {/* Disclaimer Note */}
        <p className="text-[10px] text-zinc-400 italic">
          * Scientific Disclaimer: This investigation workspace demonstrates explainable causal containment on synthetic telemetry. 
          It does not claim to conclusively attribute malicious human intent from simulated telemetry alone.
        </p>
      </div>
    </div>
  );
};
