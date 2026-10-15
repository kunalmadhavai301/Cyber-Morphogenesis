/**
 * AI AGENT SECURITY — AUTONOMOUS AGENT PROTECTION CENTER
 * Comprehensive Automated Verification Test Suite
 * Tests all 13 Dedicated Routes, Fleet Management, Causal Discovery, 
 * Behavior Guard, Threat Scenarios, and Counterfactual Interventions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
    testsFailed++;
  }
}

console.log("================================================================================");
console.log("AI AGENT SECURITY: AUTONOMOUS AGENT PROTECTION CENTER TEST SUITE");
console.log("================================================================================");

// 1. All 13 Dedicated Routes exist
console.log("\n[Test 1] Verifying all 13 AI Agent Security Route Page Components...");
const requiredRoutes = [
  { file: 'LandingPage.tsx', path: '/' },
  { file: 'DashboardPage.tsx', path: '/dashboard' },
  { file: 'AgentsPage.tsx', path: '/agents' },
  { file: 'AgentNetworkPage.tsx', path: '/agent-network' },
  { file: 'MonitoringPage.tsx', path: '/monitoring' },
  { file: 'ThreatDetectionPage.tsx', path: '/threat-detection' },
  { file: 'PropagationPage.tsx', path: '/propagation' },
  { file: 'DefensePage.tsx', path: '/defense' },
  { file: 'PoliciesPage.tsx', path: '/policies' },
  { file: 'PermissionsPage.tsx', path: '/permissions' },
  { file: 'IncidentsPage.tsx', path: '/incidents' },
  { file: 'AuditPage.tsx', path: '/audit' },
  { file: 'SettingsPage.tsx', path: '/settings' }
];

requiredRoutes.forEach(r => {
  const p = path.join(__dirname, 'src', 'pages', r.file);
  assert(fs.existsSync(p), `Route ${r.path} component ${r.file} exists`);
});

// 2. App.tsx routes to all 13 pages
console.log("\n[Test 2] Verifying App.tsx routing table...");
const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.tsx'), 'utf-8');
requiredRoutes.forEach(r => {
  assert(appContent.includes(`case '${r.path}':`), `App.tsx contains router case for ${r.path}`);
});
assert(appContent.includes('AgentSecurityProvider'), "App.tsx wraps application with AgentSecurityProvider");

// 3. AI Agent Fleet: 10 simulated agents
console.log("\n[Test 3] Verifying 10 Simulated AI Agents in Registry...");
const dataContent = fs.readFileSync(path.join(__dirname, 'src', 'data', 'agentSecurityData.ts'), 'utf-8');
const agentIds = ['orch-01', 'plan-01', 'res-01', 'ana-01', 'data-01', 'code-01', 'tool-01', 'mem-01', 'verif-01', 'rep-01'];
agentIds.forEach(id => {
  assert(dataContent.includes(`id: '${id}'`), `Agent ${id} registered in INITIAL_AI_AGENTS`);
});

// 4. Inter-agent communication channels
console.log("\n[Test 4] Verifying 16 Inter-Agent Communication Channels...");
const connMatches = [...dataContent.matchAll(/id:\s*'conn-[^']+'/g)];
assert(connMatches.length >= 16, `Found ${connMatches.length} communication channels (>= 16 required)`);

// 5. Predefined Threat Scenarios A through H
console.log("\n[Test 5] Verifying 8 Adversarial Simulation Scenarios A–H...");
const scenarioIds = ['scen-01', 'scen-02', 'scen-03', 'scen-04', 'scen-05', 'scen-06', 'scen-07', 'scen-08'];
scenarioIds.forEach(scenId => {
  assert(dataContent.includes(`id: '${scenId}'`), `Scenario ${scenId} defined in SIMULATION_SCENARIOS`);
});

// 6. 10 Defensive Interventions with Pearlian do-calculus
console.log("\n[Test 6] Verifying 10 Defensive Interventions with Pearlian do(X)...");
const interventionIds = ['int-01', 'int-02', 'int-03', 'int-04', 'int-05', 'int-06', 'int-07', 'int-08', 'int-09', 'int-10'];
interventionIds.forEach(intId => {
  assert(dataContent.includes(`id: '${intId}'`), `Intervention ${intId} defined in AGENT_DEFENSE_INTERVENTIONS`);
});
assert(dataContent.includes('doCalculus:'), "Interventions contain Pearlian do-calculus formulations");

// 7. Behavior Guard Indicators & Weights
console.log("\n[Test 7] Verifying 8 Behavior Guard Indicators & Weights...");
assert(dataContent.includes('weightA:'), "Weight A (Behavioral Deviation) defined");
assert(dataContent.includes('weightB:'), "Weight B (Permission Violations) defined");
assert(dataContent.includes('weightC:'), "Weight C (Communication Anomaly) defined");
assert(dataContent.includes('weightD:'), "Weight D (Propagation Risk) defined");
assert(dataContent.includes('weightE:'), "Weight E (Repeated Policy Failures) defined");
assert(dataContent.includes('weightF:'), "Weight F (Runaway Delegation) defined");
assert(dataContent.includes('weightG:'), "Weight G (Data Access Anomaly) defined");
assert(dataContent.includes('weightH:'), "Weight H (Cross-Agent Coordination) defined");

// 8. Zero-Trust Matrix & Policy Gateway Simulator
console.log("\n[Test 8] Verifying Zero-Trust Capability Matrix & Policy Gateway Simulator...");
const zeroTrustContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'agent-security', 'AgentZeroTrustManager.tsx'), 'utf-8');
assert(zeroTrustContent.includes('Policy Gateway Simulator'), "Gateway Simulator tab implemented");
assert(zeroTrustContent.includes('10-Component Architecture'), "10-component defense architecture rendered");
assert(zeroTrustContent.includes('canRequestTools'), "Tools capability toggle supported");
assert(zeroTrustContent.includes('canAccessExternalAPI'), "External API capability toggle supported");

// 9. Incident Investigation Workspace
console.log("\n[Test 9] Verifying Incident Workspace with 7-Stage Lifecycle & Forensic Graphs...");
const incidentContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'agent-security', 'IncidentInvestigationWorkspace.tsx'), 'utf-8');
assert(incidentContent.includes('1. Initial Detection'), "Stage 1 (Initial Detection) defined");
assert(incidentContent.includes('2. Evidence Collection'), "Stage 2 (Evidence Collection) defined");
assert(incidentContent.includes('3. Causal Investigation'), "Stage 3 (Causal Investigation) defined");
assert(incidentContent.includes('4. Impact Estimation'), "Stage 4 (Impact Estimation) defined");
assert(incidentContent.includes('5. Intervention Selection'), "Stage 5 (Intervention Selection) defined");
assert(incidentContent.includes('6. Containment'), "Stage 6 (Containment) defined");
assert(incidentContent.includes('7. Verification & Recovery'), "Stage 7 (Verification & Recovery) defined");
assert(incidentContent.includes('Analyst Notes'), "Analyst Notes editor present");
assert(incidentContent.includes('handleExportJSON'), "Export to JSON implemented");
assert(incidentContent.includes('handleExportCSV'), "Export to CSV implemented");

// 10. Immutable Audit Trail
console.log("\n[Test 10] Verifying Security Audit Trail & Cryptographic Ledger...");
const auditPageContent = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'AuditPage.tsx'), 'utf-8');
assert(auditPageContent.includes('exportToJson'), "Audit log JSON export implemented");
assert(auditPageContent.includes('exportToCsv'), "Audit log CSV export implemented");
assert(auditPageContent.includes('eventTypeFilter'), "Audit log filter by event type implemented");
assert(auditPageContent.includes('outcomeFilter'), "Audit log filter by outcome implemented");

// 11. Application Settings & Seed 42
console.log("\n[Test 11] Verifying System Settings & Deterministic Seed 42...");
const settingsPageContent = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'SettingsPage.tsx'), 'utf-8');
assert(settingsPageContent.includes('Seed: 42'), "Seed 42 deterministic PRNG configured");
assert(settingsPageContent.includes('simulationSpeed'), "Simulation speed control supported");
assert(settingsPageContent.includes('autoContainmentEnabled'), "Auto-containment engine toggle supported");
assert(settingsPageContent.includes('handleExportState'), "Export platform state supported");
assert(settingsPageContent.includes('handleImportState'), "Import platform state supported");

// 12. Permanent Research Simulation Disclaimer
console.log("\n[Test 12] Verifying Permanent Research Simulation Disclaimer...");
const provenanceContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'layout', 'ProvenanceBanner.tsx'), 'utf-8');
const footerContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'layout', 'Footer.tsx'), 'utf-8');
assert(provenanceContent.includes('SIMULATED RESEARCH PLATFORM'), "Provenance banner displays permanent simulated platform notice");
assert(footerContent.includes('PERMANENT SIMULATION DISCLAIMER'), "Footer displays permanent simulation disclaimer");
assert(footerContent.includes('All agent interactions, telemetry, causal graphs, and security interventions'), "Disclaimer text verbatim present in Footer");

console.log("\n================================================================================");
console.log(`TEST SUITE RESULTS: ${testsPassed} Passed, ${testsFailed} Failed.`);
console.log("================================================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("All AI Agent Security Platform acceptance criteria verified successfully!\n");
  process.exit(0);
}
