import React, { useState } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { 
  ShieldCheck, 
  Activity, 
  Menu, 
  X, 
  Sliders, 
  Users, 
  GitFork, 
  Lock, 
  Workflow, 
  FileCheck2, 
  AlertTriangle, 
  FileCode, 
  Settings as SettingsIcon,
  RefreshCw,
  Zap,
  Radio
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentPath, 
    navigate, 
    resetSimulation, 
    activeScenario, 
    isScenarioRunning,
    approvalRequests 
  } = useAgentSecurity();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'pending').length;

  const navLinks = [
    { path: '/dashboard', label: 'SOC Dashboard', icon: Activity },
    { path: '/agents', label: 'Agent Fleet', icon: Users },
    { path: '/agent-network', label: 'Network Graph', icon: GitFork },
    { path: '/monitoring', label: 'Behavior Guard', icon: Radio },
    { path: '/threat-detection', label: 'Scenarios', icon: Zap },
    { path: '/propagation', label: 'Propagation', icon: Workflow },
    { path: '/defense', label: 'Defense Lab', icon: ShieldCheck },
    { path: '/policies', label: 'Policies', icon: FileCheck2, badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined },
    { path: '/permissions', label: 'Zero-Trust', icon: Lock },
    { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { path: '/audit', label: 'Audit Trail', icon: FileCode },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="bg-zinc-950/95 border-b border-zinc-800/80 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 via-zinc-900 to-rose-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-glow-cyan">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
                AI AGENT SECURITY
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
                PROT-CTR
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono hidden sm:block">
              One Security Layer. Every Agent. Every Interaction.
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = currentPath === link.path;
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-cyan-300 bg-zinc-900 border border-cyan-500/40 shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Medium Screen Dropdown or Quick Links */}
        <div className="hidden lg:flex xl:hidden items-center gap-1">
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentPath === '/dashboard' ? 'text-cyan-300 bg-zinc-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/agents')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentPath === '/agents' ? 'text-cyan-300 bg-zinc-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Fleet
          </button>
          <button
            onClick={() => navigate('/agent-network')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentPath === '/agent-network' ? 'text-cyan-300 bg-zinc-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => navigate('/monitoring')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentPath === '/monitoring' ? 'text-cyan-300 bg-zinc-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Guard
          </button>
          <button
            onClick={() => navigate('/threat-detection')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentPath === '/threat-detection' ? 'text-cyan-300 bg-zinc-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Threats
          </button>
          <button
            onClick={() => navigate('/defense')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentPath === '/defense' ? 'text-cyan-300 bg-zinc-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Defense
          </button>
          <button
            onClick={() => navigate('/permissions')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
              currentPath === '/permissions' ? 'text-cyan-300 bg-zinc-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Zero-Trust
          </button>
        </div>

        {/* Right Action Icons & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {/* Active Scenario Pill */}
          <div 
            onClick={() => navigate('/threat-detection')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 cursor-pointer hover:border-cyan-500/40 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${isScenarioRunning ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-[10px] text-zinc-400">Scen:</span>
            <span className="text-[11px] font-bold text-zinc-200 truncate max-w-[100px]">{activeScenario.shortTitle || activeScenario.name.split(':')[0]}</span>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => resetSimulation()}
            className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            title="Reset Simulation State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-md bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-3 space-y-1">
          <div className="text-[10px] uppercase font-mono text-zinc-500 mb-2">Platform Modules</div>
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map(link => {
              const isActive = currentPath === link.path;
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-lg text-xs font-medium flex items-center gap-2 text-left ${
                    isActive
                      ? 'bg-zinc-900 text-cyan-300 border border-cyan-500/40'
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
