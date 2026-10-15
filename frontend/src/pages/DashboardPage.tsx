import React from 'react';
import { useAgentSecurity } from '../context/AgentSecurityContext';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Lock, 
  Radio, 
  Workflow, 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Sliders, 
  Cpu, 
  Zap, 
  Eye, 
  RefreshCw,
  GitFork,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  PieChart, 
  Pie 
} from 'recharts';
import { ScenarioControllerBanner } from '../components/agent-security/ScenarioControllerBanner';
import { AgentNetworkGraph } from '../components/agent-security/AgentNetworkGraph';

export const DashboardPage: React.FC = () => {
  const { 
    agents, 
    connections, 
    events, 
    approvalRequests, 
    approveRequest, 
    rejectRequest, 
    auditLogs, 
    calculateAgentRiskScore, 
    getRiskClassification,
    navigate,
    resetSimulation,
    activeScenario
  } = useAgentSecurity();

  // Compute 12 KPI metrics
  const totalAgents = agents.length;
  const isolatedCount = agents.filter(a => a.currentStatus === 'isolated').length;
  const restrictedCount = agents.filter(a => a.currentStatus === 'restricted' || a.currentStatus === 'recovering').length;
  const quarantinedCount = agents.filter(a => a.containmentStatus === 'quarantined').length;
  
  const riskScores = agents.map(a => calculateAgentRiskScore(a));
  const meanRisk = riskScores.length > 0 
    ? Number((riskScores.reduce((acc, curr) => acc + curr, 0) / riskScores.length * 100).toFixed(1))
    : 0;

  const highRiskCount = agents.filter(a => calculateAgentRiskScore(a) >= 0.70).length;
  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;
  const blockedEventsCount = events.filter(e => e.policyDecision === 'denied').length;
  const interceptedCount = events.filter(e => e.policyDecision !== 'allowed').length;
  const verifiedCausalLinksCount = connections.filter(c => c.isVerifiedCausal).length;
  const meanLatency = '1.8 ms';
  const containmentVelocity = '14.2s';
  const policyComplianceRate = '96.4%';

  // Risk Distribution Data for Recharts
  const riskDistribution = [
    { name: 'Low (<30%)', count: agents.filter(a => calculateAgentRiskScore(a) < 0.30).length, color: '#10b981' },
    { name: 'Elevated (30-60%)', count: agents.filter(a => calculateAgentRiskScore(a) >= 0.30 && calculateAgentRiskScore(a) < 0.60).length, color: '#06b6d4' },
    { name: 'High (60-80%)', count: agents.filter(a => calculateAgentRiskScore(a) >= 0.60 && calculateAgentRiskScore(a) < 0.80).length, color: '#f59e0b' },
    { name: 'Critical (≥80%)', count: agents.filter(a => calculateAgentRiskScore(a) >= 0.80).length, color: '#f43f5e' },
  ];

  // Policy Verdicts over simulated time window
  const policyTimeline = [
    { time: 'T-50s', allowed: 24, denied: 2, flagged: 1 },
    { time: 'T-40s', allowed: 31, denied: 3, flagged: 2 },
    { time: 'T-30s', allowed: 28, denied: 7, flagged: 4 },
    { time: 'T-20s', allowed: 19, denied: 14, flagged: 6 },
    { time: 'T-10s', allowed: 22, denied: 9, flagged: 3 },
    { time: 'Now', allowed: 27, denied: blockedEventsCount > 0 ? blockedEventsCount : 4, flagged: pendingApprovalsCount },
  ];

  // Top blast radius agents
  const topRiskyAgents = [...agents]
    .map(a => ({
      ...a,
      computedRisk: calculateAgentRiskScore(a),
      blastRadiusCount: a.downstreamDependencies.length
    }))
    .sort((a, b) => b.computedRisk - a.computedRisk)
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                Autonomous Agent Security Operations Center
              </h1>
              <p className="text-xs text-zinc-400">
                Live monitoring, causal coordination discovery, and zero-trust policy enforcement across multi-agent workflows.
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
            <span>Reset Telemetry</span>
          </button>
          <button
            onClick={() => navigate('/agent-network')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-semibold text-xs transition-colors shadow-glow-cyan"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Full Agent Graph</span>
          </button>
        </div>
      </div>

      {/* Scenario Controller */}
      <ScenarioControllerBanner />

      {/* 12 Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Fleet Monitored</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">{totalAgents} Agents</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            100% Registered
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Isolated Nodes</span>
            <Lock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{isolatedCount}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Containment Active
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Quarantined</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{quarantinedCount + restrictedCount}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Throttled / Restricted
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Mean Fleet Risk</span>
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">{meanRisk}%</div>
          <div className={`text-[10px] font-mono mt-1 ${meanRisk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {meanRisk > 50 ? 'Elevated Threat Level' : 'Nominal Operational State'}
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Critical Agents</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{highRiskCount}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Risk &gt; 70% Cutoff
          </div>
        </div>

        {/* KPI 6 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Denied Actions</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{blockedEventsCount}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Gateway Intercepted
          </div>
        </div>

        {/* KPI 7 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Policy Verdicts</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">{interceptedCount}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Evaluated Decisions
          </div>
        </div>

        {/* KPI 8 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Pending Approvals</span>
            <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{pendingApprovalsCount}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Awaiting Human Signature
          </div>
        </div>

        {/* KPI 9 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Causal Paths</span>
            <GitFork className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">{verifiedCausalLinksCount} Verified</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Granger Lag FDR &le; 0.05
          </div>
        </div>

        {/* KPI 10 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Mean Latency</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">{meanLatency}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Zero-Trust Hook Overhead
          </div>
        </div>

        {/* KPI 11 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Containment Time</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{containmentVelocity}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Pearlian do(X) Cut
          </div>
        </div>

        {/* KPI 12 */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Zero-Trust Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{policyComplianceRate}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Least Privilege Conformance
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Network & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Live Graph Preview with Interactive Controls */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Live Agent Interconnection Topology</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                  Interactive Canvas
                </span>
              </div>
              <button
                onClick={() => navigate('/agent-network')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Full Screen Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <AgentNetworkGraph />
          </div>

          {/* Policy Verdicts over Time Chart */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Gateway Decision Traffic (Allowed vs Denied vs Flagged)</h3>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Window: Last 60s</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={policyTimeline}>
                  <defs>
                    <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorDenied" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="time" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Area type="monotone" dataKey="allowed" stroke="#10b981" fillOpacity={1} fill="url(#colorAllowed)" name="Allowed" />
                  <Area type="monotone" dataKey="denied" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDenied)" name="Blocked / Denied" />
                  <Area type="monotone" dataKey="flagged" stroke="#f59e0b" fillOpacity={0} name="Pending Approval" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Risk Distribution, Approvals, & Blast Radius */}
        <div className="lg:col-span-4 space-y-4">
          {/* Risk Distribution Breakdown */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Agent Risk Classification</h3>
              </div>
              <button 
                onClick={() => navigate('/monitoring')}
                className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors"
              >
                Inspect &rarr;
              </button>
            </div>
            
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <XAxis type="number" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Human Approvals Queue */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Pending Authorization Requests</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-mono">
                {pendingApprovalsCount} Queued
              </span>
            </div>

            {pendingApprovalsCount === 0 ? (
              <div className="p-4 rounded-lg bg-zinc-950/40 border border-zinc-800 text-center text-xs text-zinc-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1 opacity-70" />
                Zero privileged actions awaiting approval.
              </div>
            ) : (
              <div className="space-y-2.5">
                {approvalRequests.filter(r => r.status === 'pending').slice(0, 2).map(req => (
                  <div key={req.requestId} className="p-3 rounded-lg bg-zinc-950/70 border border-amber-800/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-amber-300">{req.requestingAgent}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/50 uppercase font-mono">
                        {req.riskScore >= 0.8 ? 'CRITICAL' : 'HIGH'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-tight">
                      Requested: <strong className="text-zinc-100">{req.requestedAction}</strong>
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-tight italic">
                      &quot;{req.securityReason}&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => approveRequest(req.requestId)}
                        className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-[11px] transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectRequest(req.requestId)}
                        className="flex-1 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[11px] transition-colors"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/policies')}
                  className="w-full text-center text-[11px] text-cyan-400 hover:text-cyan-300 font-mono py-1 block"
                >
                  View All Policies & Approvals &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Top Blast Radius Agents */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Top Blast Radius Agents</h3>
              </div>
              <button
                onClick={() => navigate('/propagation')}
                className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors"
              >
                Analyze &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {topRiskyAgents.map(ag => {
                const classification = getRiskClassification(ag.computedRisk);
                return (
                  <div key={ag.id} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                        <span>{ag.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">({ag.id})</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Downstream Reach: <strong className="text-zinc-300">{ag.blastRadiusCount} agents</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${
                        classification === 'critical' ? 'text-rose-400' :
                        classification === 'high' ? 'text-amber-400' :
                        classification === 'elevated' ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {(ag.computedRisk * 100).toFixed(0)}% Risk
                      </div>
                      <span className={`text-[9px] uppercase px-1 rounded font-mono ${
                        ag.currentStatus === 'isolated' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        ag.currentStatus === 'restricted' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {ag.currentStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Live Security Event Stream & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live Event Stream */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-200">Live Communication Event Stream</h3>
            </div>
            <button
              onClick={() => navigate('/monitoring')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Explore Stream</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {events.slice(0, 5).map(ev => (
              <div 
                key={ev.eventId} 
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                  ev.severity === 'critical' ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' :
                  ev.severity === 'high' ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' :
                  'bg-zinc-950/50 border-zinc-800/60 text-zinc-300'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-zinc-400">{ev.timestamp}</span>
                    <span className="font-semibold text-zinc-200">{ev.sourceAgent}</span>
                    <span className="text-zinc-500">&rarr;</span>
                    <span className="font-semibold text-zinc-200">{ev.destinationAgent}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {ev.detectionReason}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                    ev.policyDecision === 'denied' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    ev.policyDecision === 'requires_approval' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {ev.policyDecision}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Log Highlights */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Immutable Audit Trail Highlights</h3>
            </div>
            <button
              onClick={() => navigate('/audit')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Full Audit Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.auditId} className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-400">{log.timestamp}</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">{log.actor}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                    {log.eventType}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300 font-mono">
                  {log.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
