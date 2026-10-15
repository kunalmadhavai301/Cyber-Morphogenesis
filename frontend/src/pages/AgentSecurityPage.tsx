import React, { useState } from 'react';
import { AgentSecurityProvider, useAgentSecurity } from '../context/AgentSecurityContext';
import { useSimulation } from '../context/SimulationContext';
import { AgentMetricsOverview } from '../components/agent-security/AgentMetricsOverview';
import { ScenarioControllerBanner } from '../components/agent-security/ScenarioControllerBanner';
import { AgentNetworkGraph } from '../components/agent-security/AgentNetworkGraph';
import { AgentInspector } from '../components/agent-security/AgentInspector';
import { AgentBehaviorGuardPanel } from '../components/agent-security/AgentBehaviorGuardPanel';
import { AgentCausalAnalysisPanel } from '../components/agent-security/AgentCausalAnalysisPanel';
import { AgentPropagationPanel } from '../components/agent-security/AgentPropagationPanel';
import { AgentCounterfactualLab } from '../components/agent-security/AgentCounterfactualLab';
import { AgentZeroTrustManager } from '../components/agent-security/AgentZeroTrustManager';
import { AgentEventMonitor } from '../components/agent-security/AgentEventMonitor';
import { IncidentInvestigationWorkspace } from '../components/agent-security/IncidentInvestigationWorkspace';
import { HumanApprovalCenter } from '../components/agent-security/HumanApprovalCenter';
import { 
  ShieldCheck, 
  Activity, 
  GitFork, 
  Lock, 
  Radio, 
  FileCheck2, 
  Layers,
  ArrowRight,
  Network,
  Cpu
} from 'lucide-react';

const AgentSecurityDashboardContent: React.FC = () => {
  const { navigate } = useSimulation();
  const [activeTab, setActiveTab] = useState<'network' | 'causal' | 'defense' | 'zerotrust' | 'events' | 'approvals'>('network');

  const tabs = [
    { id: 'network', label: '1. Live Agent Network & Behavior Guard', icon: Network },
    { id: 'causal', label: '2. Causal Coordination & Propagation', icon: GitFork },
    { id: 'defense', label: '3. Counterfactual Defense & Pareto Lab', icon: ShieldCheck },
    { id: 'zerotrust', label: '4. Zero-Trust & Defense Layer', icon: Lock },
    { id: 'events', label: '5. Event Monitor & Incidents', icon: Radio },
    { id: 'approvals', label: '6. Human Approvals & Policies', icon: FileCheck2 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Environment Switcher Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900/60 p-2.5 px-4 rounded-lg border border-zinc-800 text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-medium">Evaluation Environment:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-500/40">
            Multi-Agent AI System (10 Agents)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[11px] hidden sm:inline">Switch Testbed:</span>
          <button
            onClick={() => navigate('/topology')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>32-Node Enterprise/OT Network</span>
            <ArrowRight className="w-3 h-3 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Primary KPI Overview */}
      <AgentMetricsOverview />

      {/* Scenario Simulation Controller */}
      <ScenarioControllerBanner />

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800 text-xs">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive 
                  ? 'bg-zinc-900 text-cyan-400 border-cyan-400 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Live Agent Network & Behavior Guard */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              <AgentNetworkGraph />
            </div>
            <div className="lg:col-span-4">
              <AgentInspector />
            </div>
          </div>
          <AgentBehaviorGuardPanel />
        </div>
      )}

      {/* Tab 2: Causal Coordination & Propagation */}
      {activeTab === 'causal' && (
        <div className="space-y-6">
          <AgentCausalAnalysisPanel />
          <AgentPropagationPanel />
        </div>
      )}

      {/* Tab 3: Counterfactual Defense & Pareto Lab */}
      {activeTab === 'defense' && (
        <div className="space-y-6">
          <AgentCounterfactualLab />
        </div>
      )}

      {/* Tab 4: Zero-Trust & Independent Defense Layer */}
      {activeTab === 'zerotrust' && (
        <div className="space-y-6">
          <AgentZeroTrustManager />
        </div>
      )}

      {/* Tab 5: Event Monitor & Incidents */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <AgentEventMonitor />
          <IncidentInvestigationWorkspace />
        </div>
      )}

      {/* Tab 6: Human Approvals & Policies */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <HumanApprovalCenter />
        </div>
      )}
    </div>
  );
};

export const AgentSecurityPage: React.FC = () => {
  return (
    <AgentSecurityProvider>
      <AgentSecurityDashboardContent />
    </AgentSecurityProvider>
  );
};
