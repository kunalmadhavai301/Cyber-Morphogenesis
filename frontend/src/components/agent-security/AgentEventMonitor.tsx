import React, { useState, useMemo } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { AgentCommunicationEvent, EventCategory, SeverityLevel, PolicyDecision } from '../../types/agentSecurity';
import { 
  Radio, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  AlertTriangle,
  X,
  FileText,
  Lock,
  Layers
} from 'lucide-react';

export const AgentEventMonitor: React.FC = () => {
  const { 
    events, 
    selectedEvent, 
    setSelectedEvent,
    severityFilter,
    setSeverityFilter,
    agentFilter,
    setAgentFilter,
    categoryFilter,
    setCategoryFilter,
    policyFilter,
    setPolicyFilter,
    eventSearchQuery,
    setEventSearchQuery,
    agents
  } = useAgentSecurity();

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesSeverity = severityFilter === 'all' || evt.severity === severityFilter;
      const matchesAgent = agentFilter === 'all' || evt.sourceAgent === agentFilter || evt.destinationAgent === agentFilter;
      const matchesCategory = categoryFilter === 'all' || evt.category === categoryFilter;
      const matchesPolicy = policyFilter === 'all' || evt.policyDecision === policyFilter;
      const matchesSearch = eventSearchQuery === '' || 
        evt.detectionReason.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
        evt.messageType.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
        evt.eventId.toLowerCase().includes(eventSearchQuery.toLowerCase());

      return matchesSeverity && matchesAgent && matchesCategory && matchesPolicy && matchesSearch;
    });
  }, [events, severityFilter, agentFilter, categoryFilter, policyFilter, eventSearchQuery]);

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'info': return 'bg-blue-950/80 text-blue-400 border-blue-600/40';
      case 'warning': return 'bg-amber-950/80 text-amber-400 border-amber-600/40';
      case 'high': return 'bg-orange-950/80 text-orange-400 border-orange-600/40';
      case 'critical': return 'bg-rose-950/80 text-rose-400 border-rose-600/40';
    }
  };

  const getPolicyBadge = (dec: PolicyDecision) => {
    switch (dec) {
      case 'allowed': return 'bg-emerald-950/80 text-emerald-400 border-emerald-600/40';
      case 'denied': return 'bg-rose-950/80 text-rose-400 border-rose-600/40';
      case 'requires_approval': return 'bg-purple-950/80 text-purple-400 border-purple-600/40';
      case 'rate_limited': return 'bg-amber-950/80 text-amber-400 border-amber-600/40';
      case 'quarantined': return 'bg-cyan-950/80 text-cyan-400 border-cyan-600/40';
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Agent Communication Monitor
              <span className="text-xs font-mono font-normal text-cyan-400">
                ({filteredEvents.length} Captured Events)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Live audit stream monitoring 14 event categories across all inter-agent messages, tool invocations, and policy verdicts.
            </p>
          </div>
        </div>

        {/* Global event search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2" />
          <input
            type="text"
            placeholder="Search events, payloads, reasons..."
            value={eventSearchQuery}
            onChange={(e) => setEventSearchQuery(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-md pl-7 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none w-56 sm:w-64"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Severity */}
        <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
          <span className="text-zinc-500 text-[10px]">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-zinc-300 text-xs focus:outline-none flex-1"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Agent Filter */}
        <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
          <span className="text-zinc-500 text-[10px]">Agent:</span>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="bg-transparent text-zinc-300 text-xs focus:outline-none flex-1 font-mono"
          >
            <option value="all">All Agents</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
          <span className="text-zinc-500 text-[10px]">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-zinc-300 text-xs focus:outline-none flex-1"
          >
            <option value="all">All 14 Categories</option>
            <option value="normal_delegation">Normal Delegation</option>
            <option value="unexpected_communication">Unexpected Comm</option>
            <option value="unauthorized_tool_requests">Unauthorized Tools</option>
            <option value="unusual_message_frequency">Unusual Frequency</option>
            <option value="agent_loops_runaway_delegation">Runaway Loop</option>
            <option value="attempt_bypass_approval">Approval Bypass</option>
            <option value="suspicious_instruction_propagation">Instruction Propagation</option>
          </select>
        </div>

        {/* Policy Decision */}
        <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
          <span className="text-zinc-500 text-[10px]">Verdict:</span>
          <select
            value={policyFilter}
            onChange={(e) => setPolicyFilter(e.target.value)}
            className="bg-transparent text-zinc-300 text-xs focus:outline-none flex-1 font-mono"
          >
            <option value="all">All Decisions</option>
            <option value="allowed">Allowed</option>
            <option value="denied">Denied</option>
            <option value="requires_approval">Requires Approval</option>
            <option value="rate_limited">Rate Limited</option>
            <option value="quarantined">Quarantined</option>
          </select>
        </div>
      </div>

      {/* Events Stream Table */}
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No events match the current filter criteria.
          </div>
        ) : (
          filteredEvents.map(evt => {
            const isSelected = selectedEvent?.eventId === evt.eventId;
            return (
              <div
                key={evt.eventId}
                onClick={() => setSelectedEvent(evt)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-zinc-900 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30' 
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-cyan-400 font-bold">{evt.eventId}</span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-200 font-bold">{evt.sourceAgent}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-200 font-bold">{evt.destinationAgent}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {evt.messageType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase border ${getSeverityBadge(evt.severity)}`}>
                      {evt.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase border ${getPolicyBadge(evt.policyDecision)}`}>
                      {evt.policyDecision.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-300 mt-2 line-clamp-1">
                  {evt.detectionReason}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 pt-1 border-t border-zinc-900 font-mono">
                  <span>Category: <strong className="text-zinc-400">{evt.category}</strong></span>
                  <span>Causal Status: <strong className={evt.causalStatus === 'verified' ? 'text-cyan-400' : 'text-zinc-400'}>{evt.causalStatus}</strong></span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Event Details Drawer */}
      {selectedEvent && (
        <div className="bg-zinc-950 p-4 rounded-xl border border-cyan-500/40 space-y-3 relative text-xs">
          <button
            onClick={() => setSelectedEvent(null)}
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-100 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-300 font-bold">{selectedEvent.eventId} Full Telemetry Audit:</span>
            <span className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase font-bold border ${getPolicyBadge(selectedEvent.policyDecision)}`}>
              Verdict: {selectedEvent.policyDecision}
            </span>
          </div>

          <p className="text-zinc-200 text-xs leading-relaxed font-sans">
            {selectedEvent.detectionReason}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-300 bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
            <div>
              <span className="text-zinc-400 block text-[10px]">Classification</span>
              <span>{selectedEvent.contentClassification}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Tool Requested</span>
              <span className="text-cyan-300">{selectedEvent.toolRequested || 'None'}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Correlation ID</span>
              <span>{selectedEvent.correlationId}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Causal Proof</span>
              <span className="text-emerald-400">{selectedEvent.causalStatus}</span>
            </div>
          </div>

          <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800 text-[11px]">
            <span className="font-semibold text-zinc-300 block mb-0.5">Recommended Response:</span>
            <p className="text-cyan-300 font-sans">{selectedEvent.recommendedResponse}</p>
          </div>
        </div>
      )}
    </div>
  );
};
