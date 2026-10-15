import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  DisplayMode, 
  GraphViewMode, 
  NetworkNode, 
  NetworkEdge, 
  AttackStage, 
  InterventionPolicy,
  DataCategory
} from '../types/cyber';
import { INITIAL_32_NODES, INITIAL_EDGES } from '../data/topologyData';
import { ATTACK_STAGES } from '../data/attackStages';
import { TABLE_IV_DEFENSE_POLICIES } from '../data/paperData';

interface SimulationContextType {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  dataCategory: DataCategory;
  
  // Attack Playback State
  activeStage: number;
  setActiveStage: (stage: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  nextStage: () => void;
  prevStage: () => void;
  restartPlayback: () => void;
  currentStageData: AttackStage;

  // Graph View Modes
  graphViewMode: GraphViewMode;
  setGraphViewMode: (mode: GraphViewMode) => void;

  // Defense Policies
  activePolicy: InterventionPolicy;
  setActivePolicyId: (policyId: string) => void;
  allPolicies: InterventionPolicy[];

  // Graph Elements & Interactivity
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedNode: NetworkNode | null;
  setSelectedNode: (node: NetworkNode | null) => void;
  selectedEdge: NetworkEdge | null;
  setSelectedEdge: (edge: NetworkEdge | null) => void;
  
  // Filters & Search
  zoneFilter: string;
  setZoneFilter: (zone: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // NAT & Causal Parameters
  natCollapseK: number;
  setNatCollapseK: (k: number) => void;
  varMaxLag: number;
  setVarMaxLag: (lag: number) => void;
  fdrAlpha: number;
  setFdrAlpha: (alpha: number) => void;

  // Routing
  currentPath: string;
  navigate: (path: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<DisplayMode>('paper');
  const [activeStage, setActiveStage] = useState<number>(2); // Default to Step 2 for engaging initial preview
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [graphViewMode, setGraphViewMode] = useState<GraphViewMode>('causal');
  const [activePolicyId, setActivePolicyId] = useState<string>('p5'); // Default to Joint Defense
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('dmz-web-01');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [natCollapseK, setNatCollapseK] = useState<number>(1);
  const [varMaxLag, setVarMaxLag] = useState<number>(2);
  const [fdrAlpha, setFdrAlpha] = useState<number>(0.05);

  // Synchronized browser path router
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      return pathname === '' || pathname === '/' ? '/' : pathname;
    }
    return '/';
  });

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Data category tagging
  const dataCategory: DataCategory = mode === 'paper' ? 'A' : 'B';

  const currentStageData = ATTACK_STAGES[activeStage] || ATTACK_STAGES[0];
  const allPolicies = TABLE_IV_DEFENSE_POLICIES;
  const activePolicy = allPolicies.find(p => p.id === activePolicyId) || allPolicies[4];

  // Auto-play timer for attack playback
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.max(1000, 4000 / playbackSpeed);
    const timer = setInterval(() => {
      setActiveStage(prev => {
        if (prev >= ATTACK_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const nextStage = () => {
    setActiveStage(prev => Math.min(ATTACK_STAGES.length - 1, prev + 1));
  };

  const prevStage = () => {
    setActiveStage(prev => Math.max(0, prev - 1));
  };

  const restartPlayback = () => {
    setActiveStage(0);
    setIsPlaying(true);
  };

  // Dynamically compute nodes based on stage & active defense policy
  const nodes = useMemo(() => {
    return INITIAL_32_NODES.map(node => {
      let status = node.status;
      let riskScore = node.riskScore;

      // Stage adjustments
      const isCompromisedInStage = currentStageData.compromisedNodes.includes(node.id);
      const isSuspiciousInStage = currentStageData.suspiciousNodes.includes(node.id);

      if (isCompromisedInStage) {
        status = 'compromised';
        riskScore = Math.max(riskScore, 0.75 + (activeStage * 0.05));
      } else if (isSuspiciousInStage) {
        status = 'recon';
        riskScore = Math.max(riskScore, 0.45);
      } else if (activeStage === 0) {
        status = 'benign';
        riskScore = Math.min(riskScore, 0.15);
      }

      // Defensive Policy interventions
      if (activePolicy.isolatedNodes.includes(node.id)) {
        status = 'isolated';
        riskScore = Math.max(0.1, riskScore - 0.3);
      }

      if (node.zone === 'core' && (activePolicyId === 'p3' || activePolicyId === 'p5') && status !== 'compromised') {
        status = 'protected';
      }

      return {
        ...node,
        status,
        riskScore: Number(Math.min(0.99, riskScore).toFixed(2))
      };
    });
  }, [activeStage, activePolicy, currentStageData, activePolicyId]);

  // Dynamically compute edges based on stage, view mode, and defense policy
  const edges = useMemo(() => {
    return INITIAL_EDGES.map(edge => {
      let interventionStatus = edge.interventionStatus;
      let isUnderAttack = edge.isUnderAttack;

      // Defense policy mutations
      if (activePolicy.severedEdges.includes(`${edge.source}->${edge.target}`) || activePolicy.severedEdges.includes(edge.id)) {
        interventionStatus = 'severed';
      } else if (activePolicy.throttledEdges.includes(`${edge.source}->${edge.target}`) || activePolicy.throttledEdges.includes(edge.id)) {
        interventionStatus = 'throttled';
      }

      // Stage-specific attack activation
      const isHighVolume = currentStageData.highVolumeEdges.includes(edge.id);
      if (isHighVolume && activeStage > 0) {
        isUnderAttack = true;
      } else if (activeStage === 0) {
        isUnderAttack = false;
      }

      return {
        ...edge,
        interventionStatus,
        isUnderAttack
      };
    });
  }, [activeStage, activePolicy, currentStageData]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedEdge = useMemo(() => {
    if (!selectedEdgeId) return null;
    return edges.find(e => e.id === selectedEdgeId) || null;
  }, [edges, selectedEdgeId]);

  const value = {
    mode,
    setMode,
    dataCategory,
    activeStage,
    setActiveStage,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    nextStage,
    prevStage,
    restartPlayback,
    currentStageData,
    graphViewMode,
    setGraphViewMode,
    activePolicy,
    setActivePolicyId,
    allPolicies,
    nodes,
    edges,
    selectedNode,
    setSelectedNode: (node: NetworkNode | null) => {
      setSelectedNodeId(node ? node.id : null);
      if (node) setSelectedEdgeId(null);
    },
    selectedEdge,
    setSelectedEdge: (edge: NetworkEdge | null) => {
      setSelectedEdgeId(edge ? edge.id : null);
      if (edge) setSelectedNodeId(null);
    },
    zoneFilter,
    setZoneFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    natCollapseK,
    setNatCollapseK,
    varMaxLag,
    setVarMaxLag,
    fdrAlpha,
    setFdrAlpha,
    currentPath,
    navigate
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
