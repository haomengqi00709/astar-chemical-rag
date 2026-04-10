import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// ─── Role → colour mapping ───────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  'PM':                  '#3b82f6',   // blue
  'Process Engineer':    '#10b981',   // emerald
  'Mechanical Engineer': '#f97316',   // orange
  'PDF':                 '#ef4444',   // red
  'DOCX':                '#6366f1',   // indigo
};
const ROLE_LABELS: Record<string, string> = {
  'PM':                  'Project Manager',
  'Process Engineer':    'Process Engineer',
  'Mechanical Engineer': 'Mechanical Engineer',
  'PDF':                 'PDF',
  'DOCX':                'Word Document',
};
function roleColor(role: string) { return ROLE_COLORS[role] ?? '#94a3b8'; }

// ─── Doc-type → shape hint (just affects label prefix) ────────────────────

const DOC_TYPE_ICONS: Record<string, string> = {
  PRC: '⟨P⟩', CAL: '⟨C⟩', LST: '⟨L⟩', DAT: '⟨D⟩', SPC: '⟨S⟩',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface PGNode {
  id: string;          // doc_id
  title: string;
  role: string;
  doc_type: string;
  degree: number;
  x: number; y: number;
  // force accumulators (mutated each frame, not React state)
  fx?: number; fy?: number;
}

interface PGEdge { source: string; target: string; }

// ─── Graph builder ───────────────────────────────────────────────────────────

function buildProjectGraph(
  register: any[],
  deliverables: Record<string, string>,
): { nodes: PGNode[]; edges: PGEdge[] } {
  const docIds = register.map((d: any) => d.doc_id as string);
  const idSet  = new Set(docIds);

  // Build nodes — include all register items, not just those with content
  const nodeMap = new Map<string, PGNode>();
  for (const d of register) {
    const typeMatch = (d.doc_id as string).match(/-([A-Z]+)-/);
    nodeMap.set(d.doc_id, {
      id:       d.doc_id,
      title:    d.title ?? d.doc_id,
      role:     d.assigned_to ?? 'PM',
      doc_type: typeMatch ? typeMatch[1] : '',
      degree:   0,
      x: 0, y: 0,
    });
  }

  // Find cross-references in content
  const rawEdges: PGEdge[] = [];
  for (const [srcId, content] of Object.entries(deliverables)) {
    if (!nodeMap.has(srcId)) continue;
    for (const tgtId of docIds) {
      if (tgtId === srcId) continue;
      if (!nodeMap.has(tgtId)) continue;
      // Escape special regex chars in doc_id and check for occurrence in content
      const escaped = tgtId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      if (new RegExp(escaped).test(content)) {
        rawEdges.push({ source: srcId, target: tgtId });
      }
    }
  }

  // Deduplicate edges (keep undirected)
  const edgeSet = new Set<string>();
  const edges: PGEdge[] = [];
  for (const e of rawEdges) {
    const key = [e.source, e.target].sort().join('||');
    if (!edgeSet.has(key)) { edgeSet.add(key); edges.push(e); }
  }

  // Compute degree
  for (const e of edges) {
    const s = nodeMap.get(e.source);
    const t = nodeMap.get(e.target);
    if (s) s.degree++;
    if (t) t.degree++;
  }

  const nodes = [...nodeMap.values()];
  return { nodes, edges };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  register:    any[];
  deliverables: Record<string, string>;
  docStatus:   Record<string, any>;
}

export const ProjectGraph: React.FC<Props> = ({ register, deliverables, docStatus }) => {
  const [selectedNode, setSelectedNode] = useState<PGNode | null>(null);
  const [neighbors,    setNeighbors]    = useState<PGNode[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simNodes  = useRef<PGNode[]>([]);
  const simEdges  = useRef<PGEdge[]>([]);
  const nodeIdx   = useRef<Map<string, PGNode>>(new Map());
  const alphaRef  = useRef(1.0);
  const txRef     = useRef({ tx: 0, ty: 0, scale: 1 });
  const mouseRef  = useRef({ down: false, dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0, dragNode: null as PGNode | null });
  const selRef    = useRef<PGNode | null>(null);
  const hoveredRef= useRef<PGNode | null>(null);
  const rafRef    = useRef<number>(0);

  // ── Build graph from project data ─────────────────────────────────────────

  const { nodes: builtNodes, edges: builtEdges } = useMemo(
    () => buildProjectGraph(register, deliverables),
    [register, deliverables],
  );

  // ── Seed simulation ───────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const W = canvas?.offsetWidth  || 800;
    const H = canvas?.offsetHeight || 500;
    const n = builtNodes.length;

    // Group by role for initial placement in clusters
    const roles = [...new Set(builtNodes.map(d => d.role))];
    const roleIdx = (r: string) => roles.indexOf(r);

    const nodes: PGNode[] = builtNodes.map((nd, i) => {
      const ri   = roleIdx(nd.role);
      const angle = (2 * Math.PI * ri) / Math.max(roles.length, 1);
      const spread = (Math.min(W, H) * 0.22);
      return {
        ...nd,
        x: W / 2 + Math.cos(angle) * spread + (Math.random() - 0.5) * 60,
        y: H / 2 + Math.sin(angle) * spread + (Math.random() - 0.5) * 60,
      };
    });

    simNodes.current = nodes;
    simEdges.current = builtEdges;
    nodeIdx.current  = new Map(nodes.map(n => [n.id, n]));
    alphaRef.current = 1.0;
    txRef.current    = { tx: 0, ty: 0, scale: 1 };
    setSelectedNode(null);
    selRef.current = null;
  }, [builtNodes, builtEdges]);

  // ── Simulation tick ───────────────────────────────────────────────────────

  const tick = useCallback(() => {
    const nodes  = simNodes.current;
    const edges  = simEdges.current;
    const idx    = nodeIdx.current;
    const canvas = canvasRef.current;

    if (!canvas) { rafRef.current = requestAnimationFrame(tick); return; }

    const W = canvas.width;
    const H = canvas.height;
    const n = nodes.length;
    const a = alphaRef.current;

    if (n > 0 && a > 0.002) {
      const area = W * H;
      const virtualArea = Math.min(area, Math.max(n * 9000, 80000));
      const k    = Math.min(Math.sqrt(virtualArea / Math.max(n, 1)) * 1.4, 130);
      const kk   = k * k;

      for (const nd of nodes) { nd.fx = 0; nd.fy = 0; }

      // Repulsion
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const ni = nodes[i], nj = nodes[j];
          const dx = ni.x - nj.x, dy = ni.y - nj.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const force = kk / dist;
          const fx = force * dx / dist, fy = force * dy / dist;
          ni.fx! += fx; ni.fy! += fy;
          nj.fx! -= fx; nj.fy! -= fy;
        }
      }

      // Attraction along edges
      for (const e of edges) {
        const s = idx.get(e.source), t = idx.get(e.target);
        if (!s || !t) continue;
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (dist * dist) / k;
        const fx = force * dx / dist, fy = force * dy / dist;
        s.fx! += fx; s.fy! += fy;
        t.fx! -= fx; t.fy! -= fy;
      }

      // Gravity to center — stronger for small graphs
      const gravityStr = Math.max(0.04, 0.15 / Math.sqrt(n));
      for (const nd of nodes) {
        nd.fx! += (W / 2 - nd.x) * gravityStr;
        nd.fy! += (H / 2 - nd.y) * gravityStr;
      }

      // Apply displacement
      const maxDisplace = Math.min(k * a, 35);
      const drag = mouseRef.current.dragNode;
      for (const nd of nodes) {
        if (nd === drag) continue;
        const fx = nd.fx!, fy = nd.fy!;
        const mag = Math.sqrt(fx * fx + fy * fy) || 0.01;
        const disp = Math.min(mag, maxDisplace);
        nd.x += (fx / mag) * disp;
        nd.y += (fy / mag) * disp;
      }

      alphaRef.current *= 0.96;
    }

    // ── Render ────────────────────────────────────────────────────────────
    const ctx = canvas.getContext('2d');
    if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }

    const { tx, ty, scale } = txRef.current;
    const sel     = selRef.current;
    const hovered = hoveredRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    // Neighbor set for dimming
    const selNeighborIds = new Set<string>();
    if (sel) {
      for (const e of simEdges.current) {
        if (e.source === sel.id) selNeighborIds.add(e.target);
        if (e.target === sel.id) selNeighborIds.add(e.source);
      }
    }

    // Edges
    for (const e of simEdges.current) {
      const s = idx.get(e.source), t = idx.get(e.target);
      if (!s || !t) continue;
      const highlight = sel && (e.source === sel.id || e.target === sel.id);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = highlight ? '#60a5fa' : '#475569';
      ctx.globalAlpha  = highlight ? 0.7 : 0.2;
      ctx.lineWidth    = (highlight ? 1.5 : 0.8) / scale;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Nodes
    for (const nd of nodes) {
      const color    = roleColor(nd.role);
      const r        = Math.max(8, Math.min(20, 8 + Math.sqrt(nd.degree) * 3));
      const isHov    = hovered?.id === nd.id;
      const isSel    = sel?.id === nd.id;
      const isNeighbor = sel && selNeighborIds.has(nd.id);
      const dimmed   = sel && !isSel && !isNeighbor;

      ctx.globalAlpha = dimmed ? 0.15 : 1;

      // Glow
      if (isHov || isSel) {
        const grd = ctx.createRadialGradient(nd.x, nd.y, r * 0.5, nd.x, nd.y, r + 14);
        grd.addColorStop(0, color + '55');
        grd.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, r + 14, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Circle
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isSel ? '#fff' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth   = (isSel ? 2.5 : 1) / scale;
      ctx.stroke();

      // Label
      if (!dimmed && scale >= 0.4) {
        ctx.globalAlpha = isHov || isSel ? 1 : 0.75;
        ctx.fillStyle   = '#f1f5f9';
        const fontSize  = Math.round(10 / scale);
        ctx.font        = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign   = 'center';
        // doc_id on first line, short title on second
        ctx.fillText(nd.id, nd.x, nd.y + r + (fontSize + 2) / scale);
        if (isHov || isSel) {
          ctx.globalAlpha = 0.5;
          ctx.font = `${Math.round(8 / scale)}px ui-sans-serif, system-ui, sans-serif`;
          const short = nd.title.length > 24 ? nd.title.slice(0, 22) + '…' : nd.title;
          ctx.fillText(short, nd.x, nd.y + r + (fontSize + 2 + 11) / scale);
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // ── Resize ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ── Hit detection ─────────────────────────────────────────────────────────

  const findNodeAt = useCallback((cx: number, cy: number): PGNode | null => {
    const { tx, ty, scale } = txRef.current;
    const wx = (cx - tx) / scale, wy = (cy - ty) / scale;
    const nodes = simNodes.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const nd = nodes[i];
      const r  = Math.max(8, Math.min(20, 8 + Math.sqrt(nd.degree) * 3)) + 4;
      const dx = nd.x - wx, dy = nd.y - wy;
      if (dx * dx + dy * dy <= r * r) return nd;
    }
    return null;
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { cx: e.clientX - rect.left, cy: e.clientY - rect.top };
  };

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { cx, cy } = getPos(e);
    const nd = findNodeAt(cx, cy);
    mouseRef.current = { down: true, dragging: false, startX: cx, startY: cy, lastX: cx, lastY: cy, dragNode: nd };
    if (nd && alphaRef.current < 0.05) alphaRef.current = 0.15;
  }, [findNodeAt]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { cx, cy } = getPos(e);
    const m = mouseRef.current;
    if (m.down) {
      const ddx = cx - m.startX, ddy = cy - m.startY;
      if (Math.sqrt(ddx * ddx + ddy * ddy) > 4) m.dragging = true;
    }
    if (m.dragging) {
      if (m.dragNode) {
        const { tx, ty, scale } = txRef.current;
        m.dragNode.x = (cx - tx) / scale;
        m.dragNode.y = (cy - ty) / scale;
      } else {
        txRef.current.tx += cx - m.lastX;
        txRef.current.ty += cy - m.lastY;
      }
    }
    m.lastX = cx; m.lastY = cy;
    hoveredRef.current = findNodeAt(cx, cy);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoveredRef.current ? 'pointer' : (m.down && !m.dragNode ? 'grabbing' : 'default');
    }
  }, [findNodeAt]);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const m = mouseRef.current;
    if (!m.dragging) {
      const { cx, cy } = getPos(e);
      const nd = findNodeAt(cx, cy);
      selRef.current = nd;
      setSelectedNode(nd);
      if (nd) {
        const nbs = simEdges.current
          .filter(e => e.source === nd.id || e.target === nd.id)
          .map(e => e.source === nd.id ? e.target : e.source)
          .map(id => nodeIdx.current.get(id))
          .filter(Boolean) as PGNode[];
        setNeighbors(nbs);
      }
    }
    m.down = false; m.dragging = false; m.dragNode = null;
  }, [findNodeAt]);

  const onMouseLeave = useCallback(() => {
    hoveredRef.current = null;
    const m = mouseRef.current;
    m.down = false; m.dragging = false; m.dragNode = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { cx, cy } = getPos(e);
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const { tx, ty, scale } = txRef.current;
    const newScale = Math.max(0.1, Math.min(8, scale * factor));
    txRef.current = { tx: cx - (cx - tx) * (newScale / scale), ty: cy - (cy - ty) * (newScale / scale), scale: newScale };
  }, []);

  const zoom = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const { tx, ty, scale } = txRef.current;
    const newScale = Math.max(0.1, Math.min(8, scale * factor));
    txRef.current = { tx: cx - (cx - tx) * (newScale / scale), ty: cy - (cy - ty) * (newScale / scale), scale: newScale };
  };

  const resetView = () => { txRef.current = { tx: 0, ty: 0, scale: 1 }; alphaRef.current = 0.4; };

  const totalEdges = builtEdges.length;
  const totalNodes = builtNodes.length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ background: '#0f172a' }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 shrink-0" style={{ background: '#1e293b', borderBottom: '1px solid rgba(71,85,105,0.4)' }}>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Document Graph</span>
        <span className="text-[10px] font-mono text-slate-500">{totalNodes} docs · {totalEdges} cross-ref{totalEdges !== 1 ? 's' : ''}</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => zoom(1.2)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Zoom in"><ZoomIn className="w-3.5 h-3.5" /></button>
          <button onClick={() => zoom(0.83)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Zoom out"><ZoomOut className="w-3.5 h-3.5" /></button>
          <button onClick={resetView} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Reset"><Maximize2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="flex-1 block"
          style={{ background: '#0f172a', touchAction: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onWheel={onWheel}
        />

        {/* Empty state */}
        {totalNodes === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-slate-500 font-mono">No generated documents to graph yet.</p>
          </div>
        )}

        {/* Hint */}
        {totalNodes > 0 && !selectedNode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full pointer-events-none"
            style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(6px)', border: '1px solid rgba(71,85,105,0.3)' }}>
            <p className="text-[10px] text-slate-400 font-mono">Scroll to zoom · drag to pan · click a node</p>
          </div>
        )}

        {/* Legend */}
        {totalNodes > 0 && (
          <div className="absolute bottom-3 left-3 rounded-xl p-3 pointer-events-none"
            style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(71,85,105,0.4)' }}>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Role</p>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 mb-1 last:mb-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: roleColor(key) }} />
                <span className="text-[10px] text-slate-400">{label}</span>
              </div>
            ))}
            <p className="text-[9px] text-slate-600 mt-2 font-mono border-t border-slate-700 pt-1.5">
              Edges = cross-references in content
            </p>
          </div>
        )}

        {/* Node detail sidebar */}
        {selectedNode && (
          <div className="absolute right-0 top-0 bottom-0 w-68 overflow-y-auto flex flex-col"
            style={{ width: 260, background: '#1e293b', borderLeft: '1px solid rgba(71,85,105,0.4)' }}>
            <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(71,85,105,0.3)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mb-2"
                    style={{ background: roleColor(selectedNode.role) + '25', color: roleColor(selectedNode.role) }}>
                    {ROLE_LABELS[selectedNode.role] ?? selectedNode.role}
                  </span>
                  <p className="text-xs font-bold font-mono text-slate-100">{selectedNode.id}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{selectedNode.title}</p>
                </div>
                <button onClick={() => { setSelectedNode(null); selRef.current = null; }}
                  className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(71,85,105,0.3)' }}>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(15,23,42,0.6)' }}>
                  <p className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Cross-refs</p>
                  <p className="text-xl font-bold" style={{ color: roleColor(selectedNode.role) }}>
                    {selectedNode.degree}
                  </p>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(15,23,42,0.6)' }}>
                  <p className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Type</p>
                  <p className="text-sm font-bold text-slate-300 mt-0.5">{selectedNode.doc_type || '—'}</p>
                </div>
              </div>
            </div>

            {neighbors.length > 0 && (
              <div className="px-4 py-3 flex-1">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                  {neighbors.length} Linked Document{neighbors.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-0.5">
                  {neighbors.map(nb => (
                    <button
                      key={nb.id}
                      onClick={() => {
                        selRef.current = nb;
                        setSelectedNode(nb);
                        const nbs2 = simEdges.current
                          .filter(e => e.source === nb.id || e.target === nb.id)
                          .map(e => e.source === nb.id ? e.target : e.source)
                          .map(id => nodeIdx.current.get(id))
                          .filter(Boolean) as PGNode[];
                        setNeighbors(nbs2);
                      }}
                      className="w-full text-left flex items-start gap-2.5 px-2 py-2 rounded-lg transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(71,85,105,0.25)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: roleColor(nb.role) }} />
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-slate-300 leading-snug">{nb.id}</p>
                        <p className="text-[9px] text-slate-500 truncate">{nb.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {neighbors.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-[10px] text-slate-600 font-mono">No cross-references found<br />in document content.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
