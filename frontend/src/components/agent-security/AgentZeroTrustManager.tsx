import React, { useState } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { INDEPENDENT_DEFENSE_LAYER_COMPONENTS } from '../../data/agentSecurityData';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText,
  Layers,
  Cpu,
  Key,
  Server
} from 'lucide-react';

export const AgentZeroTrustManager: React.FC = () => {
  const { agents, selectedAgent, toggleAgentPermission } = useAgentSecurity();
  const [activeTab, setActiveTab] = useState<'matrix' | 'gateway' | 'architecture'>('matrix');

  // Simulated gateway request tester state
  const [testAgentId, setTestAgentId] = useState<string>('code-01');
  const [testCapability, setTestCapability] = useState<string>('spawn_bash_subshell');
  const [simulatedGatewayResult, setSimulatedGatewayResult] = useState<{
    decision: 'allowed' | 'denied' | 'requires_approval' | 'quarantined';
    reason: string;
    matchedRule: string;
  } | null>(null);

  const handleTestGateway = () => {
    const agent = agents.find(a => a.id === testAgentId);
    if (!agent) return;

    if (testCapability.includes('bash') || testCapability.includes('subshell') || testCapability.includes('socket')) {
      setSimulatedGatewayResult({
        decision: 'denied',
        reason: `Capability '${testCapability}' is denied by default least-privilege sandbox profile for role '${agent.role}'.`,
        matchedRule: 'RULE-ZERO-TRUST-001 (Deny Raw Shell / Sockets)'
      });
    } else if (testCapability.includes('raw_db') || testCapability.includes('credentials')) {
      setSimulatedGatewayResult({
        decision: 'requires_approval',
        reason: `Access to sensitive scope '${testCapability}' requires mandatory human SOC authorization.`,
        matchedRule: 'RULE-HUMAN-ESC-004 (Privileged Scope Interception)'
      });
    } else if (agent.currentStatus === 'isolated') {
      setSimulatedGatewayResult({
        decision: 'denied',
        reason: `Agent '${agent.name}' is currently in ISOLATED containment state. All egress packets dropped.`,
        matchedRule: 'RULE-CONTAINMENT-009 (Strict Isolation Drops)'
      });
    } else {
      setSimulatedGatewayResult({
        decision: 'allowed',
        reason: `Capability '${testCapability}' matches agent's approved role permissions and passes Behavior Guard threshold.`,
        matchedRule: 'RULE-LEAST-PRIV-012 (Standard Task Authorization)'
      });
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Zero-Trust Permission & Independent Defense Layer
            </h2>
            <p className="text-xs text-zinc-400">
              Enforces least privilege, central policy enforcement gateway, and architectural isolation from agent self-governance.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'matrix' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Permission Matrix
          </button>
          <button
            onClick={() => setActiveTab('gateway')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'gateway' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Policy Gateway Simulator
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'architecture' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            10-Component Architecture
          </button>
        </div>
      </div>

      {/* Tab 1: Permission Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Least Privilege Capability Matrix across 10 Fleet Agents:</span>
            <span className="font-mono text-[10px]">Click any badge to toggle permission</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-800 rounded-lg overflow-hidden">
              <thead className="bg-zinc-950 text-zinc-400 font-mono text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="p-2.5">Agent / Role</th>
                  <th className="p-2.5 text-center">Docs</th>
                  <th className="p-2.5 text-center">Datasets</th>
                  <th className="p-2.5 text-center">Tools</th>
                  <th className="p-2.5 text-center">Exec Steps</th>
                  <th className="p-2.5 text-center">Write Output</th>
                  <th className="p-2.5 text-center">Ext. API</th>
                  <th className="p-2.5">Containment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/40 font-mono text-[11px]">
                {agents.map(agent => (
                  <tr key={agent.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="p-2.5 font-bold text-zinc-200 font-sans">
                      <div className="font-mono text-cyan-300 text-xs">{agent.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{agent.id} • {agent.role}</div>
                    </td>
                    <td className="p-2.5 text-center">
                      <button 
                        onClick={() => toggleAgentPermission(agent.id, 'canReadDocuments')}
                        className={agent.permissionProfile.canReadDocuments ? 'text-emerald-400 font-bold' : 'text-zinc-400'}
                      >
                        {agent.permissionProfile.canReadDocuments ? 'YES' : 'NO'}
                      </button>
                    </td>
                    <td className="p-2.5 text-center">
                      <button 
                        onClick={() => toggleAgentPermission(agent.id, 'canReadDatasets')}
                        className={agent.permissionProfile.canReadDatasets ? 'text-emerald-400 font-bold' : 'text-zinc-400'}
                      >
                        {agent.permissionProfile.canReadDatasets ? 'YES' : 'NO'}
                      </button>
                    </td>
                    <td className="p-2.5 text-center">
                      <button 
                        onClick={() => toggleAgentPermission(agent.id, 'canRequestTools')}
                        className={agent.permissionProfile.canRequestTools ? 'text-emerald-400 font-bold' : 'text-zinc-400'}
                      >
                        {agent.permissionProfile.canRequestTools ? 'YES' : 'NO'}
                      </button>
                    </td>
                    <td className="p-2.5 text-center">
                      <button 
                        onClick={() => toggleAgentPermission(agent.id, 'canExecuteWorkflowSteps')}
                        className={agent.permissionProfile.canExecuteWorkflowSteps ? 'text-emerald-400 font-bold' : 'text-zinc-400'}
                      >
                        {agent.permissionProfile.canExecuteWorkflowSteps ? 'YES' : 'NO'}
                      </button>
                    </td>
                    <td className="p-2.5 text-center">
                      <button 
                        onClick={() => toggleAgentPermission(agent.id, 'canWriteOutput')}
                        className={agent.permissionProfile.canWriteOutput ? 'text-emerald-400 font-bold' : 'text-zinc-400'}
                      >
                        {agent.permissionProfile.canWriteOutput ? 'YES' : 'NO'}
                      </button>
                    </td>
                    <td className="p-2.5 text-center">
                      <button 
                        onClick={() => toggleAgentPermission(agent.id, 'canAccessExternalAPI')}
                        className={agent.permissionProfile.canAccessExternalAPI ? 'text-emerald-400 font-bold' : 'text-zinc-400'}
                      >
                        {agent.permissionProfile.canAccessExternalAPI ? 'YES' : 'NO'}
                      </button>
                    </td>
                    <td className="p-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        agent.currentStatus === 'healthy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' :
                        agent.currentStatus === 'suspicious' ? 'bg-amber-950 text-amber-400 border border-amber-600' :
                        agent.currentStatus === 'isolated' ? 'bg-rose-950 text-rose-400 border border-rose-600' :
                        'bg-cyan-950 text-cyan-400 border border-cyan-600'
                      }`}>
                        {agent.currentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Policy Gateway Simulator */}
      {activeTab === 'gateway' && (
        <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-200">Policy Gateway Enforcement Simulator</span>
            <p className="text-xs text-zinc-400">
              Submit a simulated tool or execution request from an agent to test the central policy enforcement filter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-zinc-400 text-[10px] block mb-1">Requesting Agent:</label>
              <select
                value={testAgentId}
                onChange={(e) => setTestAgentId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 font-mono focus:outline-none"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-zinc-400 text-[10px] block mb-1">Requested Capability / Command Payload:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testCapability}
                  onChange={(e) => setTestCapability(e.target.value)}
                  placeholder="e.g. spawn_bash_subshell, raw_db_dump, safe_linter..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-zinc-200 font-mono text-xs focus:outline-none"
                />
                <button
                  onClick={handleTestGateway}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded text-xs transition-colors shrink-0"
                >
                  Evaluate Policy
                </button>
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
            <span>Quick Presets:</span>
            {[
              'spawn_bash_subshell',
              'raw_db_dump',
              'safe_linter',
              'open_external_socket',
              'schema_verifier'
            ].map(preset => (
              <button
                key={preset}
                onClick={() => setTestCapability(preset)}
                className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-cyan-300 font-mono hover:bg-zinc-800"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Result Output Card */}
          {simulatedGatewayResult && (
            <div className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
              simulatedGatewayResult.decision === 'allowed' ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200' :
              simulatedGatewayResult.decision === 'denied' ? 'bg-rose-950/40 border-rose-600/50 text-rose-200' :
              'bg-amber-950/40 border-amber-600/50 text-amber-200'
            }`}>
              <div className="flex items-center justify-between font-mono font-bold">
                <span className="uppercase tracking-wider">Gateway Decision: {simulatedGatewayResult.decision}</span>
                <span className="text-[10px] text-zinc-400">{simulatedGatewayResult.matchedRule}</span>
              </div>
              <p className="text-[11px] leading-relaxed">{simulatedGatewayResult.reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: 10-Component Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>10 Independent Defensive Architecture Modules (Cannot Be Bypassed by Agents):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {INDEPENDENT_DEFENSE_LAYER_COMPONENTS.map(comp => (
              <div key={comp.id} className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  {comp.code}
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200">{comp.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{comp.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Architectural Guarantee Callout */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-cyan-900/40 text-xs text-zinc-300 space-y-1">
            <span className="font-bold text-cyan-300 block">Independence & Anti-Self-Governance Guarantee:</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Monitored AI agents run in restricted execution sandboxes. The Policy Enforcement Gateway, Audit Registry, and Causal Discovery Engine run in an independent control plane. 
              Even if an agent is tricked via prompt injection or compromised tool proxies, it lacks the cryptographic keys or system calls to disable its own monitoring or grant itself elevated permissions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
