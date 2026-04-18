import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, X, RefreshCw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────

const DISC_COLORS: Record<number, string> = {
  0:  '#3b82f6',
  1:  '#10b981',
  4:  '#f59e0b',
  5:  '#8b5cf6',
  8:  '#14b8a6',
  9:  '#eab308',
};

const DISC_NAMES: Record<number, string> = {
  0: 'Administration',
  1: 'Process Technology',
  4: 'Equipment',
  5: 'Piping & Layout',
  8: 'Instrumentation & Control',
  9: 'Electrical',
};

const SOURCE_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#14b8a6', '#ef4444', '#f97316', '#ec4899',
  '#06b6d4', '#84cc16', '#a855f7', '#0ea5e9',
];

function discColor(disc: number): string {
  return DISC_COLORS[disc] ?? '#94a3b8';
}

function nodeRadius(degree: number): number {
  return Math.max(4, Math.min(16, 4 + Math.sqrt(degree) * 2.2));
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface GNode {
  id: string;
  title: string;
  discipline: number;
  doc_type: string;
  source_folder: string;
  source_doc: string;
  degree: number;
  // simulation state (mutated in-place by tick)
  x: number; y: number;
  vx: number; vy: number;
}

interface GEdge { source: string; target: string; }

// ─── Main component ─────────────────────────────────────────────────────────

interface KGProps {
  /** Override the graph API URL. Defaults to /api/wiki/graph */
  graphUrl?: string;
  /** Force source-document coloring instead of auto-detecting from discipline field */
  forceColorMode?: 'source';
}

export const KnowledgeGraph: React.FC<KGProps> = ({ graphUrl, forceColorMode }) => {
  // UI state
  const [disc, setDisc]               = useState<number | 'all'>('all');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [meta, setMeta]               = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [neighbors, setNeighbors]     = useState<GNode[]>([]);
  const [expanded, setExpanded]       = useState(false);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation refs (no React state — mutated each frame)
  const simNodes  = useRef<GNode[]>([]);
  const simEdges  = useRef<GEdge[]>([]);
  const nodeIdx   = useRef<Map<string, GNode>>(new Map());
  const alphaRef  = useRef(1.0);

  // Color mode: 'discipline' for AK Chemetics docs, 'source' for user uploads
  const colorModeRef     = useRef<'discipline' | 'source'>('discipline');
  const sourceColorMapRef = useRef<Map<string, string>>(new Map());
  const [colorMode, setColorMode] = useState<'discipline' | 'source'>('discipline');
  const [sourceColorMap, setSourceColorMap] = useState<Map<string, string>>(new Map());

  // Transform ref (pan + zoom)
  const txRef = useRef({ tx: 0, ty: 0, scale: 1 });

  // Mouse ref
  const mouseRef = useRef({
    down: false, dragging: false,
    startX: 0, startY: 0,
    lastX:  0, lastY:  0,
    dragNode: null as GNode | null,
  });

  // Selected & hovered — as refs so render loop can read without closure issues
  const selRef     = useRef<GNode | null>(null);
  const hoveredRef = useRef<GNode | null>(null);

  // Smooth pan target (world-space node to center on)
  const panTargetRef = useRef<{ x: number; y: number } | null>(null);

  const rafRef = useRef<number>(0);

  // ── Fetch graph data from server ────────────────────────────────────────

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedNode(null);
    selRef.current = null;
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (disc !== 'all') params.set('discipline', String(disc));
      const base = graphUrl ?? '/api/wiki/graph';
      const r = await fetch(`${base}?${params}`);
      if (!r.ok) throw new Error(`Graph API ${r.status}: ${await r.text().then(t => t.slice(0, 120))}`);
      const data = await r.json();
      if (data.error) throw new Error(data.error);

      const canvas = canvasRef.current;
      const W = canvas?.offsetWidth  || 900;
      const H = canvas?.offsetHeight || 600;
      const n = data.nodes.length;

      // Place nodes in a jittered circle for nicer initial layout
      const nodes: GNode[] = data.nodes.map((nd: any, i: number) => ({
        ...nd,
        x: W / 2 + Math.cos((2 * Math.PI * i) / n) * (Math.min(W, H) * 0.28) + (Math.random() - 0.5) * 30,
        y: H / 2 + Math.sin((2 * Math.PI * i) / n) * (Math.min(W, H) * 0.28) + (Math.random() - 0.5) * 30,
        vx: 0, vy: 0,
      }));

      simNodes.current = nodes;
      simEdges.current = data.edges;
      nodeIdx.current  = new Map(nodes.map(n => [n.id, n]));
      alphaRef.current = 1.0;
      txRef.current    = { tx: 0, ty: 0, scale: 1 };

      // Detect whether to use discipline or source_doc coloring
      const hasDisc = nodes.some(n => n.discipline >= 0);
      if (!forceColorMode && hasDisc) {
        colorModeRef.current = 'discipline';
        setColorMode('discipline');
      } else {
        colorModeRef.current = 'source';
        setColorMode('source');
        const sources = [...new Set(nodes.map(n => n.source_doc).filter(Boolean))];
        const map = new Map(sources.map((s, i) => [s, SOURCE_PALETTE[i % SOURCE_PALETTE.length]]));
        sourceColorMapRef.current = map;
        setSourceColorMap(new Map(map));
      }

      setMeta(data.meta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [disc, forceColorMode]);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  // ── Simulation tick ────────────────────────────────────────────────────

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

    // ── Smooth pan toward selected node ───────────────────────────────────
    const pt = panTargetRef.current;
    if (pt) {
      const { tx, ty, scale } = txRef.current;
      const targetTx = W / 2 - pt.x * scale;
      const targetTy = H / 2 - pt.y * scale;
      const newTx = tx + (targetTx - tx) * 0.1;
      const newTy = ty + (targetTy - ty) * 0.1;
      txRef.current = { tx: newTx, ty: newTy, scale };
      if (Math.abs(newTx - targetTx) < 0.5 && Math.abs(newTy - targetTy) < 0.5) {
        txRef.current = { tx: targetTx, ty: targetTy, scale };
        panTargetRef.current = null;
      }
    }

    if (n > 0 && a > 0.002) {
      // Use a virtual area that scales with n so nodes don't spread too far apart for small graphs
      const area = W * H;
      const virtualArea = Math.min(area, Math.max(n * 9000, 80000));
      const k    = Math.min(Math.sqrt(virtualArea / n) * 1.2, 130);
      const kk   = k * k;

      // Reset force accumulators
      for (const nd of nodes) { (nd as any).fx = 0; (nd as any).fy = 0; }

      // Repulsion — O(n²), fine for n ≤ 200
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const ni = nodes[i], nj = nodes[j];
          const dx = ni.x - nj.x;
          const dy = ni.y - nj.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const force = kk / dist;
          const fx = force * dx / dist;
          const fy = force * dy / dist;
          (ni as any).fx += fx; (ni as any).fy += fy;
          (nj as any).fx -= fx; (nj as any).fy -= fy;
        }
      }

      // Attraction along edges (spring)
      for (const e of edges) {
        const s = idx.get(e.source);
        const t = idx.get(e.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (dist * dist) / k;
        const fx = force * dx / dist;
        const fy = force * dy / dist;
        (s as any).fx += fx; (s as any).fy += fy;
        (t as any).fx -= fx; (t as any).fy -= fy;
      }

      // Gravity toward canvas center — stronger for small graphs
      const cx = W / 2, cy = H / 2;
      const gravityStr = Math.max(0.02, 0.15 / Math.sqrt(n));
      for (const nd of nodes) {
        (nd as any).fx += (cx - nd.x) * gravityStr;
        (nd as any).fy += (cy - nd.y) * gravityStr;
      }

      // Apply displacement — small steps reduce overshoot → no oscillation
      const maxDisplace = Math.min(k * a, 10);
      const drag = mouseRef.current.dragNode;
      let totalDisp = 0;
      for (const nd of nodes) {
        if (nd === drag) continue;
        const fx = (nd as any).fx as number;
        const fy = (nd as any).fy as number;
        const mag = Math.sqrt(fx * fx + fy * fy) || 0.01;
        const disp = Math.min(mag, maxDisplace);
        totalDisp += disp;
        nd.x += (fx / mag) * disp;
        nd.y += (fy / mag) * disp;
      }

      alphaRef.current *= 0.92;
      // Convergence: stop when avg node movement drops below 0.3 px
      if (n > 0 && totalDisp / n < 0.3) alphaRef.current = 0;
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

    // Build neighbor set for selected node (for dimming)
    const selNeighborIds = new Set<string>();
    if (sel) {
      for (const e of simEdges.current) {
        if (e.source === sel.id) selNeighborIds.add(e.target);
        if (e.target === sel.id) selNeighborIds.add(e.source);
      }
    }

    // ── Draw edges ────────────────────────────────────────────────────────
    for (const e of simEdges.current) {
      const s = idx.get(e.source);
      const t = idx.get(e.target);
      if (!s || !t) continue;
      const highlight = sel && (e.source === sel.id || e.target === sel.id);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = highlight ? '#60a5fa' : '#475569';
      ctx.globalAlpha  = highlight ? 0.65 : 0.15;
      ctx.lineWidth    = (highlight ? 1.2 : 0.5) / scale;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── Draw nodes ────────────────────────────────────────────────────────
    for (const nd of nodes) {
      const color  = colorModeRef.current === 'source'
        ? (sourceColorMapRef.current.get(nd.source_doc) ?? '#94a3b8')
        : discColor(nd.discipline);
      const r      = nodeRadius(nd.degree);
      const isHov  = hovered?.id === nd.id;
      const isSel  = sel?.id === nd.id;
      const isNeighbor = sel && selNeighborIds.has(nd.id);
      const dimmed = sel && !isSel && !isNeighbor;

      ctx.globalAlpha = dimmed ? 0.15 : 1;

      // Glow ring for hovered / selected
      if (isHov || isSel) {
        const grd = ctx.createRadialGradient(nd.x, nd.y, r * 0.6, nd.x, nd.y, r + 10);
        const hex = color;
        grd.addColorStop(0, hex + '55');
        grd.addColorStop(1, hex + '00');
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, r + 10, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // White border (thicker for selected)
      ctx.strokeStyle = isSel ? '#fff' : 'rgba(255,255,255,0.45)';
      ctx.lineWidth   = (isSel ? 2 : 0.8) / scale;
      ctx.stroke();

      // Label — show for high-degree, hovered, or selected nodes
      if (!dimmed && (r >= 10 || isHov || isSel) && scale >= 0.5) {
        ctx.globalAlpha = isHov || isSel ? 1 : 0.55;
        ctx.fillStyle   = '#f1f5f9';
        ctx.font        = `${Math.round(9 / scale)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign   = 'center';
        const label = nd.title.length > 22 ? nd.title.slice(0, 20) + '…' : nd.title;
        ctx.fillText(label, nd.x, nd.y + r + 11 / scale);
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Start/stop RAF loop ─────────────────────────────────────────────────

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // ── Resize canvas to fill container ────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ── Hit detection (canvas → world coords) ──────────────────────────────

  const findNodeAt = useCallback((cx: number, cy: number): GNode | null => {
    const { tx, ty, scale } = txRef.current;
    const wx = (cx - tx) / scale;
    const wy = (cy - ty) / scale;
    // Reverse iterate so top-rendered (last) nodes are hit-tested first
    const nodes = simNodes.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const nd = nodes[i];
      const r  = nodeRadius(nd.degree) + 4;
      const dx = nd.x - wx, dy = nd.y - wy;
      if (dx * dx + dy * dy <= r * r) return nd;
    }
    return null;
  }, []);

  // ── Mouse handlers ─────────────────────────────────────────────────────

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { cx: e.clientX - rect.left, cy: e.clientY - rect.top };
  };

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { cx, cy } = getPos(e);
    const nd = findNodeAt(cx, cy);
    mouseRef.current = { down: true, dragging: false, startX: cx, startY: cy, lastX: cx, lastY: cy, dragNode: nd };
    if (nd && alphaRef.current < 0.05) alphaRef.current = 0.15; // reheat on node drag
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
        // Move node in world coords
        const { tx, ty, scale } = txRef.current;
        m.dragNode.x = (cx - tx) / scale;
        m.dragNode.y = (cy - ty) / scale;
      } else {
        // Pan — cancel any auto-pan
        panTargetRef.current = null;
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
        panTargetRef.current = { x: nd.x, y: nd.y };
        const neighbors = simEdges.current
          .filter(e => e.source === nd.id || e.target === nd.id)
          .map(e => e.source === nd.id ? e.target : e.source)
          .map(id => nodeIdx.current.get(id))
          .filter(Boolean) as GNode[];
        setNeighbors(neighbors.sort((a, b) => b.degree - a.degree));
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
    const newScale = Math.max(0.08, Math.min(6, scale * factor));
    txRef.current = {
      tx: cx - (cx - tx) * (newScale / scale),
      ty: cy - (cy - ty) * (newScale / scale),
      scale: newScale,
    };
  }, []);

  const zoom = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const { tx, ty, scale } = txRef.current;
    const newScale = Math.max(0.08, Math.min(6, scale * factor));
    txRef.current = {
      tx: cx - (cx - tx) * (newScale / scale),
      ty: cy - (cy - ty) * (newScale / scale),
      scale: newScale,
    };
  };

  const resetView = () => {
    txRef.current = { tx: 0, ty: 0, scale: 1 };
    alphaRef.current = 0.5; // kick simulation to re-center
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col"
      style={{
        background: '#0f172a',
        ...(expanded
          ? { position: 'absolute', inset: 0, zIndex: 20 }
          : { height: '100%' }),
      }}
    >

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0" style={{ background: '#1e293b', borderBottom: '1px solid rgba(71,85,105,0.4)' }}>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Knowledge Graph</span>

        {colorMode === 'discipline' && (
          <select
            value={disc === 'all' ? 'all' : String(disc)}
            onChange={e => setDisc(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="text-xs rounded-lg px-3 py-1.5 outline-none"
            style={{ background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1' }}
          >
            <option value="all">All Disciplines</option>
            {Object.entries(DISC_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}

        {meta && (
          <span className="text-[10px] font-mono text-slate-500">
            {meta.shown_nodes} nodes · {meta.shown_edges} edges
            {meta.total_nodes > meta.shown_nodes && ` (top ${meta.shown_nodes} of ${meta.total_nodes})`}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => zoom(1.2)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => zoom(0.83)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors" title={expanded ? 'Exit fullscreen' : 'Expand'}>
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={fetchGraph}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: '#334155', color: '#cbd5e1' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Main area: canvas wrapper + sidebar as flex siblings */}
      <div className="flex flex-1 overflow-hidden">

        {/* Canvas + overlays */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: '#0f172a', touchAction: 'none' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onWheel={onWheel}
          />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.85)' }}>
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-sm text-slate-400">Parsing wiki links…</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-red-400 px-4 py-3 rounded-xl" style={{ background: '#1e293b' }}>{error}</p>
            </div>
          )}

          {/* Hint tooltip */}
          {!loading && !error && !selectedNode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full pointer-events-none"
              style={{ background: 'rgba(30,41,59,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(71,85,105,0.3)' }}>
              <p className="text-[10px] text-slate-400 font-mono">Scroll to zoom · drag to pan · click a node to explore</p>
            </div>
          )}

          {/* Legend */}
          {!loading && !error && (
            <div className="absolute bottom-4 left-4 rounded-xl p-3 pointer-events-none"
              style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(71,85,105,0.4)' }}>
              {colorMode === 'discipline' ? (
                <>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Discipline</p>
                  {Object.entries(DISC_NAMES).map(([id, name]) => (
                    <div key={id} className="flex items-center gap-2 mb-1 last:mb-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 block" style={{ background: discColor(parseInt(id)) }} />
                      <span className="text-[10px] text-slate-400">{name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(71,85,105,0.3)' }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0 block" />
                    <span className="text-[10px] text-slate-400">Other</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Source</p>
                  {[...sourceColorMap.entries()].map(([src, color]) => (
                    <div key={src} className="flex items-center gap-2 mb-1 last:mb-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 block" style={{ background: color }} />
                      <span className="text-[10px] text-slate-400 max-w-[140px] truncate" title={src}>{src}</span>
                    </div>
                  ))}
                  {sourceColorMap.size === 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0 block" />
                      <span className="text-[10px] text-slate-400">Unknown</span>
                    </div>
                  )}
                </>
              )}
              <p className="text-[9px] text-slate-600 mt-2 font-mono">Node size = # of links</p>
            </div>
          )}
        </div>

        {/* Node detail sidebar — flex sibling, never clipped */}
        {selectedNode && (
          <div className="flex flex-col overflow-hidden shrink-0"
            style={{ width: 260, background: '#1e293b', borderLeft: '1px solid rgba(71,85,105,0.4)' }}>

            {/* Header */}
            <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(71,85,105,0.3)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {colorMode === 'discipline' ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: discColor(selectedNode.discipline) + '25', color: discColor(selectedNode.discipline) }}>
                        {DISC_NAMES[selectedNode.discipline] ?? `Disc ${selectedNode.discipline}`}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full truncate max-w-[180px]"
                        style={{ background: (sourceColorMap.get(selectedNode.source_doc) ?? '#94a3b8') + '25', color: sourceColorMap.get(selectedNode.source_doc) ?? '#94a3b8' }}
                        title={selectedNode.source_doc}>
                        {selectedNode.source_doc || 'Unknown'}
                      </span>
                    )}
                    {selectedNode.doc_type && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded text-slate-400"
                        style={{ background: 'rgba(71,85,105,0.4)' }}>
                        {selectedNode.doc_type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-100 leading-tight">{selectedNode.title}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 break-all">{selectedNode.id}</p>
                </div>
                <button
                  onClick={() => { setSelectedNode(null); selRef.current = null; }}
                  className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(71,85,105,0.3)' }}>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(15,23,42,0.6)' }}>
                  <p className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Links</p>
                  <p className="text-xl font-bold" style={{ color: discColor(selectedNode.discipline) }}>
                    {selectedNode.degree}
                  </p>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(15,23,42,0.6)' }}>
                  <p className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">Folder</p>
                  <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                    {selectedNode.source_folder || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Connected pages */}
            {neighbors.length > 0 && (
              <div className="px-4 py-3 flex-1 overflow-y-auto">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                  {neighbors.length} Connected Pages
                </p>
                <div className="space-y-0.5">
                  {neighbors.slice(0, 20).map(nb => (
                    <button
                      key={nb.id}
                      onClick={() => {
                        selRef.current = nb;
                        setSelectedNode(nb);
                        panTargetRef.current = { x: nb.x, y: nb.y };
                        const nbNeighbors = simEdges.current
                          .filter(e => e.source === nb.id || e.target === nb.id)
                          .map(e => e.source === nb.id ? e.target : e.source)
                          .map(id => nodeIdx.current.get(id))
                          .filter(Boolean) as GNode[];
                        setNeighbors(nbNeighbors.sort((a, b) => b.degree - a.degree));
                      }}
                      className="w-full text-left flex items-start gap-2.5 px-2 py-2 rounded-lg transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(71,85,105,0.25)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0 mt-1.5 block" style={{ background: discColor(nb.discipline) }} />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-300 leading-snug truncate">{nb.title}</p>
                        <p className="text-[9px] font-mono text-slate-600">{nb.degree} links</p>
                      </div>
                    </button>
                  ))}
                  {neighbors.length > 20 && (
                    <p className="text-[10px] text-slate-600 pl-4 pt-1">+ {neighbors.length - 20} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
