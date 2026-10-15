import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { NetworkNode, NetworkEdge } from '../../types/cyber';
import { NETWORK_ZONES_CONFIG } from '../../data/topologyData';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Filter, 
  Search, 
  Eye, 
  ShieldAlert, 
  Lock, 
  Activity,
  Layers
} from 'lucide-react';

export const NetworkGraph: React.FC = () => {
  const { 
    nodes, 
    edges, 
    selectedNode, 
    setSelectedNode, 
    selectedEdge, 
    setSelectedEdge, 
    graphViewMode, 
    setGraphViewMode,
    zoneFilter,
    setZoneFilter,
    searchQuery,
    setSearchQuery,
    activePolicy
  } = useSimulation();

  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState<number>(0.92);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 10 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<{ [id: string]: { x: number; y: number } }>({});

  // Initialize node positions
  useEffect(() => {
    const initPos: { [id: string]: { x: number; y: number } } = {};
    nodes.forEach(n => {
      initPos[n.id] = { x: n.x, y: n.y };
    });
    setNodePositions(initPos);
  }, []);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesZone = zoneFilter === 'all' || node.zone === zoneFilter;
      const matchesSearch = searchQuery === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.ip.includes(searchQuery) ||
        node.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesZone && matchesSearch;
    });
  }, [nodes, zoneFilter, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Handle Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-bg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggedNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: { x: Math.max(30, Math.min(1150, mouseX)), y: Math.max(30, Math.min(850, mouseY)) }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const resetView = () => {
    setZoom(0.92);
    setPan({ x: 20, y: 10 });
  };

  return (
    <div className="relative w-full h-[640px] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden select-none flex flex-col">
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 backdrop-blur-md pointer-events-auto shadow-lg">
          <button
            onClick={() => setGraphViewMode('telemetry')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
              graphViewMode === 'telemetry'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Raw observed network flows and volumes"
          >
            Mode A: Raw Telemetry
          </button>
          <button
            onClick={() => setGraphViewMode('correlation')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
              graphViewMode === 'correlation'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Statistical correlation graph (shows spurious edges under volumetric floods)"
          >
            Mode B: Correlation Graph
          </button>
          <button
            onClick={() => setGraphViewMode('causal')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
              graphViewMode === 'causal'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Time-lagged causal DAG reconstructed under Benjamini-Hochberg FDR control"
          >
            Mode C: Causal Graph (Ours)
          </button>
        </div>

        {/* Right: Zoom & Filters */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Zone Filter */}
          <div className="flex items-center bg-zinc-900/90 rounded-lg border border-zinc-800 px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 mr-1.5" />
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-transparent text-zinc-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Zones (32 Nodes)</option>
              <option value="external">External Entry</option>
              <option value="perimeter">Perimeter NAT/FW</option>
              <option value="dmz">DMZ Subnet</option>
              <option value="corporate">Corporate Network</option>
              <option value="ot">OT / SCADA Subnet</option>
              <option value="core">Core Network (Crown Jewels)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center bg-zinc-900/90 rounded-lg border border-zinc-800 px-2 py-1 text-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 mr-1.5" />
            <input
              type="text"
              placeholder="Search node or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-zinc-200 text-xs focus:outline-none w-28 sm:w-36 placeholder:text-zinc-600"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-zinc-900/90 rounded-lg border border-zinc-800 p-0.5">
            <button
              onClick={() => setZoom(prev => Math.min(2.0, prev + 0.1))}
              className="p-1 text-zinc-400 hover:text-zinc-100 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-1 text-zinc-400 hover:text-zinc-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1 text-zinc-400 hover:text-zinc-100 rounded"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Visualization Canvas */}
      <svg
        ref={svgRef}
        id="graph-bg"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          {/* Arrow markers */}
          <marker
            id="arrow-normal"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#52525b" />
          </marker>

          <marker
            id="arrow-causal"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#22d3ee" />
          </marker>

          <marker
            id="arrow-attack"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
          </marker>

          <marker
            id="arrow-spurious"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Zone Background Panels */}
          <g className="zone-bands opacity-20 pointer-events-none">
            <rect x="40" y="40" width="120" height="760" rx="12" fill="#f43f5e" />
            <rect x="180" y="40" width="130" height="760" rx="12" fill="#fbbf24" />
            <rect x="330" y="40" width="150" height="760" rx="12" fill="#38bdf8" />
            <rect x="500" y="40" width="190" height="760" rx="12" fill="#818cf8" />
            <rect x="710" y="40" width="210" height="760" rx="12" fill="#fb923c" />
            <rect x="940" y="40" width="220" height="760" rx="12" fill="#34d399" />
          </g>

          {/* Zone Column Headers */}
          <g className="zone-headers text-[11px] font-mono font-bold tracking-wider fill-zinc-500 pointer-events-none uppercase">
            <text x="50" y="30">1. External</text>
            <text x="190" y="30">2. Perimeter NAT</text>
            <text x="340" y="30">3. DMZ Subnet</text>
            <text x="510" y="30">4. Corporate Subnet</text>
            <text x="720" y="30">5. OT / SCADA Subnet</text>
            <text x="950" y="30">6. Core Crown Jewels</text>
          </g>

          {/* Render Network Edges */}
          {edges.map(edge => {
            const srcPos = nodePositions[edge.source] || { x: 0, y: 0 };
            const tgtPos = nodePositions[edge.target] || { x: 0, y: 0 };

            const isSelected = selectedEdge?.id === edge.id;
            const isSevered = edge.interventionStatus === 'severed';
            const isThrottled = edge.interventionStatus === 'throttled';
            const isUnderAttack = edge.isUnderAttack;

            // View mode filtering & styling
            let strokeColor = '#3f3f46';
            let strokeWidth = 1.5;
            let marker = 'url(#arrow-normal)';
            let strokeDash = 'none';

            if (isSevered) {
              strokeColor = '#f43f5e';
              strokeDash = '6 4';
              strokeWidth = 2;
            } else if (isThrottled) {
              strokeColor = '#22d3ee';
              strokeWidth = 2.5;
              marker = 'url(#arrow-causal)';
            } else if (isUnderAttack) {
              strokeColor = '#f43f5e';
              strokeWidth = 3;
              marker = 'url(#arrow-attack)';
            } else if (graphViewMode === 'causal') {
              if (edge.causalStatus === 'verified') {
                strokeColor = '#22d3ee';
                strokeWidth = 2.5;
                marker = 'url(#arrow-causal)';
              } else {
                strokeColor = '#27272a';
                strokeWidth = 1;
              }
            } else if (graphViewMode === 'correlation') {
              if (edge.correlationStatus === 'strong') {
                strokeColor = edge.causalStatus === 'none' ? '#fbbf24' : '#f43f5e';
                strokeDash = edge.causalStatus === 'none' ? '5 5' : 'none'; // Spurious edge!
                strokeWidth = 2.5;
                marker = edge.causalStatus === 'none' ? 'url(#arrow-spurious)' : 'url(#arrow-attack)';
              }
            }

            if (isSelected) {
              strokeColor = '#38bdf8';
              strokeWidth = 3.5;
            }

            // Draw curved bezier line
            const dx = tgtPos.x - srcPos.x;
            const dy = tgtPos.y - srcPos.y;
            const curveOffset = Math.sin((srcPos.x + tgtPos.y) * 0.05) * 15;
            const cx = (srcPos.x + tgtPos.x) / 2;
            const cy = (srcPos.y + tgtPos.y) / 2 + curveOffset;

            const pathData = `M ${srcPos.x} ${srcPos.y} Q ${cx} ${cy} ${tgtPos.x} ${tgtPos.y}`;

            return (
              <g 
                key={edge.id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEdge(edge);
                }}
              >
                {/* Thick invisible hit area for easy clicking */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                />

                {/* Visible edge line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  markerEnd={marker}
                  className={`transition-colors duration-200 ${isUnderAttack && !isSevered ? 'edge-attack' : ''}`}
                />

                {/* Severed badge label on path */}
                {isSevered && (
                  <text
                    x={cx}
                    y={cy - 6}
                    fill="#f43f5e"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="bg-black px-1"
                  >
                    ✂ SEVERED
                  </text>
                )}

                {/* Throttled badge label */}
                {isThrottled && (
                  <text
                    x={cx}
                    y={cy - 6}
                    fill="#22d3ee"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ⚡ THROTTLED
                  </text>
                )}

                {/* Spurious badge in correlation mode */}
                {graphViewMode === 'correlation' && edge.correlationStatus === 'strong' && edge.causalStatus === 'none' && (
                  <text
                    x={cx}
                    y={cy - 6}
                    fill="#fbbf24"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    ⚠ SPURIOUS
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Network Nodes (Exactly 32) */}
          {nodes.map(node => {
            const pos = nodePositions[node.id] || { x: node.x, y: node.y };
            const isSelected = selectedNode?.id === node.id;
            const isMatch = filteredNodeIds.has(node.id);
            const zoneInfo = NETWORK_ZONES_CONFIG[node.zone] || NETWORK_ZONES_CONFIG.corporate;

            let nodeFill = '#18181b';
            let strokeColor = zoneInfo.color;
            let strokeWidth = 2;
            let auraColor = 'transparent';

            if (node.status === 'compromised') {
              nodeFill = '#2a1215';
              strokeColor = '#f43f5e';
              strokeWidth = 3;
              auraColor = 'rgba(244, 63, 94, 0.4)';
            } else if (node.status === 'recon') {
              nodeFill = '#272010';
              strokeColor = '#fbbf24';
              strokeWidth = 2.5;
              auraColor = 'rgba(251, 191, 36, 0.3)';
            } else if (node.status === 'isolated') {
              nodeFill = '#09090b';
              strokeColor = '#71717a';
              strokeWidth = 2;
            } else if (node.status === 'protected') {
              nodeFill = '#0f241a';
              strokeColor = '#34d399';
              strokeWidth = 2.5;
              auraColor = 'rgba(52, 211, 153, 0.3)';
            }

            if (isSelected) {
              strokeColor = '#38bdf8';
              strokeWidth = 4;
              auraColor = 'rgba(56, 189, 248, 0.6)';
            }

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={`cursor-pointer group transition-opacity duration-300 ${isMatch ? 'opacity-100' : 'opacity-25'}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNodeId(node.id);
                  setSelectedNode(node);
                }}
              >
                {/* Aura pulse ring */}
                {auraColor !== 'transparent' && (
                  <circle
                    r="24"
                    fill="none"
                    stroke={auraColor}
                    strokeWidth="4"
                    className="animate-ping opacity-30"
                  />
                )}

                {/* Outer halo */}
                <circle
                  r="18"
                  fill={nodeFill}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={node.status === 'isolated' ? '4 3' : 'none'}
                />

                {/* Inner center core icon/circle */}
                <circle
                  r="6"
                  fill={strokeColor}
                  className={node.status === 'compromised' ? 'animate-pulse' : ''}
                />

                {/* Node Label Text */}
                <text
                  y="28"
                  textAnchor="middle"
                  fill="#f4f4f5"
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="system-ui, sans-serif"
                  className="pointer-events-none select-none drop-shadow-md"
                >
                  {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                </text>

                {/* IP address subtitle */}
                <text
                  y="39"
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="8.5"
                  fontFamily="monospace"
                  className="pointer-events-none select-none"
                >
                  {node.ip}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Graph Legend & Count Status */}
      <div className="bg-zinc-950/95 border-t border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="text-zinc-400">Total Nodes: <strong className="text-zinc-100">{nodes.length}</strong></span>
          <span className="text-zinc-400">Total Links: <strong className="text-zinc-100">{edges.length}</strong></span>
          <span className="text-zinc-400">Active Defense: <strong className="text-cyan-400">{activePolicy.name}</strong></span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Benign/Protected</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Recon Target</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Compromised</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-dashed border-zinc-400"></span> Isolated (do)</span>
        </div>
      </div>
    </div>
  );
};
