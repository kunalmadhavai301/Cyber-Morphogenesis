import React, { useState } from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { HumanApprovalCenter } from '../components/agent-security/HumanApprovalCenter';
import { 
  FileCheck2, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ArrowRight,
  RefreshCw,
  Zap,
  Lock,
  Radio
} from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const { 
    automatedRules, 
    toggleRule, 
    updateRuleThreshold,
    approvalRequests,
    approveRequest,
    rejectRequest,
    simulateApproval,
    navigate,
    resetSimulation
  } = useAgentSecurity();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Security Policies & Human Approval Authorization
              </h1>
              <p className="text-xs text-zinc-400">
                Configure automated response rules, set risk trigger thresholds, and authorize dual-key privileged tool executions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => resetSimulation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset Rules</span>
          </button>
          <button
            onClick={() => navigate('/permissions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <span>Zero-Trust Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Integrated Human Approval Center and Automated Rule Builder */}
      <HumanApprovalCenter />
    </div>
  );
};
