"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Download, Image as ImageIcon } from "lucide-react";
import type { MindMapNode } from "@/lib/types";

interface PositionedNode {
  node: MindMapNode;
  x: number;
  y: number;
  parent?: PositionedNode;
  depth: number;
  hasChildren: boolean;
}

const H_GAP = 220;
const V_GAP = 56;

function layoutTree(root: MindMapNode, collapsed: Set<string>): PositionedNode[] {
  const nodes: PositionedNode[] = [];
  let cursor = 0;

  function place(n: MindMapNode, depth: number, parent?: PositionedNode): PositionedNode {
    const isCollapsed = collapsed.has(n.id);
    const kids = !isCollapsed && n.children?.length ? n.children : [];
    let y: number;
    if (kids.length === 0) {
      y = cursor * V_GAP;
      cursor += 1;
    } else {
      const placedKids: PositionedNode[] = [];
      const self: PositionedNode = { node: n, x: depth * H_GAP, y: 0, parent, depth, hasChildren: !!n.children?.length };
      for (const k of kids) placedKids.push(place(k, depth + 1, self));
      y = (placedKids[0].y + placedKids[placedKids.length - 1].y) / 2;
      self.y = y;
      nodes.push(self);
      return self;
    }
    const self: PositionedNode = { node: n, x: depth * H_GAP, y, parent, depth, hasChildren: !!n.children?.length };
    nodes.push(self);
    return self;
  }

  place(root, 0);
  return nodes;
}

export function MindMap({ root }: { root: MindMapNode }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const nodes = useMemo(() => layoutTree(root, collapsed), [root, collapsed]);
  const height = Math.max(...nodes.map((n) => n.y)) + 120;
  const width = Math.max(...nodes.map((n) => n.x)) + 260;

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const serializeSvg = () => {
    const svg = svgRef.current;
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    const g = clone.querySelector("g");
    g?.setAttribute("transform", "translate(60,40) scale(1)");
    return new XMLSerializer().serializeToString(clone);
  };

  const exportSvg = () => {
    const str = serializeSvg();
    if (!str) return;
    const blob = new Blob([str], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mindmap.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportPng = () => {
    const str = serializeSvg();
    if (!str) return;
    const img = new Image();
    const url = URL.createObjectURL(new Blob([str], { type: "image/svg+xml" }));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "mindmap.png";
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="card relative h-[560px] overflow-hidden">
      <div className="absolute end-3 top-3 z-10 flex gap-1.5">
        <button onClick={() => setZoom((z) => Math.min(z * 1.2, 3))} className="btn-ghost size-9 !p-0" aria-label="Zoom in"><ZoomIn className="size-4" /></button>
        <button onClick={() => setZoom((z) => Math.max(z / 1.2, 0.35))} className="btn-ghost size-9 !p-0" aria-label="Zoom out"><ZoomOut className="size-4" /></button>
        <button onClick={() => { setZoom(1); setPan({ x: 60, y: 40 }); }} className="btn-ghost size-9 !p-0" aria-label="Reset view"><Maximize2 className="size-4" /></button>
        <button onClick={exportSvg} className="btn-ghost h-9 px-3 text-xs"><Download className="size-3.5" /> SVG</button>
        <button onClick={exportPng} className="btn-ghost h-9 px-3 text-xs"><ImageIcon className="size-3.5" /> PNG</button>
      </div>
      <p className="absolute bottom-3 start-4 z-10 text-[11px] text-slate-400">
        Drag to pan · click a node to collapse / expand its branch
      </p>
      <svg
        ref={svgRef}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={(e) => setZoom((z) => Math.min(3, Math.max(0.35, z * (e.deltaY < 0 ? 1.08 : 0.92))))}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`} style={{ transition: dragging ? "none" : "transform 0.15s ease-out" }}>
          {/* Edges */}
          {nodes.map((n) =>
            n.parent ? (
              <path
                key={`e-${n.node.id}`}
                d={`M ${n.parent.x + 150} ${n.parent.y + 18} C ${n.parent.x + 190} ${n.parent.y + 18}, ${n.x - 40} ${n.y + 18}, ${n.x} ${n.y + 18}`}
                fill="none"
                stroke={n.node.color}
                strokeOpacity={0.45}
                strokeWidth={1.8}
              />
            ) : null
          )}
          {/* Nodes */}
          {nodes.map((n) => {
            const isRoot = n.depth === 0;
            const isCollapsed = collapsed.has(n.node.id);
            return (
              <g
                key={n.node.id}
                transform={`translate(${n.x},${n.y})`}
                onClick={(e) => { e.stopPropagation(); if (n.hasChildren) toggle(n.node.id); }}
                onPointerDown={(e) => e.stopPropagation()}
                className={n.hasChildren ? "cursor-pointer" : "cursor-default"}
                style={{ transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}
              >
                <rect
                  width={150}
                  height={36}
                  rx={isRoot ? 18 : 12}
                  fill={isRoot ? n.node.color : "var(--surface-strong)"}
                  stroke={n.node.color}
                  strokeWidth={isRoot ? 0 : 1.6}
                  strokeOpacity={0.7}
                />
                <text
                  x={75}
                  y={23}
                  textAnchor="middle"
                  fontSize={12.5}
                  fontWeight={isRoot ? 700 : 600}
                  fill={isRoot ? "#ffffff" : "currentColor"}
                >
                  {n.node.label}
                </text>
                {n.hasChildren && (
                  <g transform="translate(150,18)">
                    <circle r={8} fill={n.node.color} />
                    <text x={0} y={3.5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                      {isCollapsed ? "+" : "−"}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
