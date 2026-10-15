import { 
  ForecastingModelRecord, 
  AblationRecord, 
  NatSensitivityRecord, 
  ReferenceRecord,
  InterventionPolicy
} from '../types/cyber';

export const PAPER_METADATA = {
  title: "Cyber Morphogenesis: Causal Discovery and Counterfactual Defense Against Coordinated Multi-Agent Attacks in Dynamic Cyber Systems",
  venue: "IEEE Transactions on Information Forensics and Security (Simulated Submission / IEEE Style)",
  authors: [
    { name: "Dr. Alex R. Vance", affiliation: "Dept. of Cybersecurity & Network Intelligence, Turing Cyber Institute", email: "a.vance@turing-cyber.org" },
    { name: "Elena Rostova", affiliation: "Center for Causal AI & Graph Intelligence, Institute for Advanced Study", email: "e.rostova@causal-graph.edu" },
    { name: "Kunal Madhavai", affiliation: "Dept. of Computer Science & Distributed Systems", email: "kunalmadhavai301@gmail.com" },
    { name: "Marcus Thorne", affiliation: "Industrial Cyber-Physical Systems Laboratory", email: "m.thorne@icps-research.org" }
  ],
  abstract: "Modern enterprise and cyber-physical networks face increasingly sophisticated coordinated multi-agent attacks that exploit dynamic topological shifts, perimeter address translation, and ephemeral communications to evade conventional defenses. Existing graph neural network (GNN) and intrusion detection frameworks rely heavily on static or associational graph representations, rendering them vulnerable to node-degree blindness under Network Address Translation (NAT) and unable to distinguish genuine causal propagation from spurious statistical correlations. In this paper, we propose Cyber Morphogenesis, a unified framework combining dynamic graph representation learning, time-lagged causal discovery, and counterfactual defense under Pearl's do-calculus. Cyber Morphogenesis models network activity as a time-evolving attributed multigraph, preserving edge-weight concentration and temporal dependencies to overcome identity collapse. We formulate a vector autoregressive causal discovery engine with false discovery rate control to reconstruct directed causal attack chains despite unobserved confounding. Leveraging structural causal models, the framework evaluates counterfactual interventions—such as selective host isolation, link throttling, and adaptive timeout control—optimizing the Pareto trade-off between attack containment and operational availability. Extensive simulations on a 32-node enterprise/OT testbed demonstrate that Cyber Morphogenesis reconstructs the causal attack topology with a Structural Hamming Distance of 15 (vs. 19 for correlation), achieves 0.942 next-step infection forecasting F1-score with graceful multi-horizon degradation (0.842 at h=5), reduces Attack Success Rate from 27.00% to 9.60% (a 64.44% relative reduction), and maintains robust detection (AUC 0.976–0.986) across the full spectrum of NAT collapse ratios where classical node degree fails entirely.",
  keywords: ["Dynamic cyber graphs", "causal discovery", "counterfactual defense", "coordinated multi-agent attacks", "Network Address Translation (NAT)", "Pearlian do-calculus", "temporal graph neural networks (C-TGNN)"]
};

// Research Questions
export const RESEARCH_QUESTIONS = [
  {
    id: "RQ1",
    title: "Dynamic Causal Discovery",
    question: "Can time-lagged conditional independence and edge-weight concentration reconstruct the true causal DAG of multi-agent attacks under identity collapse and background noise, outperforming correlation-based graphs?",
    summary: "Evaluates whether time-lagged vector autoregressive testing with Benjamini-Hochberg FDR control reduces Structural Hamming Distance compared to Pearson correlation.",
    paperMetric: "SHD 15 (Causal) vs 19 (Correlation)",
    status: "Verified in Paper (Table II)"
  },
  {
    id: "RQ2",
    title: "Attack Propagation Forecasting",
    question: "Does conditioning on an evolving causal graph improve multi-step attack progression prediction across extended temporal horizons compared to static GCN, LSTM, and random walk baselines?",
    summary: "Tests whether message passing restricted strictly to verified causal edges in C-TGNN preserves predictive accuracy as the forecast horizon expands from h=1 to h=5.",
    paperMetric: "F1 = 0.942 (h=1) → 0.842 (h=5), delta = -0.100 (graceful vs -0.192 GCN)",
    status: "Verified in Paper (Table III)"
  },
  {
    id: "RQ3",
    title: "Counterfactual Intervention Evaluation",
    question: "How effectively can Pearl's do-calculus evaluate alternative defensive interventions (host isolation, path throttling, timeout adaptation) to minimize the Attack Success Rate (ASR) while constraining the Service Disruption Rate (SDR)?",
    summary: "Simulates prospective 'what-if' countermeasures without taking down live production, discovering that naive host isolation fails due to adversary rerouting while joint defense achieves Pareto optimality.",
    paperMetric: "Joint Defense: ASR 9.60% (from 27.00%), SDR 5.01%",
    status: "Verified in Paper (Table IV)"
  },
  {
    id: "RQ4",
    title: "Adversarial Robustness & NAT Adaptation",
    question: "Does the proposed framework maintain its defensive efficacy when coordinated attackers adaptively alter their strategies and operate across NAT identity-collapse conditions?",
    summary: "Sweeps the collapse ratio k from 1 to 128 to determine whether causal discovery avoids the crossover failure observed in node degree and edge weight concentration.",
    paperMetric: "Causal AUC invariant at 0.976–0.986 across all k",
    status: "Verified in Paper (Table VI)"
  }
];

// Table II: Causal Graph Reconstruction vs Correlation Baseline
export const TABLE_II_CAUSAL_RECONSTRUCTION = [
  {
    method: "Pearson Correlation Graph",
    precision: 0.167,
    recall: 0.429,
    f1: 0.240,
    shd: 19,
    interpretation: "Higher SHD error due to spurious bidirectional cross-subnet edges generated by simultaneous traffic floods and background noise."
  },
  {
    method: "Causal Discovery (Ours)",
    precision: 0.167,
    recall: 0.286,
    f1: 0.211,
    shd: 15,
    interpretation: "Lower SHD (15 vs 19) demonstrates fewer structural reconstruction errors. Conservative edge selection rejects non-causal associations, trading off recall for causal validity."
  }
];

// Table III: Attack Propagation Forecasting Across Horizons
export const TABLE_III_FORECASTING: ForecastingModelRecord[] = [
  {
    model: "Causal-TGNN (Proposed)",
    isProposed: true,
    precision: { h1: 0.957, h3: 0.907, h5: 0.857 },
    recall: { h1: 0.932, h3: 0.882, h5: 0.832 },
    f1: { h1: 0.942, h3: 0.892, h5: 0.842 },
    degradationDelta: -0.100
  },
  {
    model: "Static GCN",
    precision: { h1: 0.875, h3: 0.779, h5: 0.683 },
    recall: { h1: 0.845, h3: 0.749, h5: 0.653 },
    f1: { h1: 0.865, h3: 0.769, h5: 0.673 },
    degradationDelta: -0.192
  },
  {
    model: "LSTM",
    precision: { h1: 0.820, h3: 0.690, h5: 0.560 },
    recall: { h1: 0.782, h3: 0.652, h5: 0.522 },
    f1: { h1: 0.812, h3: 0.682, h5: 0.552 },
    degradationDelta: -0.260
  },
  {
    model: "Random Walk Baseline",
    precision: { h1: 0.640, h3: 0.476, h5: 0.312 },
    recall: { h1: 0.580, h3: 0.416, h5: 0.252 },
    f1: { h1: 0.620, h3: 0.456, h5: 0.292 },
    degradationDelta: -0.328
  }
];

// Table IV: Counterfactual Defensive Interventions Evaluation
export const TABLE_IV_DEFENSE_POLICIES: InterventionPolicy[] = [
  {
    id: "p1",
    key: "baseline",
    name: "Baseline (No Intervention / Status Quo)",
    doCalculus: "do(\\emptyset)",
    description: "The cyber system operates under standard monitoring without active intervention.",
    rationale: "Establishes baseline unmitigated attack metrics against the multi-agent adversary.",
    isolatedNodes: [],
    throttledEdges: [],
    severedEdges: [],
    paperReported: {
      asr: 27.00,
      affectedHosts: 3.63,
      ttc: 26.35,
      sdr: 0.00
    },
    simulationSample: {
      asr: 27.15,
      affectedHosts: 3.61,
      ttc: 26.42,
      sdr: 0.00
    }
  },
  {
    id: "p2",
    key: "isolate_dmz1",
    name: "do(Isolate DMZ Host 1)",
    doCalculus: "do(\\mathcal{E}_{incident}(\\text{DMZ-1}) = \\emptyset)",
    description: "Sever all network communication incident to DMZ Web Server 1 immediately upon detecting compromise.",
    rationale: "Standard signature-based response. The paper documents that isolating DMZ Host 1 paradoxically increases ASR to 29.00% because the multi-agent adversary adaptively pivots through parallel unthrottled routes (Web Server 2 and Auth Proxy) while imposing 9.98% operational disruption.",
    isolatedNodes: ["dmz-web-01"],
    throttledEdges: [],
    severedEdges: ["fw-perimeter-02->dmz-web-01", "dmz-web-01->corp-admin-pc"],
    paperReported: {
      asr: 29.00,
      affectedHosts: 3.67,
      ttc: 27.08,
      sdr: 9.98,
      unfavorableNote: "Unfavorable Paper Finding: ASR increases +2.00 pp because attacker shifts lateral trajectory through parallel unthrottled DMZ paths while operational service is lost."
    },
    simulationSample: {
      asr: 28.90,
      affectedHosts: 3.68,
      ttc: 27.12,
      sdr: 9.98
    }
  },
  {
    id: "p3",
    key: "throttle_gateway",
    name: "do(Throttle Gateway & Dynamic Timeout)",
    doCalculus: "do(\\omega(gw) \\leftarrow \\gamma \\omega, \\Delta t_{flow} \\uparrow)",
    description: "Restrict entry ingress bandwidth and adapt flow-expiration timeouts at the perimeter NAT gateway.",
    rationale: "Collapses external volumetric flood traffic, limits C2 bandwidth, and forces stealthy ephemeral connections to remain recorded in flow tables.",
    isolatedNodes: [],
    throttledEdges: ["ext-recon-01->gw-nat-01", "ext-c2-02->gw-nat-01", "gw-nat-01->fw-perimeter-02"],
    severedEdges: [],
    paperReported: {
      asr: 10.30,
      affectedHosts: 2.51,
      ttc: 17.52,
      sdr: 2.98
    },
    simulationSample: {
      asr: 10.45,
      affectedHosts: 2.53,
      ttc: 17.48,
      sdr: 2.98
    }
  },
  {
    id: "p4",
    key: "isolate_admin",
    name: "do(Isolate Admin PC)",
    doCalculus: "do(\\mathcal{E}_{incident}(\\text{Admin-PC}) = \\emptyset)",
    description: "Cut off the Domain Admin PC from the internal mesh upon suspicious privilege escalation alerts.",
    rationale: "Aggressively protects the administrative station, but incurs a prohibitive 21.57% Service Disruption Rate across corporate IT while barely changing ASR (27.10% vs 27.00%) as the attacker can still pivot through OT historians or file servers.",
    isolatedNodes: ["corp-admin-pc"],
    throttledEdges: [],
    severedEdges: ["dmz-web-01->corp-admin-pc", "dmz-web-02->corp-admin-pc", "corp-admin-pc->corp-dc-dns", "corp-admin-pc->corp-eng-01", "corp-admin-pc->corp-eng-02", "corp-admin-pc->core-switch-master"],
    paperReported: {
      asr: 27.10,
      affectedHosts: 3.69,
      ttc: 27.51,
      sdr: 21.57,
      unfavorableNote: "High Disruption Penalty: 21.57% SDR with virtually no defense benefit (27.10% ASR) because adversary bypasses admin host to reach core target via OT."
    },
    simulationSample: {
      asr: 27.20,
      affectedHosts: 3.71,
      ttc: 27.45,
      sdr: 21.57
    }
  },
  {
    id: "p5",
    key: "joint_defense",
    name: "Cyber Morphogenesis Joint Defense",
    doCalculus: "do(a^*) = \\arg\\min [\\mathbb{E}[Y \\mid do(a)] + \\lambda \\mathcal{C}(a)]",
    description: "Optimized joint policy: Choke-point throttling of ingress, selective isolation of high-centrality pivot nodes, and dynamic flow timeout adaptation.",
    rationale: "Achieves the lowest compromise rate (9.60%), lowest affected hosts (2.49), fastest containment (17.57 s), and minimal service impact (5.01%), defining the optimal Pareto frontier.",
    isolatedNodes: ["dmz-web-01"],
    throttledEdges: ["ext-recon-01->gw-nat-01", "ext-c2-02->gw-nat-01", "gw-nat-01->fw-perimeter-02", "dmz-auth-proxy->corp-ldap-auth"],
    severedEdges: ["dmz-web-01->corp-admin-pc"],
    paperReported: {
      asr: 9.60,
      affectedHosts: 2.49,
      ttc: 17.57,
      sdr: 5.01,
      asrRelReduction: 64.44, // (27.00 - 9.60) / 27.00 * 100
      asrAbsReduction: 17.40  // 27.00 - 9.60 percentage points
    },
    simulationSample: {
      asr: 9.55,
      affectedHosts: 2.48,
      ttc: 17.60,
      sdr: 5.01
    }
  }
];

// Table V: Architectural Ablation Study Results
export const TABLE_V_ABLATION: AblationRecord[] = [
  {
    configuration: "Full Cyber Morphogenesis Framework",
    isFull: true,
    f1: 96.84,
    precision: 97.41,
    recall: 96.28,
    asrDrop: 83.45,
    falseAlarmRate: 0.12,
    deltaF1: 0.0,
    notes: "Complete framework incorporating dynamic graph learning, time-lagged causal discovery, and Pearlian counterfactual defense."
  },
  {
    configuration: "w/o Causal Discovery (Correlation Only)",
    f1: 84.15,
    precision: 78.30,
    recall: 91.02,
    asrDrop: 52.10,
    falseAlarmRate: 4.65,
    deltaF1: -12.69,
    notes: "Relying on statistical correlations inflates false alarms to 4.65% and drops precision by 19.11 pp due to spurious flood-induced edges."
  },
  {
    configuration: "w/o Temporal Graph Dynamics (Static)",
    f1: 88.60,
    precision: 89.20,
    recall: 88.01,
    asrDrop: 61.20,
    falseAlarmRate: 1.85,
    deltaF1: -8.24,
    notes: "Static snapshots fail to track high-churn coordinated multi-agent attack transitions across observation windows."
  },
  {
    configuration: "w/o Counterfactual Reasoning (Heuristic)",
    f1: 96.10,
    precision: 96.80,
    recall: 95.40,
    asrDrop: 44.80,
    falseAlarmRate: 0.14,
    deltaF1: -0.74,
    notes: "High detection score retained, but ASR Drop plummets from 83.45% to 44.80% because interventions rely on heuristic rules instead of causal graph surgery."
  }
];

// Table VI: Sensitivity to NAT Collapse Ratio k
export const TABLE_VI_NAT_SWEEP: NatSensitivityRecord[] = [
  {
    k: 1,
    label: "k = 1 (Full NAT Collapse)",
    nodeDegreeAuc: 0.612,
    edgeWeightAuc: 0.998,
    causalDiscoveryAuc: 0.985,
    state: "Node-degree blind (0.612); Edge-weight perfect (0.998); Causal robust (0.985)"
  },
  {
    k: 2,
    label: "k = 2",
    nodeDegreeAuc: 0.615,
    edgeWeightAuc: 0.958,
    causalDiscoveryAuc: 0.982,
    state: "Transition zone: edge weight begins degrading as external identities increase."
  },
  {
    k: 4,
    label: "k = 4 (Trough / Crossover)",
    nodeDegreeAuc: 0.620,
    edgeWeightAuc: 0.504,
    causalDiscoveryAuc: 0.976,
    state: "Failure trough: edge-weight concentration collapses to chance (0.504) while node degree has not recovered (0.620). Causal discovery remains robust (0.976)."
  },
  {
    k: 8,
    label: "k = 8",
    nodeDegreeAuc: 0.635,
    edgeWeightAuc: 0.610,
    causalDiscoveryAuc: 0.978,
    state: "Intermediate regime: edge weight plateaus; node degree slowly climbs."
  },
  {
    k: 16,
    label: "k = 16",
    nodeDegreeAuc: 0.690,
    edgeWeightAuc: 0.612,
    causalDiscoveryAuc: 0.980,
    state: "Intermediate regime: degree features begin to gain signal as identities disperse."
  },
  {
    k: 32,
    label: "k = 32 (Interpolated Range)",
    nodeDegreeAuc: 0.829, // interpolated between 0.690 and 0.968
    edgeWeightAuc: 0.611,
    causalDiscoveryAuc: 0.982,
    state: "Intermediate value (unspecified in paper table; represented as interpolated estimate within reported range 0.976–0.986)",
    isIntermediate: true
  },
  {
    k: 64,
    label: "k = 64",
    nodeDegreeAuc: 0.968,
    edgeWeightAuc: 0.610,
    causalDiscoveryAuc: 0.984,
    state: "Node degree strongly recovers (0.968) as individual IPs become distinct."
  },
  {
    k: 128,
    label: "k = 128 (Visible Identity)",
    nodeDegreeAuc: 0.998,
    edgeWeightAuc: 0.611,
    causalDiscoveryAuc: 0.986,
    state: "No NAT collapse: node degree is perfect (0.998); edge weight plateaus (0.611); causal discovery invariant (0.986)."
  }
];

// All 22 References from the uploaded paper
export const REFERENCES: ReferenceRecord[] = [
  {
    id: 1,
    authors: "Y. Wang, Z. Han, Y. Du, J. Li, and X. He",
    title: "BS-GAT: a network intrusion detection system based on graph neural network for edge computing",
    venue: "Cybersecurity, vol. 8, no. 1, art. no. 27, pp. 1–18",
    year: 2025,
    doi: "10.1186/s42400-024-00296-8",
    keyContribution: "Introduced behavioral similarity rules and degree-balanced neighbor aggregation in edge GNNs."
  },
  {
    id: 2,
    authors: "M. Hasibuzzaman",
    title: "Edge weight concentration overcomes node degree blindness in graph based network intrusion detection",
    venue: "Discover Networks, vol. 2, no. 1, art. no. 34, pp. 1–21",
    year: 2026,
    doi: "10.1007/s44354-026-00048-9",
    keyContribution: "Provided closed-form proof of node-degree blindness under NAT and proved that edge weight concentration rescues detection."
  },
  {
    id: 3,
    authors: "Z. Wang, Y. Yao, and H. Hu",
    title: "Research on network security situation awareness based on graph neural networks",
    venue: "Discover Computing, vol. 29, no. 1, art. no. 114, pp. 1–16",
    year: 2026,
    doi: "10.1007/s10791-026-10003-5",
    keyContribution: "Combined spatial GAT with Temporal Convolutional Networks (TCNs) for situation awareness."
  },
  {
    id: 4,
    authors: "J. Yao and B. Koirala",
    title: "Defense-Aware Temporal Graph Neural Network for fault-tolerant intrusion detection in IIoT–5G environments",
    venue: "Cluster Computing, vol. 29, no. 1, art. no. 319, pp. 1–20",
    year: 2026,
    doi: "10.1007/s10586-026-06037-5",
    keyContribution: "Formulated DTGNN-FIDS with fault-modulated attention layers and k-fault consistency loss."
  },
  {
    id: 5,
    authors: "N. An, Y. Zhu, W. Yan, X. Wu, B. Jiang, J. Liu, and Z. Lu",
    title: "CSCProv: causal-semantic consistent provenance graph compression for attack detection",
    venue: "Cybersecurity, vol. 9, no. 1, art. no. 216, pp. 1–25",
    year: 2026,
    doi: "10.1186/s42400-026-00648-6",
    keyContribution: "Enforced causal-semantic consistency between GCN structural embeddings and SecBERT language representations."
  },
  {
    id: 6,
    authors: "W. Ren, X. Song, Y. Hong, Y. Lei, J. Yao, Y. Du, and W. Li",
    title: "APT Attack Detection Based on Graph Convolutional Neural Networks",
    venue: "International Journal of Computational Intelligence Systems, vol. 16, no. 1, art. no. 184, pp. 1–14",
    year: 2023,
    doi: "10.1007/s44196-023-00369-5",
    keyContribution: "Built knowledge graphs linking CVE, CWE, and CAPEC for GCN-based APT detection."
  },
  {
    id: 7,
    authors: "B. Xu, Y. Gong, X. Geng, Y. Li, C. Dong, S. Liu, Y. Liu, B. Jiang, and Z. Lu",
    title: "ProcSAGE: an efficient host threat detection method based on graph representation learning",
    venue: "Cybersecurity, vol. 7, no. 1, art. no. 51, pp. 1–14",
    year: 2024,
    doi: "10.1186/s42400-024-00240-w",
    keyContribution: "Designed process- and thread-centric GraphSAGE, reducing memory overhead by 78%."
  },
  {
    id: 8,
    authors: "P. Deepanramkumar and A. H. Sharmila",
    title: "GraphINR-IDS: Graph-Topology-Aware implicit neural reconstruction for zero-day intrusion detection in encrypted network traffic",
    venue: "Journal of King Saud University - Computer and Information Sciences, vol. 38, no. 10, art. no. 916, pp. 1–29",
    year: 2026,
    doi: "10.1007/s44443-026-01260-x",
    keyContribution: "Continuous coordinate field modeling of benign traffic via SIREN and Laplacian eigenvectors."
  },
  {
    id: 9,
    authors: "T.-T. Nguyen and M. Park",
    title: "MaGOS-IDS: A Mahalanobis-Enhanced OpenMax Method for Graph Neural Network-Based Intrusion Detection",
    venue: "Electronics, vol. 15, no. 16, art. no. 3667, pp. 1–32",
    year: 2026,
    doi: "10.3390/electronics15163667",
    keyContribution: "Coupled edge-aware GCN with regularized Mahalanobis distance and Extreme Value Theory (EVT) for open-set reject boundaries."
  },
  {
    id: 10,
    authors: "M. A. Makarem, M. A. Razaz, and Z. Saleh",
    title: "Co-Adaptive Attacker–Defender Learning over Attack Graphs: A Stochastic Game Approach to Dynamic Network Defense",
    venue: "Future Internet, vol. 18, no. 5, art. no. 239, pp. 1–25",
    year: 2026,
    doi: "10.3390/fi18050239",
    keyContribution: "Formulated repeated zero-sum stochastic games over attack graphs comparing Q-learning and DQN defenders."
  },
  {
    id: 11,
    authors: "M. Ibrahim, Q. Al-Hindawi, R. Elhafiz, A. Alsheikh, and O. Alquq",
    title: "Attack Graph Implementation and Visualization for Cyber Physical Systems",
    venue: "Processes, vol. 8, no. 1, art. no. 12, pp. 1–22",
    year: 2020,
    doi: "10.3390/pr8010012",
    keyContribution: "Employed AADL, AGREE, and JKind model checking to generate formal attack graphs for cyber-physical systems."
  },
  {
    id: 12,
    authors: "Y. Liu, A. Ye, W. Lu, and L. Yang",
    title: "Detecting advanced persistent threats via heterogeneous graph learning from homophily and heterogeneity views",
    venue: "Cybersecurity, vol. 9, no. 1, art. no. 39, pp. 1–19",
    year: 2026,
    doi: "10.1186/s42400-025-00425-x",
    keyContribution: "Proposed APT-HERA, learning node representations from dual homophily and heterogeneity views."
  },
  {
    id: 13,
    authors: "S. Unger, E. Arzoglou, M. Heinrich, D. Scheuermann, and S. Katzenbeisser",
    title: "Cybersecurity risk assessment in OT systems using attack graphs",
    venue: "International Journal of Information Security, vol. 25, no. 1, art. no. 34, pp. 1–25",
    year: 2026,
    doi: "10.1007/s10207-025-01198-7",
    keyContribution: "Extended attack graphs with feasibility metrics and countermeasure nodes aligned with ISO/SAE 21434 and CLC/TS 50701."
  },
  {
    id: 14,
    authors: "Z. Liu, W. Che, S. Wang, J. Xu, and H. Yin",
    title: "A large-scale data security detection method based on continuous time graph embedding framework",
    venue: "Journal of Cloud Computing, vol. 12, no. 1, art. no. 89, pp. 1–14",
    year: 2023,
    doi: "10.1186/s13677-023-00460-4",
    keyContribution: "Continuous-time dynamic graph representation learning for streaming data security detection."
  },
  {
    id: 15,
    authors: "S. Chatterjee",
    title: "Robust DDoS detection based on adversarial trained graph neural networks with proximal optimization",
    venue: "Social Network Analysis and Mining, vol. 16, no. 1, art. no. 39, pp. 1–14",
    year: 2026,
    doi: "10.1007/s13278-026-01578-4",
    keyContribution: "Proximal-gradient adversarial training for GNNs under adversarial DDoS topology perturbations."
  },
  {
    id: 16,
    authors: "A. Okutan and S. J. Yang",
    title: "ASSERT: attack synthesis and separation with entropy redistribution towards predictive cyber defense",
    venue: "Cybersecurity, vol. 2, no. 1, art. no. 15, pp. 1–18",
    year: 2019,
    doi: "10.1186/s42400-019-0032-0",
    keyContribution: "Dynamic Bayesian classifiers and DBSCAN for streaming attack model synthesis and entropy redistribution."
  },
  {
    id: 17,
    authors: "O. Isaac, B. Appiah, D. Commey, K. Owusu-Agyemang, M. Asante, and B. H. Acquah",
    title: "EdgeFence: Federated Temporal Graph Neural Networks for Lightweight, Adversarial Malware Detection in Distributed Edge Networks",
    venue: "International Journal of Information Security, vol. 25, no. 1, art. no. 88, pp. 1–21",
    year: 2026,
    doi: "10.1007/s10207-026-01237-x",
    keyContribution: "Federated temporal GNNs for lightweight malware detection in distributed resource-constrained edge networks."
  },
  {
    id: 18,
    authors: "R. Esmaeilyfard, Z. Shoaei, and R. Javidan",
    title: "GELAX: IoT botnet detection using dynamic graph pruning and anchored explainable AI",
    venue: "Cybersecurity, vol. 9, no. 1, art. no. 58, pp. 1–28",
    year: 2026,
    doi: "10.1186/s42400-025-00440-y",
    keyContribution: "Dynamic graph pruning and anchored explainable AI for IoT botnet reconnaissance detection."
  },
  {
    id: 19,
    authors: "F. Baiardi and V. Sammartino",
    title: "Simulation-powered cybersecurity: real-time risk assessment via non-intrusive security twin",
    venue: "The Journal of Supercomputing, vol. 82, no. 3, art. no. 311, pp. 1–24",
    year: 2026,
    doi: "10.1007/s11227-026-08454-0",
    keyContribution: "Non-intrusive security twin built from hypoexponential discovery and Monte Carlo adversary simulations."
  },
  {
    id: 20,
    authors: "J. Zhao, D. Zhang, T. Wang, M. Lin, and Y. Yang",
    title: "Dual-autoencoder multi-task self-supervised one-class graph anomaly detection for network traffic",
    venue: "Journal of King Saud University - Computer and Information Sciences, vol. 38, no. 8, art. no. 779, pp. 1–30",
    year: 2026,
    doi: "10.1007/s44443-026-01241-0",
    keyContribution: "Dual autoencoders for local structure and global semantics with Kendall uncertainty weighting and EVT."
  },
  {
    id: 21,
    authors: "M. Miryahyaei, M. Fartash, and J. A. Torkestani",
    title: "Focal Causal Temporal Convolutional Neural Networks: Advancing IIoT Security with Efficient Detection of Rare Cyber-Attacks",
    venue: "Sensors, vol. 24, no. 19, art. no. 6335, pp. 1–26",
    year: 2024,
    doi: "10.3390/s24196335",
    keyContribution: "Focal causal temporal CNNs for hierarchical classification of highly imbalanced rare attacks in IIoT."
  },
  {
    id: 22,
    authors: "G. Prasad and D. P. Sharma",
    title: "Digital Twin-SDN security with adaptive graph entropic intelligence and cross-platform schema harmonization",
    venue: "Journal of Big Data, vol. 13, no. 1, art. no. 133, pp. 1–44",
    year: 2026,
    doi: "10.1186/s40537-025-01357-6",
    keyContribution: "Adaptive graph entropic intelligence and Deep Q-Learning MDP for SDN flow timeout adaptation."
  }
];

// 4 Key Limitations from Section IV-B
export const LIMITATIONS = [
  {
    id: 1,
    title: "Causal Sufficiency Assumption",
    formula: "\\mathbf{U} \\perp\\!\\!\\!\\perp \\mathbf{V}",
    description: "The framework assumes that all critical intermediate communications pass through observable network telemetry vantage points. Unmonitored out-of-band communication channels (such as physical USB transfers or unmonitored encrypted side-channels) introduce latent confounding that can degrade causal graph estimation.",
    severity: "Medium-High",
    impact: "Unobserved adversary links can cause causal edges to be missed or falsely attributed."
  },
  {
    id: 2,
    title: "Stationarity Within Estimation Windows",
    formula: "\\tau \\in [1, \\tau_{\\max}] \\text{ under } \\Delta t",
    description: "The time-lagged vector autoregressive tests assume local stationarity across the immediate sliding observation window. Extremely abrupt, sub-second tactical shifts by adversaries may require finer micro-batching to avoid parameter drift.",
    severity: "Medium",
    impact: "Rapidly mutating attack techniques during a single window can dilute statistical test power."
  },
  {
    id: 3,
    title: "Single-Domain Emulation",
    formula: "|\\mathcal{V}| = 32 \\text{ enterprise/OT testbed}",
    description: "While the evaluated topology captures DMZ, corporate, and OT subnets, extensive cross-organization validation on live production clouds with tens of thousands of hosts remains to be conducted.",
    severity: "Medium",
    impact: "Findings reflect the simulated 32-node architecture and warrant multi-tenant cloud validation."
  },
  {
    id: 4,
    title: "Computational Complexity of Causal Search",
    formula: "\\mathcal{O}(|\\mathcal{V}|^2 \\cdot \\tau_{\\max})",
    description: "Pairwise conditional independence testing scales quadratically with network vertex count, requiring hierarchical subnet partitioning for hyperscale deployment.",
    severity: "High for Large Networks",
    impact: "Real-time discovery on networks with >10,000 nodes requires distributed partition engines."
  }
];

// 3 Future Research Directions from Section IV-C
export const FUTURE_DIRECTIONS = [
  {
    id: 1,
    title: "Continuous-Time Neural Causal SCMs",
    tagline: "Neural ODEs & Event-Triggered Graph Embeddings",
    description: "Integrating neural ordinary differential equations (Neural ODEs) and continuous-time graph embeddings to model causal attack flows without discrete time-windowing, enabling instant sub-millisecond reaction."
  },
  {
    id: 2,
    title: "Decentralized Multi-Agent Counterfactual Reinforcement Learning",
    tagline: "Federated Zero-Trust Defense Swarms",
    description: "Developing distributed, federated multi-agent defense agents that learn cooperative counterfactual containment policies across independent zero-trust cloud domains without centralizing telemetry."
  },
  {
    id: 3,
    title: "Empirical Validation in Operational Cyber Ranges",
    tagline: "Live Red-Team Zero-Day Engagements",
    description: "Deploying the framework within large-scale live cyber ranges featuring active human red teams to quantify resilience against novel zero-day exploits, evasive obfuscation, and multi-cloud pivot campaigns."
  }
];

// Important Mathematical Formulations
export const MATHEMATICAL_FORMULATIONS = [
  {
    id: "eq1",
    name: "Dynamic Cyber Graph Representation",
    number: "1",
    section: "II-A",
    latex: "\\mathcal{G}_t = (\\mathcal{V}_t, \\mathcal{E}_t, \\mathbf{X}_t, \\mathbf{W}_t)",
    explanation: "Models the cyber infrastructure at observation window t as a directed, attributed temporal multigraph where V is the active node set, E represents directed flows, X contains node state features, and W stores flow metrics."
  },
  {
    id: "eq2",
    name: "Aggregated Edge Weight",
    number: "2",
    section: "II-A",
    latex: "\\omega(u, v) = \\sum_{f \\in \\mathcal{F}_{uv}} \\text{FlowCount}(f)",
    explanation: "Aggregates individual transport flows between host u and v into an edge weight, preserving total communication volume even when packet headers are compressed."
  },
  {
    id: "eq3",
    name: "Top-1 Edge Share Concentration",
    number: "3",
    section: "II-A",
    latex: "S_1(v, t) = \\frac{\\max_{(u, v) \\in \\mathcal{E}_t} \\omega(u, v)}{\\sum_{(i, j) \\in \\mathcal{E}_t} \\omega(i, j)}",
    explanation: "Measures the ratio of the highest single connection weight to total incoming/outgoing traffic. Under NAT, a single compromised route creates high concentration while node degree stays identical."
  },
  {
    id: "eq4",
    name: "Normalized Edge Entropy",
    number: "4",
    section: "II-A",
    latex: "\\mathcal{H}_{\\text{edge}}(t) = - \\sum_{i=1}^{|\\mathcal{E}_t|} p_i \\log_2 p_i, \\quad p_i = \\frac{\\omega_i}{\\sum_j \\omega_j}",
    explanation: "Quantifies the dispersion of traffic across incident links. A coordinated volumetric flood or rapid exfiltration significantly alters entropy."
  },
  {
    id: "eq5",
    name: "Edge-Centric E-GraphSAGE Spatial Encoder",
    number: "5",
    section: "II-A",
    latex: "\\mathbf{h}_v^{(l)} = \\sigma \\left( \\mathbf{W}_{\\text{self}}^{(l)} \\mathbf{h}_v^{(l-1)} + \\mathbf{W}_{\\text{neigh}}^{(l)} \\sum_{u \\in \\mathcal{N}(v)} \\frac{\\mathbf{h}_u^{(l-1)} \\parallel \\mathbf{e}_{uv}}{\\sqrt{|\\mathcal{N}(v)||\\mathcal{N}(u)|}} \\right)",
    explanation: "Integrates edge feature vectors e_{uv} (carrying Top-1 share and entropy) directly into message passing, ensuring NAT-collapsed nodes transfer volume cues."
  },
  {
    id: "eq6",
    name: "Structural Causal Model (SCM)",
    number: "6",
    section: "II-B",
    latex: "X_i(t) = f_i(\\mathbf{PA}_i(t), \\mathbf{U}_i(t))",
    explanation: "Defines each host's security state as an invariant structural function f_i of its causal parents PA_i(t) in prior time windows and exogenous noise U_i(t)."
  },
  {
    id: "eq7",
    name: "Time-Lagged Conditional Independence Test",
    number: "7",
    section: "II-B",
    latex: "H_0: X_v(t) \\perp\\!\\!\\!\\perp X_u(t - \\tau) \\mid \\mathbf{PA}_v(t) \\setminus \\{u\\}",
    explanation: "Tests whether past states of candidate source u at lag tau provide significant predictive power regarding target v after conditioning on v's known parents."
  },
  {
    id: "eq8",
    name: "Unrestricted Vector Autoregressive Model",
    number: "8",
    section: "II-B",
    latex: "X_v(t) = \\sum_{k=1}^{\\tau_{\\max}} \\alpha_k X_v(t - k) + \\sum_{k=1}^{\\tau_{\\max}} \\beta_k X_u(t - k) + \\epsilon_t",
    explanation: "Evaluates the statistical significance of coefficients beta_k using an F-test against the restricted model where beta_k = 0, followed by Benjamini-Hochberg FDR correction."
  },
  {
    id: "eq9",
    name: "C-TGNN Attack Propagation Forecasting",
    number: "9",
    section: "II-D",
    latex: "\\widehat{\\mathbf{y}}_{t+h} = \\text{Softmax}\\left( \\text{C-TGNN}\\left( \\mathcal{G}_{\\text{causal}}, \\mathbf{H}_t, h \\right) \\right)",
    explanation: "Forecasts infection probabilities over horizons h in {1, 3, 5} by restricting spatial aggregation strictly to verified directed causal edges, preventing spurious contamination."
  },
  {
    id: "eq10",
    name: "Pearlian Counterfactual do-Intervention",
    number: "10",
    section: "II-E",
    latex: "\\mathcal{M}_{do(X_i = x^*)}: \\quad X_i = x^*, \\quad X_j = f_j(\\mathbf{PA}_j, \\mathbf{U}_j) \\quad \\forall j \\neq i",
    explanation: "Replaces the structural equation of host or link i with a forced intervention state x*, severing incoming arrows in the causal DAG to compute true counterfactual outcomes."
  },
  {
    id: "eq11",
    name: "Counterfactual Host Isolation Primitive",
    number: "11",
    section: "II-E",
    latex: "do(\\mathcal{E}_{\\text{incident}}(v) = \\emptyset)",
    explanation: "Simulates setting all network link capacities incident to node v to zero in the cyber graph."
  },
  {
    id: "eq12",
    name: "Counterfactual Link Throttling Primitive",
    number: "12",
    section: "II-E",
    latex: "do(\\omega(u, v) \\leftarrow \\gamma \\omega(u, v)), \\quad \\gamma \\in (0, 1)",
    explanation: "Scales the operational bandwidth of link (u, v) down by factor gamma to throttle attacker bandwidth without severing legitimate service completely."
  },
  {
    id: "eq13",
    name: "Joint Security-vs-Disruption Objective",
    number: "13",
    section: "II-E",
    latex: "a^* = \\arg\\min_{a \\in \\mathcal{A}_{\\text{defense}}} \\left[ \\mathbb{E}\\left[ Y_{\\text{compromise}} \\mid do(a) \\right] + \\lambda_{\\text{cost}} \\cdot \\mathcal{C}_{\\text{disruption}}(a) \\right]",
    explanation: "Selects the optimal defensive action that minimizes compromise of the critical crown jewels while penalizing operational service disruption according to operator weight lambda."
  }
];
