import React, { useState, useMemo } from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { AIAgent, AgentRole, AgentState, AgentPermissionProfile } from '../types/agentSecurity';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Activity, 
  Cpu, 
  Check, 
  X, 
  Sliders, 
  ArrowRight,
  Database,
  Terminal,
  FileCode,
  Globe,
  Radio,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AgentInspector } from '../components/agent-security/AgentInspector';

export const AgentsPage: React.FC = () => {
  const { 
    agents, 
    connections, 
    createAgent, 
    updateAgent, 
    removeAgent, 
    isolateAgent, 
    restrictAgent, 
    quarantineAgent, 
    recoverAgent, 
    toggleAgentPermission,
    selectedAgentId,
    setSelectedAgentId,
    calculateAgentRiskScore,
    getRiskClassification,
    navigate
  } = useAgentSecurity();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'risk_desc' | 'risk_asc' | 'name' | 'comm'>('risk_desc');

  // Modal State for New Agent
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<AgentRole>('analysis');
  const [newAgentModel, setNewAgentModel] = useState('Claude-3.5-Sonnet');
  const [newAgentDescription, setNewAgentDescription] = useState('');
  const [newAgentTools, setNewAgentTools] = useState<string[]>(['web_search']);
  const [newPermissions, setNewPermissions] = useState<Partial<AgentPermissionProfile>>({
    canReadDocuments: true,
    canReadDatasets: true,
    canRequestTools: true,
    canExecuteWorkflowSteps: false,
    canWriteOutput: true,
    canAccessExternalAPI: false
  });

  // Filtered & Sorted Agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.roleDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.allowedTools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'all' || agent.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || agent.currentStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'risk_desc') {
        return calculateAgentRiskScore(b) - calculateAgentRiskScore(a);
      }
      if (sortBy === 'risk_asc') {
        return calculateAgentRiskScore(a) - calculateAgentRiskScore(b);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.communicationCount - a.communicationCount;
    });
  }, [agents, searchQuery, roleFilter, statusFilter, sortBy, calculateAgentRiskScore]);

  // Roles for filter dropdown
  const allRoles: AgentRole[] = [
    'orchestrator', 'planner', 'research', 'analysis', 
    'coding', 'tool_execution', 'data', 'verification', 'memory', 'reporting'
  ];

  // Tool choices for modal
  const availableTools = [
    'web_search', 'python_interpreter', 'sql_executor', 'bash_runner', 
    'git_cli', 'document_parser', 'vector_search', 'docker_socket'
  ];

  const handleCreateAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    createAgent({
      name: newAgentName,
      role: newAgentRole,
      roleDescription: newAgentDescription || `Specialized ${newAgentRole} agent running on ${newAgentModel}`,
      allowedTools: newAgentTools,
      permissionProfile: {
        canReadDocuments: !!newPermissions.canReadDocuments,
        canReadDatasets: !!newPermissions.canReadDatasets,
        canSendMessagesTo: ['orch-01'],
        canRequestTools: !!newPermissions.canRequestTools,
        allowedTools: newAgentTools,
        canExecuteWorkflowSteps: !!newPermissions.canExecuteWorkflowSteps,
        canWriteOutput: !!newPermissions.canWriteOutput,
        canAccessExternalAPI: !!newPermissions.canAccessExternalAPI,
        dataScopes: ['internal_tasks']
      }
    });

    // Reset and close
    setNewAgentName('');
    setNewAgentDescription('');
    setNewAgentTools(['web_search']);
    setIsCreateModalOpen(false);
  };

  const toggleModalTool = (tool: string) => {
    setNewAgentTools(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                AI Agent Fleet Management
              </h1>
              <p className="text-xs text-zinc-400">
                Register, configure, monitor, and enforce least-privilege boundaries across all autonomous agents.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-semibold text-xs transition-colors shadow-glow-cyan"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Agent</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & Controls Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agents by name, ID, tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter by Role */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 shrink-0">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Roles ({agents.length})</option>
            {allRoles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All States</option>
            <option value="healthy">Healthy</option>
            <option value="observing">Observing</option>
            <option value="suspicious">Suspicious</option>
            <option value="restricted">Restricted</option>
            <option value="isolated">Isolated</option>
            <option value="recovering">Recovering</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 shrink-0">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="risk_desc">Risk: Highest First</option>
            <option value="risk_asc">Risk: Lowest First</option>
            <option value="name">Agent Name</option>
            <option value="comm">Message Volume</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Agent Fleet Cards + Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Agent Cards Grid */}
        <div className={selectedAgentId ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map(agent => {
              const risk = calculateAgentRiskScore(agent);
              const classification = getRiskClassification(risk);
              const isSelected = selectedAgentId === agent.id;

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(isSelected ? null : agent.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected 
                      ? 'bg-zinc-900 border-cyan-500 shadow-glow-cyan' 
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Top Bar: Name, Role, Status Pill */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-100">{agent.name}</span>
                        <span className="font-mono text-[10px] text-zinc-400">({agent.id})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-zinc-800 text-cyan-400 border border-zinc-700">
                          {agent.role}
                        </span>
                        <span className="text-[10px] text-zinc-400">Trust: {agent.trustLevel}/100</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                        agent.currentStatus === 'isolated' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        agent.currentStatus === 'restricted' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        agent.currentStatus === 'suspicious' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        agent.currentStatus === 'recovering' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {agent.currentStatus}
                      </span>
                      <div className={`text-xs font-mono font-bold mt-1 ${
                        classification === 'critical' ? 'text-rose-400' :
                        classification === 'high' ? 'text-amber-400' :
                        classification === 'elevated' ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {(risk * 100).toFixed(0)}% Risk
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                    {agent.roleDescription}
                  </p>

                  {/* Active Task */}
                  {agent.activeTask && (
                    <div className="mb-3 p-2 rounded bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300">
                      <span className="text-zinc-500 font-mono text-[10px]">CURRENT GOAL: </span>
                      {agent.activeTask}
                    </div>
                  )}

                  {/* Allowed Tools Pills */}
                  <div className="mb-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Permitted Tools:</span>
                    <div className="flex flex-wrap gap-1">
                      {agent.allowedTools.length === 0 ? (
                        <span className="text-[10px] text-zinc-400 italic">No direct tool access</span>
                      ) : (
                        agent.allowedTools.map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-950 text-zinc-300 border border-zinc-800">
                            {t}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Capability Toggles */}
                  <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-3 gap-1 text-[10px] font-mono">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgentPermission(agent.id, 'canRequestTools');
                      }}
                      className={`p-1 rounded text-center border transition-colors ${
                        agent.permissionProfile.canRequestTools 
                          ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/50' 
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800 line-through'
                      }`}
                    >
                      Tools
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgentPermission(agent.id, 'canAccessExternalAPI');
                      }}
                      className={`p-1 rounded text-center border transition-colors ${
                        agent.permissionProfile.canAccessExternalAPI 
                          ? 'bg-purple-950/40 text-purple-300 border-purple-800/50' 
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800 line-through'
                      }`}
                    >
                      Ext API
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgentPermission(agent.id, 'canExecuteWorkflowSteps');
                      }}
                      className={`p-1 rounded text-center border transition-colors ${
                        agent.permissionProfile.canExecuteWorkflowSteps 
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' 
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800 line-through'
                      }`}
                    >
                      Workflow
                    </button>
                  </div>

                  {/* Action Buttons: Isolate / Restrict / Recover / Delete */}
                  <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {agent.currentStatus !== 'isolated' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isolateAgent(agent.id);
                          }}
                          className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-mono transition-colors"
                        >
                          Isolate
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            recoverAgent(agent.id);
                          }}
                          className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-mono transition-colors"
                        >
                          Recover
                        </button>
                      )}

                      {agent.currentStatus !== 'restricted' && agent.currentStatus !== 'isolated' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            restrictAgent(agent.id);
                          }}
                          className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 text-[10px] font-mono transition-colors"
                        >
                          Restrict
                        </button>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to de-register ${agent.name} (${agent.id})?`)) {
                          removeAgent(agent.id);
                        }
                      }}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="De-register Agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Agent Detailed Inspector */}
        {selectedAgentId && (
          <div className="lg:col-span-4">
            <div className="sticky top-20">
              <AgentInspector />
            </div>
          </div>
        )}
      </div>

      {/* Modal: Provision New Agent */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-zinc-100">Provision New Autonomous Agent</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Security Auditor Agent"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Role Classification</label>
                  <select
                    value={newAgentRole}
                    onChange={(e) => setNewAgentRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    {allRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Underlying LLM Engine</label>
                  <select
                    value={newAgentModel}
                    onChange={(e) => setNewAgentModel(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Claude-3.5-Sonnet">Claude 3.5 Sonnet</option>
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="Llama-3-70B">Llama 3 70B</option>
                    <option value="Gemini-1.5-Pro">Gemini 1.5 Pro</option>
                    <option value="Mistral-Large">Mistral Large</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Role Specification & Prompt Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Describe agent responsibilities and execution boundaries..."
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Permitted Tools</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTools.map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggleModalTool(t)}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between font-mono text-[11px] transition-colors ${
                        newAgentTools.includes(t)
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span>{t}</span>
                      {newAgentTools.includes(t) && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Zero-Trust Capability Profile</label>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canReadDocuments}
                      onChange={(e) => setNewPermissions(p => ({ ...p, canReadDocuments: e.target.checked }))}
                    />
                    <span>Read Documents</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canReadDatasets}
                      onChange={(e) => setNewPermissions(p => ({ ...p, canReadDatasets: e.target.checked }))}
                    />
                    <span>Read Datasets</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canExecuteWorkflowSteps}
                      onChange={(e) => setNewPermissions(p => ({ ...p, canExecuteWorkflowSteps: e.target.checked }))}
                    />
                    <span>Execute Workflow</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canAccessExternalAPI}
                      onChange={(e) => setNewPermissions(p => ({ ...p, canAccessExternalAPI: e.target.checked }))}
                    />
                    <span>External API</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold transition-colors shadow-glow-cyan"
                >
                  Register Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
