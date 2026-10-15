import React from 'react';
import { NetworkNode } from '../../types/cyber';
import { NETWORK_ZONES_CONFIG } from '../../data/topologyData';
import { 
  Server, 
  Shield, 
  ShieldAlert, 
  Activity, 
  Radio, 
  Lock, 
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';

interface NodeInspectorProps {
  node: NetworkNode | null;
  onClose?: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ node, onClose }) => {
  if (!node) {
    return (
      <div className="glass-panel p-5 rounded-xl border border-zinc-800 text-center text-zinc-500 py-12">
        <Server className="w-10 h-10 mx-auto mb-3 opacity-30 text-zinc-400" />
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">Node Telemetry Inspector</div>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
          Click any of the 32 nodes in the cyber topology to inspect its security posture, telemetry streams, and risk features.
        </p>
      </div>
    );
  }

  const zoneInfo = NETWORK_ZONES_CONFIG[node.zone] || NETWORK_ZONES_CONFIG.corporate;

  const getStatusBadge = () => {
    switch (node.status) {
      case 'compromised':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 font-semibold"><ShieldAlert className="w-3 h-3" /> COMPROMISED</span>;
      case 'recon':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 font-semibold"><Radio className="w-3 h-3 animate-pulse" /> RECON TARGET</span>;
      case 'isolated':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-600 flex items-center gap-1 font-semibold"><Lock className="w-3 h-3" /> ISOLATED (do)</span>;
      case 'protected':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 font-semibold"><Shield className="w-3 h-3" /> PROTECTED ASSET</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">BENIGN</span>;
    }
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800 text-zinc-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-zinc-100">{node.name}</h3>
            {getStatusBadge()}
          </div>
          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
            <span>ID: <code className="text-cyan-400">{node.id}</code></span>
            <span>•</span>
            <span>IP: <code className="text-zinc-300">{node.ip}</code></span>
          </div>
        </div>
      </div>

      {/* Network Zone Pill */}
      <div 
        className="px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between"
        style={{ backgroundColor: zoneInfo.bg, borderColor: zoneInfo.border, borderWidth: 1 }}
      >
        <span className="text-zinc-300">Network Zone:</span>
        <span className="font-semibold" style={{ color: zoneInfo.color }}>{zoneInfo.name}</span>
      </div>

      {/* Role & Trust */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
          <div className="text-[10px] uppercase font-mono text-zinc-400">Node Role</div>
          <div className="font-medium text-zinc-200 mt-0.5 truncate">{node.role}</div>
        </div>
        <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
          <div className="text-[10px] uppercase font-mono text-zinc-400">Trust Level</div>
          <div className="font-medium text-emerald-400 mt-0.5 font-mono">{(node.trust * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Risk Assessment Gauge */}
      <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            Infection Risk Score:
          </span>
          <span className="font-bold font-mono text-sm" style={{
            color: node.riskScore > 0.7 ? '#f43f5e' : node.riskScore > 0.4 ? '#fbbf24' : '#34d399'
          }}>
            {(node.riskScore * 100).toFixed(0)} / 100
          </span>
        </div>
        <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${node.riskScore * 100}%`,
              backgroundColor: node.riskScore > 0.7 ? '#f43f5e' : node.riskScore > 0.4 ? '#fbbf24' : '#34d399'
            }}
          />
        </div>
      </div>

      {/* Degree & Traffic Volumes */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Degree Centrality</div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span>In: <strong className="text-cyan-400">{node.inDegree}</strong></span>
            <span>Out: <strong className="text-cyan-400">{node.outDegree}</strong></span>
          </div>
        </div>
        <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Telemetry Conf.</div>
          <div className="mt-1 font-bold text-zinc-200">
            {(node.telemetryConfidence * 100).toFixed(0)}% (NetFlow)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> Ingress Vol.
          </div>
          <div className="mt-1 font-bold text-zinc-200">{node.incomingVolume} KB/s</div>
        </div>
        <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-cyan-400" /> Egress Vol.
          </div>
          <div className="mt-1 font-bold text-zinc-200">{node.outgoingVolume} KB/s</div>
        </div>
      </div>

      {/* Monitored Services & Software Vulnerabilities */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-mono text-zinc-400">Observed Services & CVE Vectors</div>
        <div className="space-y-1">
          {node.affectedServices.map((srv, idx) => (
            <div 
              key={idx} 
              className={`p-1.5 rounded text-[11px] font-mono flex items-center gap-1.5 ${
                srv.includes('Vulnerable') || srv.includes('Credential')
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  : 'bg-zinc-900/70 border border-zinc-800 text-zinc-300'
              }`}
            >
              <Zap className="w-3 h-3 shrink-0 text-cyan-400" />
              <span className="truncate">{srv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific Context Note */}
      <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 text-[10px] text-zinc-400 leading-relaxed font-mono">
        <strong>E-GraphSAGE Embedding:</strong> Node features X_v(t) concatenate IP trust, degree, telemetry flow volumes, and edge-weight concentration vectors S_1(v, t) to resist NAT identity collapse.
      </div>
    </div>
  );
};
