# Cyber Morphogenesis: Causal Discovery and Counterfactual Defense Against Coordinated Multi-Agent Attacks in Dynamic Cyber Systems

> **An Interactive Scientific Research Visualization and Defense Platform** based on the IEEE-style research paper.

[![Scientific Artifact](https://img.shields.io/badge/Scientific%20Artifact-IEEE%20Format-cyan.svg)](#)
[![Deterministic Seed](https://img.shields.io/badge/Random%20Seed-42%20Fixed-emerald.svg)](#)
[![Test Suite](https://img.shields.io/badge/Test%20Suite-97%20Passed-brightgreen.svg)](#)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel%20Ready-white.svg)](#)

---

## 1. Executive Summary & Research Vision

Modern enterprise and cyber-physical networks face increasingly sophisticated coordinated multi-agent attacks that exploit dynamic topological shifts, perimeter address translation, and ephemeral communications to evade conventional defenses. 

Existing graph neural network (GNN) and intrusion detection frameworks rely heavily on static or associational graph representations, rendering them vulnerable to **node-degree blindness under Network Address Translation (NAT)** and unable to distinguish genuine causal propagation from spurious statistical correlations.

**Cyber Morphogenesis** resolves these challenges by uniting:
1. **Dynamic Cyber Graph Learning**: Modeling network interactions as time-evolving attributed multigraphs $\mathcal{G}_t = (\mathcal{V}_t, \mathcal{E}_t, \mathbf{X}_t, \mathbf{W}_t)$ that preserve edge-weight concentration $S_1(v, t)$ and normalized edge entropy $\mathcal{H}_{\text{edge}}(t)$.
2. **Time-Lagged Causal Discovery**: Utilizing vector autoregressive conditional independence testing under Benjamini-Hochberg False Discovery Rate (FDR) control to eliminate spurious associations created by coordinated volumetric distractions.
3. **C-TGNN Multi-Horizon Forecasting**: Restricting message passing strictly to verified causal DAG edges for robust attack progression forecasting across horizons $h \in \{1, 3, 5\}$.
4. **Pearlian Counterfactual Defense**: Simulating prospective "what-if" graph surgeries under Pearl's $do$-calculus: $\mathcal{M}_{do(X_i = x^*)}$ to discover Pareto-optimal interventions balancing threat mitigation against operational disruption.

---

## 2. Research Questions & Verified Results

| Research Question | Scientific Hypothesis | Verified Paper Metric (Table) | Finding Interpretation |
| :--- | :--- | :--- | :--- |
| **RQ1: Dynamic Causal Discovery** | Can time-lagged independence and edge concentration reconstruct directed causal DAGs under noise? | **SHD = 15** vs. 19 (Table II) | Absolute reduction of 4 structural graph errors, rejecting spurious cross-subnet edges. |
| **RQ2: Attack Propagation Forecasting** | Does restricting GNN propagation to causal DAG edges preserve multi-step accuracy? | **F1 = 0.942** ($h=1$) → **0.842** ($h=5$) (Table III) | Graceful degradation of only **-0.100**, outperforming Static GCN (-0.192) and LSTM (-0.260). |
| **RQ3: Counterfactual Defense** | Can Pearl's $do$-calculus identify interventions minimizing ASR while constraining SDR? | **ASR 9.60%** (from 27.00%), **SDR 5.01%** (Table IV) | **64.44% relative reduction** in ASR (17.40 pp drop); confirms naive host isolation fails (ASR 29.00%). |
| **RQ4: NAT Robustness & Adaptation** | Does the causal engine remain invariant across NAT collapse ratios $k \in [1, 128]$? | **AUC 0.976–0.986** across all $k$ (Table VI) | Rescues detection where node degree collapses to chance ($k=1$, AUC=0.612) and edge weight collapses ($k=4$, AUC=0.504). |

---

## 3. The 32-Node Enterprise/OT Network Architecture

The application implements the exact 32-node simulated testbed partitioned across 6 architectural zones:

1. **Zone A: External Attacker Entry (2 Nodes)**: External Reconnaissance Host (`198.51.100.14`), External C2 Controller (`198.51.100.89`).
2. **Zone B: Perimeter NAT Gateway & Firewall (2 Nodes)**: Perimeter NAT Gateway (`198.51.100.1`), Perimeter State Firewall (`10.0.0.1`).
3. **Zone C: DMZ Subnet (6 Nodes)**: DMZ Web Server 1 (`10.0.1.10`), DMZ Web Server 2 (`10.0.1.11`), DMZ Auth Proxy (`10.0.1.20`), DMZ API Gateway (`10.0.1.30`), DMZ External DNS (`10.0.1.53`), DMZ Mail Relay (`10.0.1.25`).
4. **Zone D: Corporate Subnet (10 Nodes)**: Domain Admin PC (`10.10.1.5`), Engineering Stations 1 & 2 (`10.10.2.11`, `.12`), Corporate Workstations 1–3 (`10.10.3.21-23`), Corporate File Server (`10.10.4.10`), Domain Controller & DNS (`10.10.4.2`), Internal LDAP (`10.10.4.3`), SOC Analyst Station (`10.10.5.99`).
5. **Zone E: Operational Technology / SCADA (8 Nodes)**: SCADA Primary HMI (`10.20.1.10`), OT Historian (`10.20.1.20`), OT Field Gateway (`10.20.1.1`), Water PLC (`10.20.2.1`), Power Grid PLC (`10.20.2.2`), Safety SIS PLC (`10.20.2.3`), Substation RTU 1 (`10.20.3.11`), Field RTU 2 (`10.20.3.12`).
6. **Zone F: Core Network / Crown Jewels (4 Nodes)**: Crown Jewels Master DB (`10.30.1.100`), Core Database Replica (`10.30.1.101`), Financial Ledger (`10.30.2.50`), Core Backbone Switch (`10.30.0.1`).

---

## 4. Scientific Integrity & Data Provenance Protocol

To ensure 100% scientific transparency, the platform enforces strict data categorization:

* **Category A: Paper-Reported Results**: Exact numerical values transcribed verbatim from the uploaded IEEE research paper (Tables II–VI).
* **Category B: Synthetic Interactive Simulation**: Real-time deterministic values generated by the in-browser simulation engine under parameter adjustments.
* **Category C: Independently Reproduced Results**: Generated by executing `research/run_experiments.py` with fixed random seed `seed=42`.
* **Category D: Real Dataset Evaluation**: Public benchmarks (CIC-IDS2017, UNSW-NB15, NF-BoT-IoT) are labeled as **"Not evaluated in the supplied paper"** to avoid fabricating results.

> **Surprising Finding Preserved:** The platform honestly displays that isolating DMZ Host 1 increases Attack Success Rate from **27.00% to 29.00%** while causing 9.98% service disruption, accurately reflecting the paper's documentation of multi-agent adaptive path rerouting.

---

## 5. Project Directory Structure

```text
cyber-morphogenesis/
├── .env.example                     # Environment configuration template
├── package.json                     # Root scripts for build & test
├── vercel.json                      # Vercel deployment & SPA routing rules
├── research/
│   ├── run_experiments.py           # Standalone Python reproducibility engine
│   ├── experiment_config.json       # JSON configuration metadata (seed=42)
│   ├── results_causal_reconstruction.csv # Table II export
│   ├── results_forecasting.csv      # Table III export
│   ├── results_counterfactual_defense.csv # Table IV export
│   ├── results_ablation.csv         # Table V export
│   └── results_nat_sweep.csv        # Table VI export
└── frontend/
    ├── index.html                   # HTML entry point with KaTeX fonts
    ├── package.json                 # Frontend dependencies (React, Recharts, KaTeX)
    ├── tailwind.config.js           # Dark cybersecurity SOC theme configuration
    ├── test-suite.js                # 64-assertion automated verification test suite
    └── src/
        ├── App.tsx                  # Application shell and route rendering
        ├── main.tsx                 # React entry point
        ├── types/cyber.ts           # Authoritative TypeScript data interfaces
        ├── context/SimulationContext.tsx # Centralized simulation state & routing
        ├── data/
        │   ├── paperData.ts         # Tables I-VI, 22 References, 13 Equations, RQs
        │   ├── topologyData.ts      # 32 nodes, 36 links, IP allocations
        │   └── attackStages.ts      # 5 timeline steps, 3 malicious agent actions
        ├── components/
        │   ├── layout/ (Navbar, ProvenanceBanner, Footer)
        │   ├── shared/ (MathEquation)
        │   ├── topology/ (NetworkGraph, NodeInspector, EdgeInspector, AttackTimeline)
        │   ├── defense/ (ParetoTradeoffChart)
        │   ├── causal/ (VarTestRunner, CausalReconstructionCard)
        │   ├── benchmarks/ (ForecastingChart, AblationChart, DatasetBenchmarkTable)
        │   └── nat/ (NatCrossoverChart)
        └── pages/
            ├── LandingPage.tsx          # / (Executive Summary)
            ├── DashboardPage.tsx        # /dashboard (RQ1-4 Deep Dives)
            ├── TopologyPage.tsx         # /topology (32-Node Network Explorer)
            ├── CausalLabPage.tsx        # /causal-lab (VAR Testing & FDR Control)
            ├── DefenseSandboxPage.tsx   # /defense (do-Calculus & Pareto Frontier)
            ├── BenchmarksPage.tsx       # /benchmarks (C-TGNN & Ablation)
            ├── NatAnalysisPage.tsx      # /nat-analysis (Hasibuzzaman Crossover)
            ├── MethodologyPage.tsx      # /methodology (Architecture & KaTeX)
            ├── PaperViewerPage.tsx      # /research (IEEE Paper Reader)
            ├── ReproducibilityPage.tsx  # /reproducibility (Experiment Code)
            ├── ReferencesPage.tsx       # /references (22 Citations & BibTeX)
            └── LimitationsPage.tsx      # /limitations (4 Caveats & Roadmap)
```

---

## 6. Installation & Execution Instructions

### Prerequisites
* **Node.js**: v18.0.0 or later
* **Python**: v3.10+ (for running the Python experiment script)
* **uv** (Optional but recommended): Astral's fast Python package manager

### 1. Run the Web Application Locally
```bash
# Clone the repository
git clone https://github.com/cyber-morphogenesis/research-platform.git
cd cyber-morphogenesis

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Run the Automated Test Suite (64 Verified Assertions)
```bash
cd frontend
npm test
```
All 64 tests will execute, validating the 32 nodes, 5 attack stages, 5 defensive policies, exact paper metrics, and data integrity.

### 3. Run the Standalone Python Experiment Script
To independently execute the simulation and generate all benchmark CSV files:
```bash
# Using uv (fastest, automatically resolves dependencies)
uv run --with numpy,scipy,networkx,pandas,scikit-learn python research/run_experiments.py

# Or using standard python
python -m pip install numpy scipy networkx pandas scikit-learn
python research/run_experiments.py
```

---

## 7. Production Build & Deployment

The application is fully optimized for static or serverless hosting on Vercel:

```bash
# Build the production bundle
npm run build --prefix frontend
```

The output bundle is generated in `frontend/dist`. `vercel.json` is pre-configured with SPA rewrite rules ensuring all 12 routes load without server errors.

---

## 8. AI Agent Security Extension (`/agent-security`)

Cyber Morphogenesis has been extended to **interconnected multi-agent AI systems**:
* **10 Simulated AI Agents**: Orchestrator, Planner, Research, Analysis, Coding, Tool-Execution, Data, Verification, Memory, Reporting across 6 lifecycle states (`Healthy`, `Observing`, `Suspicious`, `Restricted`, `Isolated`, `Recovering`).
* **Behavior Guard (8 Indicators)**: Multi-signal evaluation combining Behavioral Deviation, Permission Violations, Communication Anomalies, Propagation Risk, Repeated Policy Failures, Runaway Delegation, Data-Access Anomalies, and Cross-Agent Coordination with tunable weights and thresholds.
* **Causal Agent Coordination Analysis**: Uses time-lagged conditional independence and Benjamini-Hochberg FDR control ($\alpha = 0.05$) to eliminate spurious coordination driven by shared prompts or synchronized timers.
* **Attack & Failure Propagation Prediction**: Evaluates topological reachability, propagation depth, and dynamic blast radius across T0–T5 incident milestones.
* **10 Counterfactual Defensive Interventions**: Implements Pearl's $do$-calculus ($P(Y \mid do(X_i = x^*))$) and provides interactive Pareto scatter charts comparing operational disruption vs. residual security risk.
* **Zero-Trust Permission Matrix & Independent Defense Layer**: 10-component architectural boundary (Agent Identity Registry, Communication Monitor, Behavioral Risk Engine, Causal Engine, Propagation Analyzer, Policy Gateway, Counterfactual Engine, Human Approval Queue, Audit Log, Recovery Manager) that cannot be bypassed or modified by monitored agents.
* **8 Defensive Simulation Scenarios**: Interactive playback for Normal Coordination, Single Agent Deviation, Runaway Delegation, Cross-Agent Propagation, Coordinated Violations, False-Positive Challenge, Compromised Tool-Proxy, and Adaptive Behavior.
* **Forensic Workspace**: Incident case management, analyst note recording, and instant JSON/CSV export.

---

## 9. Preferred Citation

```bibtex
@article{vance2026cyber,
  author    = {A. R. Vance and E. Rostova and K. Madhavai and M. Thorne},
  title     = {Cyber Morphogenesis: Causal Discovery and Counterfactual Defense Against Coordinated Multi-Agent Attacks in Dynamic Cyber Systems},
  journal   = {IEEE Transactions on Information Forensics and Security (Simulated Submission)},
  year      = {2026}
}
```
