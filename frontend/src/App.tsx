import React from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { AgentSecurityProvider, useAgentSecurity } from './context/AgentSecurityContext';
import { Navbar } from './components/layout/Navbar';
import { ProvenanceBanner } from './components/layout/ProvenanceBanner';
import { Footer } from './components/layout/Footer';

// AI Agent Security Platform Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgentNetworkPage } from './pages/AgentNetworkPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ThreatDetectionPage } from './pages/ThreatDetectionPage';
import { PropagationPage } from './pages/PropagationPage';
import { DefensePage } from './pages/DefensePage';
import { PoliciesPage } from './pages/PoliciesPage';
import { PermissionsPage } from './pages/PermissionsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { currentPath } = useAgentSecurity();

  const renderActivePage = () => {
    switch (currentPath) {
      case '/':
        return <LandingPage />;
      case '/dashboard':
        return <DashboardPage />;
      case '/agents':
        return <AgentsPage />;
      case '/agent-network':
        return <AgentNetworkPage />;
      case '/monitoring':
        return <MonitoringPage />;
      case '/threat-detection':
        return <ThreatDetectionPage />;
      case '/propagation':
        return <PropagationPage />;
      case '/defense':
        return <DefensePage />;
      case '/policies':
        return <PoliciesPage />;
      case '/permissions':
        return <PermissionsPage />;
      case '/incidents':
        return <IncidentsPage />;
      case '/audit':
        return <AuditPage />;
      case '/settings':
        return <SettingsPage />;
      // Fallback aliases
      case '/agent-security':
        return <DashboardPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <ProvenanceBanner />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {renderActivePage()}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <AgentSecurityProvider>
        <AppContent />
      </AgentSecurityProvider>
    </SimulationProvider>
  );
}
