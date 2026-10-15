import React from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { ShieldCheck, Lock, Activity, GitFork, Radio, Workflow, FileCheck2, FileCode, AlertTriangle, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useAgentSecurity();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/80 text-zinc-400 text-xs py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Platform Overview & Mission */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>AI AGENT SECURITY &bull; AUTONOMOUS AGENT PROTECTION CENTER</span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-xs">
            An intelligent, independent security layer that monitors connected AI agents, detects abnormal behavior, prevents unauthorized actions, analyzes suspicious coordination, predicts potential propagation, and applies controlled defensive interventions.
          </p>

          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-300 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>PERMANENT SIMULATION DISCLAIMER</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              All agent interactions, telemetry, causal graphs, and security interventions shown on this platform are simulated for research, testing, and demonstration purposes. The platform demonstrates how an independent AI agent security layer monitors and protects multi-agent systems without accessing third-party production credentials.
            </p>
          </div>
        </div>

        {/* Col 2: Core Platform Modules */}
        <div className="space-y-2">
          <div className="text-zinc-200 font-medium text-xs uppercase tracking-wider font-mono">Security Modules</div>
          <ul className="space-y-1.5 text-xs">
            <li><button onClick={() => navigate('/dashboard')} className="hover:text-cyan-400 transition-colors">SOC Operations Dashboard</button></li>
            <li><button onClick={() => navigate('/agents')} className="hover:text-cyan-400 transition-colors">AI Agent Fleet Management</button></li>
            <li><button onClick={() => navigate('/agent-network')} className="hover:text-cyan-400 transition-colors">Interactive Communication Graph</button></li>
            <li><button onClick={() => navigate('/monitoring')} className="hover:text-cyan-400 transition-colors">Behavior Guard & Telemetry</button></li>
            <li><button onClick={() => navigate('/threat-detection')} className="hover:text-cyan-400 transition-colors">Threat Simulation Scenarios A–H</button></li>
            <li><button onClick={() => navigate('/propagation')} className="hover:text-cyan-400 transition-colors">Risk Propagation & Blast Radius</button></li>
          </ul>
        </div>

        {/* Col 3: Defense & Governance */}
        <div className="space-y-2">
          <div className="text-zinc-200 font-medium text-xs uppercase tracking-wider font-mono">Defense & Governance</div>
          <ul className="space-y-1.5 text-xs">
            <li><button onClick={() => navigate('/defense')} className="hover:text-cyan-400 transition-colors">Defensive Interventions & Pareto Lab</button></li>
            <li><button onClick={() => navigate('/policies')} className="hover:text-cyan-400 transition-colors">Security Policies & Human Approval</button></li>
            <li><button onClick={() => navigate('/permissions')} className="hover:text-cyan-400 transition-colors">Zero-Trust Capability Matrix</button></li>
            <li><button onClick={() => navigate('/incidents')} className="hover:text-cyan-400 transition-colors">Forensic Incidents Workspace</button></li>
            <li><button onClick={() => navigate('/audit')} className="hover:text-cyan-400 transition-colors">Immutable Cryptographic Audit Trail</button></li>
            <li><button onClick={() => navigate('/settings')} className="hover:text-cyan-400 transition-colors">Engine Configuration & Portability</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-[11px] font-mono gap-2">
        <div>
          One Security Layer. Every Agent. Every Interaction.
        </div>
        <div>
          &copy; {new Date().getFullYear()} AI Agent Security Research Platform &bull; Seed 42 Deterministic Simulation
        </div>
      </div>
    </footer>
  );
};
