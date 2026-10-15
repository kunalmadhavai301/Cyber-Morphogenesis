import React, { useState } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  ShieldAlert,
  Sliders,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const HumanApprovalCenter: React.FC = () => {
  const { 
    approvalRequests, 
    approveRequest, 
    rejectRequest, 
    simulateApproval,
    automatedRules,
    toggleRule
  } = useAgentSecurity();

  const [activeTab, setActiveTab] = useState<'approvals' | 'policies'>('approvals');

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Human-in-the-Loop Governance & Automated Policies
            </h2>
            <p className="text-xs text-zinc-400">
              High-impact containment and privileged role escalations require explicit human approval; low-risk interventions execute automatically.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'approvals' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Approval Queue ({approvalRequests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'policies' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Response Rules ({automatedRules.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Approval Queue */}
      {activeTab === 'approvals' && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Pending Privileged Action Escalations:
          </span>

          <div className="space-y-3">
            {approvalRequests.map(req => {
              const isPending = req.status === 'pending';
              return (
                <div 
                  key={req.requestId}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                    isPending 
                      ? 'bg-zinc-950/90 border-purple-500/40 shadow-lg' 
                      : 'bg-zinc-950/40 border-zinc-800/80 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-purple-300 font-bold">{req.requestId}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-200 font-semibold">{req.requestingAgent}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Risk: {Math.round(req.riskScore * 100)}%
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      req.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' :
                      req.status === 'rejected' ? 'bg-rose-950 text-rose-400 border border-rose-600' :
                      'bg-amber-950 text-amber-400 border border-amber-600 animate-pulse'
                    }`}>
                      Status: {req.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-100 text-sm">{req.requestedAction}</h4>
                    <p className="text-zinc-400 text-xs mt-1">{req.securityReason}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                    <div>
                      <span className="text-zinc-400 block font-mono">Evidence Trigger:</span>
                      <span className="text-zinc-300">{req.evidence}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-mono">Potential Blast Impact:</span>
                      <span className="text-rose-300">{req.potentialImpact}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
                    <span>Recommended: <strong className="text-cyan-300">{req.recommendedAction}</strong></span>
                    <span>{new Date(req.timestamp).toLocaleTimeString()}</span>
                  </div>

                  {/* Action Buttons */}
                  {isPending && (
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => approveRequest(req.requestId)}
                        className="px-3 py-1.5 rounded-md bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize Action</span>
                      </button>
                      <button
                        onClick={() => rejectRequest(req.requestId)}
                        className="px-3 py-1.5 rounded-md bg-rose-950 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject & Deny</span>
                      </button>
                      <button
                        onClick={() => simulateApproval(req.requestId)}
                        className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold flex items-center gap-1 transition-colors ml-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Simulate Approval (Sandbox)</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Automated Rules */}
      {activeTab === 'policies' && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Configured Automated Response Thresholds & Triggers:
          </span>

          <div className="space-y-2">
            {automatedRules.map(rule => (
              <div 
                key={rule.ruleId}
                className="bg-zinc-950/80 p-3.5 rounded-lg border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-300 font-bold">{rule.ruleId}</span>
                    <span className="font-semibold text-zinc-200">{rule.name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                      rule.priority === 'critical' ? 'bg-rose-950 text-rose-400 border border-rose-600' :
                      rule.priority === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-600' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {rule.priority}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-400 bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800">
                    {rule.triggerCondition} ➔ <strong className="text-cyan-300">{rule.action}</strong>
                  </div>
                  <p className="text-[10px] text-zinc-400">{rule.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Threshold: <strong>{rule.threshold}</strong>
                  </span>
                  <button
                    onClick={() => toggleRule(rule.ruleId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
                      rule.enabled 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700 line-through'
                    }`}
                  >
                    {rule.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
