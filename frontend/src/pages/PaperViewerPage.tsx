import React, { useState } from 'react';
import { PAPER_METADATA, RESEARCH_QUESTIONS, LIMITATIONS, FUTURE_DIRECTIONS } from '../data/paperData';
import { MathEquation } from '../components/shared/MathEquation';
import { 
  FileText, 
  Search, 
  Printer, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Share2, 
  ExternalLink 
} from 'lucide-react';

export const PaperViewerPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{ [sec: string]: boolean }>({});

  const toggleSection = (sec: string) => {
    setCollapsedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const copyCitation = () => {
    const text = `${PAPER_METADATA.authors.map(a => a.name).join(', ')}, "${PAPER_METADATA.title}," ${PAPER_METADATA.venue}, 2026.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 print:p-0 print:m-0 print:text-black">
      {/* Top Floating Utility Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 sticky top-24 z-20 backdrop-blur-md print:hidden">
        <div className="flex items-center gap-2 text-xs font-mono">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-zinc-200">IEEE Research Paper Reader</span>
        </div>

        <div className="flex items-center gap-2">
          {/* In-paper search */}
          <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-700/80 px-2 py-1 text-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 mr-1.5" />
            <input
              type="text"
              placeholder="Search in paper..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-zinc-200 text-xs focus:outline-none w-36 placeholder:text-zinc-600"
            />
          </div>

          <button
            onClick={copyCitation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? 'Copied' : 'Cite'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* IEEE Paper Document Container */}
      <article className="glass-panel p-8 sm:p-12 rounded-2xl border border-zinc-800 bg-zinc-950/90 space-y-8 text-zinc-300 leading-relaxed font-serif print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Title & Metadata */}
        <header className="text-center space-y-4 border-b border-zinc-800 pb-8 print:border-black">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest print:text-black">
            IEEE TRANSACTIONS ON INFORMATION FORENSICS AND SECURITY (SIMULATED ARTICLE)
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-sans tracking-tight print:text-black">
            {PAPER_METADATA.title}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans text-zinc-400 pt-2 print:text-black">
            {PAPER_METADATA.authors.map((author, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-zinc-200 print:text-black">{author.name}</div>
                <div className="text-[10px] text-zinc-500 print:text-gray-700">{author.affiliation}</div>
                <div className="text-[10px] font-mono text-cyan-500/80 print:text-blue-800">{author.email}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Abstract & Keywords */}
        <section className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800/80 space-y-3 font-sans print:bg-gray-100 print:border-gray-300">
          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-cyan-400 mr-2 print:text-black">Abstract—</span>
            <span className="text-xs text-zinc-300 leading-relaxed print:text-black">
              {PAPER_METADATA.abstract}
            </span>
          </div>
          <div className="pt-2 border-t border-zinc-800/60 text-xs text-zinc-400">
            <strong className="text-zinc-300 print:text-black font-mono text-[11px]">Index Terms— </strong>
            <span>{PAPER_METADATA.keywords.join(', ')}</span>
          </div>
        </section>

        {/* Section I: Introduction */}
        <section className="space-y-4 text-sm font-sans">
          <div 
            onClick={() => toggleSection('sec1')}
            className="flex items-center justify-between border-b border-zinc-800 pb-2 cursor-pointer group"
          >
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
              I. Introduction and Literature Review
            </h2>
            {collapsedSections['sec1'] ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
          </div>

          {!collapsedSections['sec1'] && (
            <div className="space-y-3 text-zinc-300 leading-relaxed">
              <p>
                Modern cyber environments—spanning cloud enterprise platforms, Software-Defined Networks (SDN), the Internet of Things (IoT), and Industrial Control Systems (ICS/SCADA)—face sophisticated adversaries capable of executing synchronized, coordinated attacks. In these operations, multiple malicious agents collaborate across disparate vantage points: one agent carries out subtle network reconnaissance, a second conducts stealthy lateral movement toward high-value database assets, while a third launches a volumetric distributed denial-of-service (DDoS) flood to saturate firewalls and exhaust security operations personnel.
              </p>
              <p>
                To model the relational dependencies of network traffic, graph-based intrusion detection systems (NIDS) have gained significant popularity. Existing approaches construct graph representations from network flows, where host IP addresses serve as graph vertices and network communications define graph edges. Graph Convolutional Networks (GCNs) and Graph Attention Networks (GATs) are then trained to classify malicious hosts or anomalous edges.
              </p>
              <p>
                However, as critically revealed by Hasibuzzaman [2], this fundamental visibility assumption collapses under conventional perimeter address translation. Under Network Address Translation (NAT) and cloud load balancers, hundreds of distinct client devices or attacking sources are mapped into a single externally visible IP address. Consequently, node degree—the number of incident edges connected to a host vertex—remains invariant regardless of whether ten, a hundred, or a thousand requests are generated. Standard GNNs that depend on degree-balanced neighbor aggregation suffer severe node-degree blindness, resulting in a detection failure (AUC collapses to 0.612).
              </p>
              
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-1 my-3">
                <div className="font-bold text-cyan-400 uppercase text-[11px]">The 3 Unaddressed Literature Gaps:</div>
                <div className="text-zinc-400">1. <strong className="text-zinc-200">Identity-Collapse vs. Causal Topology Gap:</strong> Node degree fails under NAT; edge weights alone cannot reconstruct multi-hop propagation chains.</div>
                <div className="text-zinc-400">2. <strong className="text-zinc-200">Correlation vs. Causal Discovery Gap:</strong> Deep models measure statistical co-occurrence, inferring spurious edges during coordinated DDoS distraction.</div>
                <div className="text-zinc-400">3. <strong className="text-zinc-200">Observational vs. Counterfactual Defense Gap:</strong> Existing systems are passive or pre-scripted; no framework leverages Pearl's do-calculus for prospective what-if mitigation.</div>
              </div>
            </div>
          )}
        </section>

        {/* Section II: Materials & Methods */}
        <section className="space-y-4 text-sm font-sans">
          <div 
            onClick={() => toggleSection('sec2')}
            className="flex items-center justify-between border-b border-zinc-800 pb-2 cursor-pointer group"
          >
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
              II. Materials and Proposed Methodology
            </h2>
            {collapsedSections['sec2'] ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
          </div>

          {!collapsedSections['sec2'] && (
            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <p>
                We formalize the Cyber Morphogenesis framework across four interconnected stages: (1) Dynamic cyber graph construction, (2) Edge-centric E-GraphSAGE encoding, (3) Time-lagged causal discovery with Benjamini-Hochberg FDR control, and (4) C-TGNN forecasting coupled with Pearlian counterfactual defense.
              </p>
              
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 font-mono text-xs">
                <div className="text-cyan-400 font-bold">Eq. (3) Top-1 Edge Share Concentration:</div>
                <div className="text-center py-2">
                  <MathEquation math="S_1(v, t) = \frac{\max_{(u, v) \in \mathcal{E}_t} \omega(u, v)}{\sum_{(i, j) \in \mathcal{E}_t} \omega(i, j)}" display={true} />
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
                  Captures the fraction of total traffic concentrated on the most dominant single link, preserving anomalous volume cues even when node degree remains static under NAT.
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 font-mono text-xs">
                <div className="text-cyan-400 font-bold">Eq. (10) Pearlian Counterfactual Intervention:</div>
                <div className="text-center py-2">
                  <MathEquation math="\mathcal{M}_{do(X_i = x^*)}: \quad X_i = x^*, \quad X_j = f_j(\mathbf{PA}_j, \mathbf{U}_j) \quad \forall j \neq i" display={true} />
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
                  Graph surgery mutilates all incident incoming arrows to the intervened node, simulating the exact causal effect of firewall isolation or link throttling.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section III: Results & Findings */}
        <section className="space-y-4 text-sm font-sans">
          <div 
            onClick={() => toggleSection('sec3')}
            className="flex items-center justify-between border-b border-zinc-800 pb-2 cursor-pointer group"
          >
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
              III. Results, Findings, and Discussion
            </h2>
            {collapsedSections['sec3'] ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
          </div>

          {!collapsedSections['sec3'] && (
            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <p>
                The experimental evaluation was conducted in Python 3.13 utilizing numpy, scipy, networkx, pandas, and scikit-learn on a simulated 32-node enterprise/OT testbed comprising 5 functional subnets and external entry points. The simulation suite executed 200 temporal observation windows and 1,000 independent Monte Carlo trials per counterfactual policy (seed=42).
              </p>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-2">
                <div className="font-bold text-cyan-400 uppercase">Verified Experimental Findings Summary:</div>
                <ul className="space-y-1 list-disc list-inside text-zinc-300">
                  <li><strong>RQ1:</strong> Structural Hamming Distance reduced from 19 (correlation) down to 15 (causal discovery).</li>
                  <li><strong>RQ2:</strong> C-TGNN retains F1 = 0.842 at h=5 (only -0.100 degradation vs. -0.192 for static GCN).</li>
                  <li><strong>RQ3:</strong> Joint Defense cuts ASR from 27.00% to 9.60% (64.44% relative drop) with only 5.01% SDR.</li>
                  <li><strong>Unfavorable Finding:</strong> Naively isolating DMZ Host 1 increases ASR to 29.00% (+2.00 pp) due to adaptive adversary path rerouting.</li>
                  <li><strong>RQ4:</strong> Causal Discovery AUC is invariant at 0.976–0.986 across all collapse ratios k in [1, 128].</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Section IV: Limitations & Future Work */}
        <section className="space-y-4 text-sm font-sans">
          <div 
            onClick={() => toggleSection('sec4')}
            className="flex items-center justify-between border-b border-zinc-800 pb-2 cursor-pointer group"
          >
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
              IV. Conclusion, Limitations, and Future Work
            </h2>
            {collapsedSections['sec4'] ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
          </div>

          {!collapsedSections['sec4'] && (
            <div className="space-y-4 text-zinc-300 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                {LIMITATIONS.map(lim => (
                  <div key={lim.id} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="font-bold text-rose-400">Limitation {lim.id}: {lim.title}</div>
                    <div className="text-zinc-400 text-[11px] font-sans">{lim.description}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-cyan-400 font-mono uppercase">Future Research Directions:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  {FUTURE_DIRECTIONS.map(dir => (
                    <div key={dir.id} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="font-bold text-cyan-300">{dir.title}</div>
                      <div className="text-zinc-500 text-[10px]">{dir.tagline}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </article>
    </div>
  );
};
