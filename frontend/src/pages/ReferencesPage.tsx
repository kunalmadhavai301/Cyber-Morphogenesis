import React, { useState, useMemo } from 'react';
import { REFERENCES } from '../data/paperData';
import { ReferenceRecord } from '../types/cyber';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Filter, 
  Calendar,
  Layers,
  FileCode
} from 'lucide-react';

export const ReferencesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedBibId, setCopiedBibId] = useState<number | null>(null);
  const [selectedRef, setSelectedRef] = useState<ReferenceRecord | null>(null);

  const filteredReferences = useMemo(() => {
    return REFERENCES.filter(ref => {
      const matchesSearch = searchQuery === '' ||
        ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.keyContribution.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = yearFilter === 'all' || ref.year.toString() === yearFilter;
      return matchesSearch && matchesYear;
    });
  }, [searchQuery, yearFilter]);

  const generateBibTeX = (ref: ReferenceRecord) => {
    const firstAuthor = ref.authors.split(',')[0].split(' ').pop()?.toLowerCase() || 'ref';
    return `@article{${firstAuthor}${ref.year},
  author    = {${ref.authors}},
  title     = {${ref.title}},
  journal   = {${ref.venue}},
  year      = {${ref.year}}${ref.doi ? `,\n  doi       = {${ref.doi}}` : ''}
}`;
  };

  const copyCitation = (ref: ReferenceRecord) => {
    const text = `[${ref.id}] ${ref.authors}, "${ref.title}," ${ref.venue}, ${ref.year}. ${ref.doi ? `DOI: ${ref.doi}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyBibTeX = (ref: ReferenceRecord) => {
    navigator.clipboard.writeText(generateBibTeX(ref));
    setCopiedBibId(ref.id);
    setTimeout(() => setCopiedBibId(null), 2000);
  };

  const exportAllBibTeX = () => {
    const allBib = REFERENCES.map(generateBibTeX).join('\n\n');
    const blob = new Blob([allBib], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cyber_morphogenesis_references.bib');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Bibliographic Reference Archive
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            All 22 peer-reviewed literature sources analyzed in the Systematic Comparison (Table I) and paper references
          </p>
        </div>

        <button
          onClick={exportAllBibTeX}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs font-mono text-cyan-300 hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export All .BIB ({REFERENCES.length})</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Search */}
        <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-700/80 px-2.5 py-1.5 w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 mr-2" />
          <input
            type="text"
            placeholder="Search by author, title, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-zinc-200 text-xs focus:outline-none w-full placeholder:text-zinc-600"
          />
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Year:
          </span>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-lg p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Years (2019–2026)</option>
            <option value="2026">2026 (14 papers)</option>
            <option value="2025">2025 (2 papers)</option>
            <option value="2024">2024 (2 papers)</option>
            <option value="2023">2023 (2 papers)</option>
            <option value="2020">2020 (1 paper)</option>
            <option value="2019">2019 (1 paper)</option>
          </select>
        </div>
      </div>

      {/* Reference Cards List */}
      <div className="space-y-3">
        {filteredReferences.map(ref => (
          <div 
            key={ref.id}
            className="glass-panel p-5 rounded-xl border border-zinc-800 glass-panel-hover space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-zinc-900 border border-zinc-700 text-cyan-400 shrink-0 mt-0.5">
                  [{ref.id}]
                </span>
                <div>
                  <h3 className="font-bold text-sm text-zinc-100 leading-snug">
                    {ref.title}
                  </h3>
                  <div className="text-xs text-zinc-400 mt-1 font-sans">
                    {ref.authors}
                  </div>
                  <div className="text-xs font-mono text-zinc-500 mt-0.5">
                    {ref.venue} ({ref.year})
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => copyCitation(ref)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                  title="Copy IEEE Citation"
                >
                  {copiedId === ref.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => copyBibTeX(ref)}
                  className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono text-cyan-300 border border-zinc-800 transition-colors flex items-center gap-1"
                  title="Copy BibTeX"
                >
                  {copiedBibId === ref.id ? <Check className="w-3 h-3 text-emerald-400" /> : <FileCode className="w-3 h-3" />}
                  <span>BibTeX</span>
                </button>
                {ref.doi && (
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 border border-zinc-800 transition-colors"
                    title={`Open DOI: ${ref.doi}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Systematic Comparison Context / Key Contribution */}
            <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs font-mono text-zinc-400 flex items-start gap-2">
              <span className="text-cyan-400 font-bold shrink-0">Literature Role:</span>
              <span className="text-zinc-300 font-sans">{ref.keyContribution}</span>
            </div>
          </div>
        ))}

        {filteredReferences.length === 0 && (
          <div className="glass-panel p-8 rounded-xl text-center text-zinc-500 font-mono text-xs">
            No matching citations found for "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
