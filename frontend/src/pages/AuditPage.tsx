import React, { useState, useMemo } from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { SecurityAuditLogEntry } from '../types/agentSecurity';
import { 
  FileCode, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Activity, 
  RefreshCw,
  Hash,
  Clock,
  ArrowRight
} from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { auditLogs, resetSimulation, navigate } = useAgentSecurity();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.auditId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.explanation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = eventTypeFilter === 'all' || log.eventType === eventTypeFilter;
      const matchesActor = actorFilter === 'all' || log.actor === actorFilter;
      const matchesOutcome = outcomeFilter === 'all' || log.outcome === outcomeFilter;

      return matchesSearch && matchesType && matchesActor && matchesOutcome;
    });
  }, [auditLogs, searchQuery, eventTypeFilter, actorFilter, outcomeFilter]);

  // Export to JSON
  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `security-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export to CSV
  const exportToCsv = () => {
    const headers = ['AuditID', 'Timestamp', 'Actor', 'EventType', 'Target', 'Outcome', 'Explanation'];
    const rows = filteredLogs.map(l => [
      l.auditId,
      l.timestamp,
      `"${l.actor}"`,
      l.eventType,
      l.target,
      l.outcome,
      `"${l.explanation.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `security-audit-ledger-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Security Audit Logs & Cryptographic Ledger
              </h1>
              <p className="text-xs text-zinc-400">
                Immutable record of all policy decisions, capability mutations, agent isolations, and administrative overrides.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs transition-colors shadow-glow-cyan"
          >
            <span>Platform Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit ID, actor, explanation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 shrink-0">Type:</span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Event Types</option>
            <option value="policy_violation">Policy Violation</option>
            <option value="permission_change">Permission Change</option>
            <option value="containment_action">Containment Action</option>
            <option value="human_approval">Human Approval</option>
            <option value="scenario_transition">Scenario Transition</option>
            <option value="config_change">Config Change</option>
          </select>
        </div>

        {/* Actor Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 shrink-0">Actor:</span>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Actors</option>
            <option value="Policy Gateway">Policy Gateway</option>
            <option value="Auto-Containment Engine">Auto-Containment Engine</option>
            <option value="SOC Lead Analyst">SOC Lead Analyst</option>
            <option value="Agent Identity Registry">Agent Identity Registry</option>
            <option value="Scenario Simulator">Scenario Simulator</option>
          </select>
        </div>

        {/* Outcome Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 shrink-0">Outcome:</span>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Outcomes</option>
            <option value="blocked">Blocked</option>
            <option value="success">Success</option>
            <option value="escalated">Escalated</option>
            <option value="modified">Modified</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Explanation & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 italic">
                    No audit records matching search parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.auditId} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 text-cyan-400 font-bold whitespace-nowrap">
                      {log.auditId}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 text-zinc-200 font-semibold whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-300 uppercase">
                        {log.eventType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-300 whitespace-nowrap">
                      {log.target}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        log.outcome === 'blocked'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : log.outcome === 'success'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : log.outcome === 'escalated'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}>
                        {log.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 max-w-md font-sans text-xs">
                      {log.explanation}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
