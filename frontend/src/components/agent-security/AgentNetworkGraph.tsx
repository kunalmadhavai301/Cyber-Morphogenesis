import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useAgentSecurity } from '../../context/AgentSecurityContext';
import { AIAgent, AgentConnection, AgentState } from '../../types/agentSecurity';
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
  Layers,
  Sparkles,
  ShieldX,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  CornerDownRight,
  ArrowRight
} from 'lucide-react';

import { EdgeInspector } from './EdgeInspector';

export const AgentNetworkGraph: React.FC = () => {
  const { 
    agents, 
    connections, 
    selectedAgent, 
    setSelectedAgentId,
    selectedEdge,
    setSelectedEdgeId,
    activeScenario,
    scenarioStep,
    isolateAgent,
    restrictAgent,
    recoverAgent
  } = useAgentSecurity();

  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState<number>(0.95);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 15 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedAgentId, setDraggedAgentId] = useState<string | null>(null);
  const [agentPositions, setAgentPositions] = useState<{ [id: string]: { x: number; y: number } }>({});

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightDependencies, setHighlightDependencies] = useState<boolean>(true);

  // Initialize node positions
  useEffect(() => {
    const initPos: { [id: string]: { x: number; y: number } } = {};
    agents.forEach(a => {
      initPos[a.id] = { x: a.x, y: a.y };
    });
    setAgentPositions(initPos);
  }, []);

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesStatus = statusFilter === 'all' || agent.currentStatus === statusFilter;
      const matchesSearch = searchQuery === '' || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [agents, statusFilter, searchQuery]);

  const filteredAgentIds = useMemo(() => new Set(filteredAgents.map(a => a.id)), [filteredAgents]);

  // Selected agent dependencies
  const upstreamIds = useMemo(() => {
    if (!selectedAgent || !highlightDependencies) return new Set<string>();
    return new Set(selectedAgent.upstreamDependencies);
  }, [selectedAgent, highlightDependencies]);

  const downstreamIds = useMemo(() => {
    if (!selectedAgent || !highlightDependencies) return new Set<string>();
    return new Set(selectedAgent.downstreamDependencies);
  }, [selectedAgent, highlightDependencies]);

  // Mouse pan & drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'agent-graph-bg') {
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
    } else if (draggedAgentId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setAgentPositions(prev => ({
        ...prev,
        [draggedAgentId]: { x: Math.max(50, Math.min(950, mouseX)), y: Math.max(40, Math.min(560, mouseY)) }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedAgentId(null);
  };

  const resetView = () => {
    setZoom(0.95);
    setPan({ x: 30, y: 15 });
  };

  // Agent State Styling
  const getAgentColor = (status: AgentState) => {
    switch (status) {
      case 'healthy': return { bg: '#10b981', ring: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400', stroke: '#10b981' };
      case 'observing': return { bg: '#3b82f6', ring: 'rgba(59, 130, 246, 0.4)', text: 'text-blue-400', stroke: '#3b82f6' };
      case 'suspicious': return { bg: '#f59e0b', ring: 'rgba(245, 158, 11, 0.5)', text: 'text-amber-400', stroke: '#f59e0b' };
      case 'restricted': return { bg: '#06b6d4', ring: 'rgba(6, 182, 212, 0.5)', text: 'text-cyan-400', stroke: '#06b6d4' };
      case 'isolated': return { bg: '#f43f5e', ring: 'rgba(244, 63, 94, 0.6)', text: 'text-rose-500', stroke: '#f43f5e' };
      case 'recovering': return { bg: '#8b5cf6', ring: 'rgba(139, 92, 246, 0.4)', text: 'text-violet-400', stroke: '#8b5cf6' };
      default: return { bg: '#71717a', ring: 'rgba(113, 113, 122, 0.3)', text: 'text-zinc-400', stroke: '#71717a' };
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[680px] shadow-2xl relative">
      {/* Graph Toolbar */}
      <div className="bg-zinc-950/80 px-4 py-2.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200 flex items-center gap-1.5 font-mono">
            <Activity className="w-4 h-4 text-cyan-400" />
            AI Multi-Agent Communication Graph
          </span>
          <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 text-[10px] font-mono border border-zinc-700">
            {filteredAgents.length} / {agents.length} Agents
          </span>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-zinc-300 text-xs focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="healthy">Healthy (Emerald)</option>
              <option value="observing">Observing (Blue)</option>
              <option value="suspicious">Suspicious (Amber)</option>
              <option value="restricted">Restricted (Cyan)</option>
              <option value="isolated">Isolated (Rose)</option>
              <option value="recovering">Recovering (Violet)</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search agent or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-md pl-7 pr-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none w-36 sm:w-48"
            />
          </div>

          {/* Toggle dependencies */}
          <button
            onClick={() => setHighlightDependencies(!highlightDependencies)}
            className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
              highlightDependencies 
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Highlight upstream and downstream causal dependencies"
          >
            Dependencies: {highlightDependencies ? 'ON' : 'OFF'}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-md p-0.5">
            <button 
              onClick={() => setZoom(z => Math.min(1.8, z + 0.1))}
              className="p-1 hover:bg-zinc-800 text-zinc-300 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1 hover:bg-zinc-800 text-zinc-300 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={resetView}
              className="p-1 hover:bg-zinc-800 text-zinc-300 rounded"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <rect id="agent-graph-bg" width="100%" height="100%" fill="#09090b" />

          {/* Subtle Grid Pattern */}
          <defs>
            <pattern id="agent-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(39, 39, 42, 0.4)" strokeWidth="0.8" />
            </pattern>
            {/* Arrow marker for active message channels */}
            <marker id="arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-throttled" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-blocked" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#agent-grid)" pointerEvents="none" />

          {/* World Transform Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* 1. Network Communication Edges */}
            {connections.map(conn => {
              const srcPos = agentPositions[conn.source] || { x: 0, y: 0 };
              const tgtPos = agentPositions[conn.target] || { x: 0, y: 0 };
              
              const isSourceSelected = selectedAgent?.id === conn.source;
              const isTargetSelected = selectedAgent?.id === conn.target;
              const isBlocked = conn.status === 'blocked';
              const isThrottled = conn.status === 'throttled';
              const isSuspicious = conn.isSuspicious;

              let strokeColor = '#10b981'; // Green: normal communication
              let strokeWidth = 1.8;
              let strokeDasharray = 'none';
              let markerEnd = 'url(#arrow-active)';

              if (isBlocked) {
                strokeColor = '#f43f5e'; // Red: blocked
                strokeWidth = 2.2;
                strokeDasharray = '4 4';
                markerEnd = 'url(#arrow-blocked)';
              } else if (conn.status === 'throttled' || isSuspicious) {
                strokeColor = '#f59e0b'; // Amber: suspicious / throttled
                strokeWidth = 2.2;
                strokeDasharray = '6 3';
                markerEnd = 'url(#arrow-throttled)';
              } else if (conn.status === 'monitored') {
                strokeColor = '#06b6d4'; // Cyan: restricted / monitored
                strokeWidth = 2.0;
              } else if (conn.messageFrequency === 0) {
                strokeColor = '#52525b'; // Gray: inactive
                strokeWidth = 1.0;
              } else if (isSourceSelected || isTargetSelected || selectedEdge?.id === conn.id) {
                strokeColor = '#38bdf8';
                strokeWidth = 2.8;
              }

              return (
                <g 
                  key={conn.id} 
                  className="transition-all cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(conn.id);
                  }}
                >
                  {/* Invisible thicker hit-box line for easy clicking */}
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke="transparent"
                    strokeWidth="14"
                  />
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    markerEnd={markerEnd}
                    opacity={filteredAgentIds.has(conn.source) && filteredAgentIds.has(conn.target) ? 0.9 : 0.2}
                    className="group-hover:stroke-cyan-300 transition-colors"
                  />

                  {/* Animated message pulse packet along active edges */}
                  {!isBlocked && (
                    <circle r="3.5" fill={isSuspicious ? '#f43f5e' : '#38bdf8'}>
                      <animateMotion
                        path={`M ${srcPos.x} ${srcPos.y} L ${tgtPos.x} ${tgtPos.y}`}
                        dur={`${Math.max(1.2, 50 / conn.messageFrequency)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Channel status label badge */}
                  {isBlocked && (
                    <text
                      x={(srcPos.x + tgtPos.x) / 2}
                      y={(srcPos.y + tgtPos.y) / 2 - 8}
                      fill="#f43f5e"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="font-bold bg-zinc-950"
                    >
                      [BLOCKED BY POLICY]
                    </text>
                  )}
                  {isThrottled && (
                    <text
                      x={(srcPos.x + tgtPos.x) / 2}
                      y={(srcPos.y + tgtPos.y) / 2 - 8}
                      fill="#f59e0b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="font-bold bg-zinc-950"
                    >
                      [THROTTLED 5msg/m]
                    </text>
                  )}
                </g>
              );
            })}

            {/* 2. Agent Nodes */}
            {filteredAgents.map(agent => {
              const pos = agentPositions[agent.id] || { x: agent.x, y: agent.y };
              const isSelected = selectedAgent?.id === agent.id;
              const isUpstream = upstreamIds.has(agent.id);
              const isDownstream = downstreamIds.has(agent.id);
              const styling = getAgentColor(agent.currentStatus);

              // Ring color override for dependencies
              let haloColor = styling.ring;
              let haloWidth = '2';
              if (isSelected) {
                haloColor = '#38bdf8';
                haloWidth = '3';
              } else if (isDownstream) {
                haloColor = 'rgba(244, 63, 94, 0.7)'; // Rose for downstream blast radius
                haloWidth = '3';
              } else if (isUpstream) {
                haloColor = 'rgba(6, 182, 212, 0.7)'; // Cyan for upstream provenance
                haloWidth = '3';
              }

              return (
                <g
                  key={agent.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => setSelectedAgentId(agent.id)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedAgentId(agent.id);
                  }}
                >
                  {/* Outer Pulsing Glow */}
                  <circle
                    r="32"
                    fill="none"
                    stroke={haloColor}
                    strokeWidth={haloWidth}
                    strokeDasharray={isDownstream ? '4 3' : 'none'}
                    className={isSelected || isDownstream ? 'animate-pulse' : ''}
                  />

                  {/* Main Node Background */}
                  <circle
                    r="24"
                    fill="#18181b"
                    stroke={styling.stroke}
                    strokeWidth="2"
                    className="hover:scale-105 transition-transform"
                  />

                  {/* Inner Status Indicator Pill */}
                  <circle
                    r="6"
                    cy="-6"
                    fill={styling.bg}
                  />

                  {/* Node Short Code */}
                  <text
                    y="11"
                    textAnchor="middle"
                    fill="#f4f4f5"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {agent.id.toUpperCase()}
                  </text>

                  {/* Agent Role Badge */}
                  <g transform="translate(0, 36)">
                    <rect
                      x="-65"
                      y="0"
                      width="130"
                      height="18"
                      rx="4"
                      fill="#09090b"
                      stroke={styling.stroke}
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      x="0"
                      y="12"
                      textAnchor="middle"
                      fill="#e4e4e7"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="500"
                      pointerEvents="none"
                    >
                      {agent.name}
                    </text>
                  </g>

                  {/* Risk Score Pill on top right */}
                  <g transform="translate(18, -18)">
                    <rect
                      x="-12"
                      y="-8"
                      width="24"
                      height="14"
                      rx="7"
                      fill="#27272a"
                      stroke={styling.stroke}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={styling.bg}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {Math.round(agent.riskScore * 100)}
                    </text>
                  </g>

                  {/* Dependency Tags */}
                  {isDownstream && (
                    <text
                      y="-34"
                      textAnchor="middle"
                      fill="#f43f5e"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ↓ BLAST RADIUS
                    </text>
                  )}
                  {isUpstream && (
                    <text
                      y="-34"
                      textAnchor="middle"
                      fill="#06b6d4"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ↑ CAUSAL PROVENANCE
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-zinc-950/90 border border-zinc-800 rounded-lg p-2 text-[10px] space-y-1 backdrop-blur-md">
          <div className="font-semibold text-zinc-300 border-b border-zinc-800 pb-1 mb-1">Agent States:</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Observing</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Suspicious</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Restricted</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Isolated</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500"></span> Recovering</span>
          </div>
        </div>

        {/* Causal Trace Banner */}
        {selectedAgent && (
          <div className="absolute top-3 right-3 bg-zinc-950/90 border border-zinc-800 rounded-lg p-2.5 text-xs backdrop-blur-md max-w-xs space-y-1.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-cyan-300">{selectedAgent.name}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold ${
                selectedAgent.currentStatus === 'healthy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' :
                selectedAgent.currentStatus === 'suspicious' ? 'bg-amber-950 text-amber-400 border border-amber-600' :
                selectedAgent.currentStatus === 'isolated' ? 'bg-rose-950 text-rose-400 border border-rose-600' :
                'bg-cyan-950 text-cyan-400 border border-cyan-600'
              }`}>
                {selectedAgent.currentStatus}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 line-clamp-2">{selectedAgent.roleDescription}</p>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[10px] text-zinc-400">
              <span>Risk: <strong className="text-zinc-200">{Math.round(selectedAgent.riskScore * 100)}%</strong></span>
              <span>Downstream: <strong className="text-rose-400">{selectedAgent.downstreamDependencies.length} agents</strong></span>
              <span>Violations: <strong className="text-cyan-400">{selectedAgent.policyViolationCount}</strong></span>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                onClick={() => isolateAgent(selectedAgent.id)}
                className="px-1.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 rounded text-[10px] font-medium"
              >
                Isolate
              </button>
              <button
                onClick={() => restrictAgent(selectedAgent.id)}
                className="px-1.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 rounded text-[10px] font-medium"
              >
                Restrict
              </button>
              <button
                onClick={() => recoverAgent(selectedAgent.id)}
                className="px-1.5 py-1 bg-violet-950/60 hover:bg-violet-900 border border-violet-700/60 text-violet-300 rounded text-[10px] font-medium"
              >
                Recover
              </button>
            </div>
          </div>
        )}

        {/* Edge Inspector Overlay */}
        {selectedEdge && (
          <div className="absolute bottom-3 right-3 max-w-sm z-20">
            <EdgeInspector />
          </div>
        )}
      </div>
    </div>
  );
};
