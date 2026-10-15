import { AttackStage } from '../types/cyber';

export const ATTACK_STAGES: AttackStage[] = [
  {
    step: 0,
    name: "Step 0 — Normal Baseline",
    subtitle: "Steady-state enterprise and OT operations",
    description: "All enterprise workstations, DMZ web services, and industrial SCADA controllers operate within nominal traffic bounds. Background traffic exhibits normal dispersion across subnet bridges.",
    technicalMechanism: "Benign Poisson flow distributions, low Top-1 edge concentration (S1 ≈ 0.35–0.45), high normalized edge entropy (H ≈ 0.70–0.85).",
    activeAgents: [],
    compromisedNodes: [],
    suspiciousNodes: [],
    highVolumeEdges: [],
    metrics: {
      affectedHosts: 0,
      totalVolume: 8400,
      avgRiskScore: 0.12,
      top1Concentration: 0.38,
      edgeEntropy: 0.81
    }
  },
  {
    step: 1,
    name: "Step 1 — Reconnaissance & Port Probing",
    subtitle: "Agent 1 scans perimeter ingress and DMZ endpoints",
    description: "Agent 1 (Reconnaissance) initiates asynchronous SYN sweeps and service banner grabbing against the Perimeter NAT Gateway and public DMZ web servers, altering destination-port entropy.",
    technicalMechanism: "Elevated flow volume on external edges; destination-port entropy shift; perimeter NAT gateway aggregates multi-source probes into a single internal target queue.",
    activeAgents: [
      {
        id: "agent-1",
        name: "Agent 1: Reconnaissance",
        role: "Probing & Topology Mapping",
        action: "Asynchronous TCP SYN sweep against perimeter gateway ports 80, 443, 8443, and 3389."
      }
    ],
    compromisedNodes: [],
    suspiciousNodes: ["gw-nat-01", "fw-perimeter-02", "dmz-web-01"],
    highVolumeEdges: ["e-ext1-gw", "e-gw-fw"],
    metrics: {
      affectedHosts: 2,
      totalVolume: 12600,
      avgRiskScore: 0.34,
      top1Concentration: 0.62,
      edgeEntropy: 0.58
    }
  },
  {
    step: 2,
    name: "Step 2 — Exploitation & Initial Pivot",
    subtitle: "Agent 2 breaches DMZ Host 1 and pivots internally",
    description: "Agent 2 weaponizes a critical vulnerability (CVE-2024-38856) on DMZ Web Server 1, installs an in-memory reverse shell communicating with External C2, and initiates lateral movement toward the Corporate Domain Admin PC.",
    technicalMechanism: "High concentration of internal SMB/RDP flows from DMZ Web Server 1 to Corporate Admin PC. Top-1 edge concentration spikes on incident links (S1 = 0.85).",
    activeAgents: [
      {
        id: "agent-2",
        name: "Agent 2: Exploitation & Lateral Movement",
        role: "Host Infiltration & Persistence",
        action: "Remote code execution on DMZ Web Server 1; credential dumping via LSASS memory scraping; lateral SMB pivot to Admin PC."
      }
    ],
    compromisedNodes: ["dmz-web-01", "corp-admin-pc"],
    suspiciousNodes: ["corp-eng-01", "ot-field-gw"],
    highVolumeEdges: ["e-fw-web1", "e-web1-admin", "e-ext2-gw"],
    metrics: {
      affectedHosts: 4,
      totalVolume: 16800,
      avgRiskScore: 0.58,
      top1Concentration: 0.74,
      edgeEntropy: 0.44
    }
  },
  {
    step: 3,
    name: "Step 3 — Coordinated Volumetric Distraction",
    subtitle: "Agent 3 launches DDoS distraction while Agent 2 infiltrates OT",
    description: "Agent 3 unleashes a synchronized, high-volume volumetric flood against the Perimeter Gateway and DMZ Web Server 2 to saturate firewall queues and create decoy telemetry alarms. Simultaneously, Agent 2 stealthily traverses Engineering Workstation 1, crosses the OT Field Gateway, and compromises the SCADA HMI and Historian.",
    technicalMechanism: "Critical multi-agent coordination window: Associational/correlation IDS falsely attributes high risk to DMZ Web Server 2 and floods, generating spurious cross-subnet edges. Causal discovery isolates the true attack chain traversing into OT.",
    activeAgents: [
      {
        id: "agent-3",
        name: "Agent 3: Volumetric Distraction",
        role: "Coordinated DDoS Saturation",
        action: "Saturates edge NAT firewall with 50,000 pps UDP/SYN amplification flood aimed at Web Server 2."
      },
      {
        id: "agent-2",
        name: "Agent 2: Exploitation & Lateral Movement",
        role: "Host Infiltration & Persistence",
        action: "Exploits engineering trust relationship; injects malicious Modbus function codes across OT Field Gateway into SCADA HMI."
      }
    ],
    compromisedNodes: ["dmz-web-01", "corp-admin-pc", "corp-eng-01", "ot-field-gw", "ot-scada-hmi", "ot-historian"],
    suspiciousNodes: ["dmz-web-02", "core-switch-master"],
    highVolumeEdges: ["e-ext1-gw", "e-gw-fw", "e-fw-web2", "e-admin-eng1", "e-eng1-otgw", "e-otgw-hmi", "e-hmi-hist"],
    metrics: {
      affectedHosts: 6,
      totalVolume: 34500,
      avgRiskScore: 0.76,
      top1Concentration: 0.88,
      edgeEntropy: 0.32
    }
  },
  {
    step: 4,
    name: "Step 4 — Crown Jewels Exfiltration Attempt",
    subtitle: "Hypothetical exfiltration chain targets Core Master Database",
    description: "Agent 2 leverages authenticated historian ODBC credentials and hijacked core backbone switch routing to breach the Crown Jewels Master Database, attempting encrypted exfiltration back toward External C2.",
    technicalMechanism: "Exfiltration connection established from Crown Jewels Master DB to Core Switch and external controller. Attack Success Rate reaches 27.00% under baseline with 3.63 affected core hosts.",
    activeAgents: [
      {
        id: "agent-2",
        name: "Agent 2: Exploitation & Lateral Movement",
        role: "Host Infiltration & Persistence",
        action: "Executes bulk SQL dump query on Crown Jewels DB (10.30.1.100) and prepares outbound TLS exfiltration chunking."
      }
    ],
    compromisedNodes: ["dmz-web-01", "corp-admin-pc", "corp-eng-01", "ot-field-gw", "ot-scada-hmi", "ot-historian", "core-crown-jewels-db"],
    suspiciousNodes: ["core-switch-master", "core-db-replica"],
    highVolumeEdges: ["e-hist-db", "e-switch-db", "e-admin-switch"],
    metrics: {
      affectedHosts: 7,
      totalVolume: 42000,
      avgRiskScore: 0.89,
      top1Concentration: 0.91,
      edgeEntropy: 0.26
    }
  }
];
