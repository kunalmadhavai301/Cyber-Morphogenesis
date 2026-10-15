import React from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { 
  ShieldCheck, 
  Activity, 
  Lock, 
  Radio, 
  Workflow, 
  FileCheck2, 
  AlertTriangle, 
  Sliders, 
  ArrowRight, 
  Play, 
  Cpu, 
  Layers,
  Sparkles,
  Server,
  Zap,
  CheckCircle2,
  GitFork
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate, agents, events, incidents } = useAgentSecurity();

  const featureCards = [
    {
      id: 'feat-1',
      title: 'Agent Behavior Monitoring',
      desc: 'Continuously monitors telemetry across all connected agents to identify anomalous message frequencies and role departures.',
      icon: Activity,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40 border-cyan-800/40',
      route: '/monitoring'
    },
    {
      id: 'feat-2',
      title: 'Unauthorized Action Detection',
      desc: 'Intercepts out-of-profile tool requests, OS subshell executions, and unapproved socket connections at the policy gateway.',
      icon: Lock,
      color: 'text-rose-400',
      bg: 'bg-rose-950/40 border-rose-800/40',
      route: '/permissions'
    },
    {
      id: 'feat-3',
      title: 'Multi-Agent Threat Analysis',
      desc: 'Correlates concurrent events to uncover synchronized collusion, evasion pivots, and hidden multi-agent coordination.',
      icon: GitFork,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-800/40',
      route: '/threat-detection'
    },
    {
      id: 'feat-4',
      title: 'Propagation Risk Assessment',
      desc: 'Calculates topological reachability and blast radius to forecast how compromised outputs could spread to downstream agents.',
      icon: Workflow,
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-800/40',
      route: '/propagation'
    },
    {
      id: 'feat-5',
      title: 'Automated Containment',
      desc: 'Enforces proportionate counterfactual interventions—from tool throttling to selective isolation—preserving critical workflows.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/40',
      route: '/defense'
    },
    {
      id: 'feat-6',
      title: 'Permission Enforcement',
      desc: 'Implements zero-trust least-privilege profiles with central gateway validation that agents cannot unilaterally override.',
      icon: Sliders,
      color: 'text-blue-400',
      bg: 'bg-blue-950/40 border-blue-800/40',
      route: '/permissions'
    },
    {
      id: 'feat-7',
      title: 'Human Approval Controls',
      desc: 'Holds high-impact privileged actions in a human authorization queue before execution in mission-critical environments.',
      icon: FileCheck2,
      color: 'text-violet-400',
      bg: 'bg-violet-950/40 border-violet-800/40',
      route: '/policies'
    },
    {
      id: 'feat-8',
      title: 'Incident Investigation',
      desc: 'Provides full forensic timelines, causal proof graphs, analyst note tracking, and exportable JSON/CSV audit reports.',
      icon: Radio,
      color: 'text-cyan-300',
      bg: 'bg-cyan-950/40 border-cyan-800/40',
      route: '/incidents'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border border-zinc-800/80 p-6 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI AGENT SECURITY PLATFORM • AUTONOMOUS AGENT PROTECTION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Protect Every Agent. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              Control Every Interaction.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            An independent AI security layer for monitoring, controlling, and protecting interconnected AI agents. 
            Detect abnormal behavior, prevent unauthorized tool execution, analyze suspicious coordination, and contain threats without halting the entire workflow.
          </p>

          {/* Demonstration Environment Notice */}
          <div className="bg-zinc-900/90 border border-zinc-700/60 rounded-xl p-3 max-w-xl mx-auto text-xs text-zinc-400 font-mono flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Demonstration environment: all agents, messages, events, and security outcomes are simulated.</span>
          </div>

          {/* 3 Working Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Security Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/agent-network')}
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Workflow className="w-4 h-4" />
              <span>Explore Agent Network</span>
            </button>

            <button
              onClick={() => navigate('/threat-detection')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-950 to-zinc-900 hover:from-purple-900 hover:to-zinc-800 border border-purple-500/50 text-purple-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
            >
              <Play className="w-4 h-4 text-purple-400" />
              <span>Run Security Simulation</span>
            </button>
          </div>
        </div>
      </section>

      {/* Architecture Concept Diagram Section */}
      <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">Independent Architecture</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How the Independent Agent Security Layer Works
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl mx-auto">
            The security platform sits between interconnected AI agents, orchestrators, and tool execution environments, 
            ensuring agents cannot disable their own monitoring or grant themselves unauthorized privileges.
          </p>
        </div>

        {/* Visual Architecture Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center max-w-5xl mx-auto text-xs font-mono">
          {/* Level 1: User Request & Orchestrator */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center space-y-1">
            <span className="text-[10px] text-zinc-500 block uppercase">1. Ingress</span>
            <span className="font-bold text-zinc-200 block text-sm">User Request</span>
            <span className="text-zinc-400 text-[11px] block">Orchestrator Agent</span>
          </div>

          <div className="hidden md:flex justify-center text-cyan-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Level 2: Independent Security Layer */}
          <div className="bg-cyan-950/60 p-4 rounded-xl border-2 border-cyan-500/60 text-center space-y-2 shadow-lg shadow-cyan-950/50 md:scale-105">
            <span className="text-[10px] text-cyan-300 font-bold block uppercase tracking-wider">2. Independent Security Layer</span>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <span className="p-1 rounded bg-zinc-950/80 border border-cyan-500/30 text-cyan-200">Identity Checks</span>
              <span className="p-1 rounded bg-zinc-950/80 border border-cyan-500/30 text-cyan-200">Behavior Monitor</span>
              <span className="p-1 rounded bg-zinc-950/80 border border-cyan-500/30 text-cyan-200">Policy Gateway</span>
            </div>
          </div>

          <div className="hidden md:flex justify-center text-cyan-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Level 3: Connected Agents & Controlled Tool Gateway */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center space-y-1">
            <span className="text-[10px] text-zinc-500 block uppercase">3. Execution</span>
            <span className="font-bold text-zinc-200 block text-sm">Agent Network</span>
            <span className="text-emerald-400 text-[11px] block">Controlled Tool Gateway</span>
          </div>
        </div>
      </section>

      {/* 8 Feature Cards Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">Comprehensive Capabilities</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Autonomous Protection Features
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">
            Eight coordinated modules safeguarding agent workflows against compromise, runaway delegation, and lateral exploitation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map(feat => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => navigate(feat.route)}
                className={`p-5 rounded-xl border ${feat.bg} hover:border-cyan-500/50 cursor-pointer transition-all space-y-3 flex flex-col justify-between group shadow-md hover:scale-[1.02]`}
              >
                <div className="space-y-2">
                  <div className={`p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 w-fit ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 pt-2 border-t border-zinc-800/80">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Status Bar */}
      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-zinc-200">
            System Live: <strong className="text-cyan-400">{agents.length} Monitored Agents</strong> • <strong className="text-emerald-400">Zero Uncontained Breaches</strong>
          </span>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>Open Full Control Center</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </section>
    </div>
  );
};
