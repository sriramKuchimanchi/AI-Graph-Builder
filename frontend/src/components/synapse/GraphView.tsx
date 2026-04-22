import { useMemo, useRef, useCallback } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  Position,
  Handle,
  NodeProps,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import dagre from "@dagrejs/dagre";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { useGraph } from "@/lib/hooks";

const NODE_W = 160;
const NODE_H = 56;

const TYPE_COLOR: Record<string, string> = {
  Person:       "#6366f1",
  Organization: "#0ea5e9",
  Location:     "#10b981",
  Product:      "#f59e0b",
  Date:         "#ec4899",
  Event:        "#8b5cf6",
  Concept:      "#14b8a6",
  Other:        "#94a3b8",
};

const getColor = (type: string) => TYPE_COLOR[type] ?? TYPE_COLOR.Other;

const EntityNode = ({ data }: NodeProps<{ label: string; type: string }>) => {
  const color = getColor(data.type);
  return (
    <div
      style={{ borderColor: color, width: NODE_W }}
      className="rounded-lg border-2 bg-white px-3 py-2 shadow-sm"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color, width: 8, height: 8, border: "2px solid white" }}
      />
      <p style={{ color }} className="text-[9px] font-bold uppercase tracking-widest leading-none mb-1">
        {data.type}
      </p>
      <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
        {data.label}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color, width: 8, height: 8, border: "2px solid white" }}
      />
    </div>
  );
};

const nodeTypes = { entity: EntityNode };

const applyDagreLayout = (
  rawNodes: Array<{ id: string; type: string; label: string; mention_count: number }>,
  rawEdges: Array<{ id: string; source: string; target: string; predicate: string; confidence: number }>
) => {
  // Only show nodes that have at least one connection
  const connectedIds = new Set<string>();
  rawEdges.forEach((e) => { connectedIds.add(e.source); connectedIds.add(e.target); });
  const nodes_to_layout = rawNodes.filter((n) => connectedIds.has(n.id));

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 120, edgesep: 20 });

  nodes_to_layout.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  rawEdges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const nodes: Node[] = nodes_to_layout.map((n) => {
    const { x, y } = g.node(n.id);
    return {
      id: n.id,
      type: "entity",
      position: { x: x - NODE_W / 2, y: y - NODE_H / 2 },
      data: { label: n.label, type: n.type },
    };
  });

  const edges: Edge[] = rawEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.predicate,
    type: "smoothstep",
    animated: Number(e.confidence) > 0.9,
    style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    labelStyle: { fill: "#6b7280", fontSize: 10, fontWeight: 500 },
    labelBgStyle: { fill: "#ffffff", fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 3,
  }));

  return { nodes, edges };
};

const GraphViewInner = () => {
  const { data, isLoading, isError } = useGraph();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!data?.nodes.length) return { nodes: [] as Node[], edges: [] as Edge[] };
    return applyDagreLayout(data.nodes, data.edges);
  }, [data]);

  const presentTypes = useMemo(() => {
    if (!data?.nodes.length) return [];
    return [...new Set(data.nodes.map((n) => n.type))].filter((t) => t in TYPE_COLOR);
  }, [data]);

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <div>
          <h3 className="font-display text-base font-semibold">Knowledge Graph</h3>
          <p className="text-xs text-muted-foreground">Live from the database</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presentTypes.map((type) => (
            <span
              key={type}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-600"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: getColor(type) }} />
              {type}
            </span>
          ))}
          <Badge variant="secondary" className="font-mono text-[10px]">
            {nodes.length} nodes · {edges.length} edges
          </Badge>
        </div>
      </div>

      <div ref={containerRef} className="relative h-[600px] w-full bg-gray-50">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading graph…
          </div>
        )}
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="flex max-w-md items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Backend unreachable.
            </div>
          </div>
        )}
        {!isLoading && !isError && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No entities yet. Upload documents to populate the graph.
          </div>
        )}
        {nodes.length > 0 && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.12 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={2}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#e2e8f0" />

            {/* Custom controls — no lock button, working fullscreen */}
            <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1">
              <button
                onClick={() => zoomIn()}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 text-base font-medium"
                title="Zoom in"
              >+</button>
              <button
                onClick={() => zoomOut()}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 text-base font-medium"
                title="Zoom out"
              >−</button>
              <button
                onClick={() => fitView({ padding: 0.12 })}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                title="Fit view"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={handleFullscreen}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                title="Toggle fullscreen"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <MiniMap
              nodeColor={(n) => getColor(n.data?.type)}
              maskColor="rgba(248,250,252,0.85)"
              className="!rounded-lg !border !border-border !shadow-sm"
            />
          </ReactFlow>
        )}
      </div>
    </Card>
  );
};

export const GraphView = () => (
  <ReactFlowProvider>
    <GraphViewInner />
  </ReactFlowProvider>
);