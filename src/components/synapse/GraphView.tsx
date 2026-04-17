import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  Position,
  Handle,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { useGraph } from "@/lib/hooks";

const EntityNode = ({ data }: NodeProps<{ label: string; type: string }>) => (
  <div className="relative rounded-xl border border-border bg-card px-4 py-2.5 shadow-soft transition-all hover:border-primary/40">
    <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-primary/40" />
    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {data.type}
    </div>
    <div className="text-sm font-semibold">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-primary/40" />
  </div>
);

const nodeTypes = { entity: EntityNode };

// Simple radial layout so the graph isn't all stacked at (0,0)
const layoutNodes = (ids: string[]): Record<string, { x: number; y: number }> => {
  const out: Record<string, { x: number; y: number }> = {};
  const radius = Math.max(180, ids.length * 30);
  ids.forEach((id, i) => {
    const angle = (i / ids.length) * Math.PI * 2;
    out[id] = { x: 400 + radius * Math.cos(angle), y: 260 + radius * Math.sin(angle) };
  });
  return out;
};

export const GraphView = () => {
  const { data, isLoading, isError } = useGraph();

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [] as Node[], edges: [] as Edge[] };
    const positions = layoutNodes(data.nodes.map((n) => n.id));
    const nodes: Node[] = data.nodes.map((n) => ({
      id: n.id,
      type: "entity",
      position: positions[n.id],
      data: { label: n.label, type: n.type },
    }));
    const edges: Edge[] = data.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.predicate,
      animated: Number(e.confidence) > 0.9,
      type: "smoothstep",
      style: { stroke: "hsl(var(--primary))", strokeWidth: 1.5 },
      labelStyle: { fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: "hsl(var(--background))" },
      labelBgPadding: [4, 2] as [number, number],
    }));
    return { nodes, edges };
  }, [data]);

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <div>
          <h3 className="font-display text-base font-semibold">Knowledge Graph</h3>
          <p className="text-xs text-muted-foreground">Live from the database</p>
        </div>
        <Badge variant="secondary" className="font-mono text-[10px]">
          {nodes.length} nodes · {edges.length} edges
        </Badge>
      </div>

      <div className="relative h-[520px] w-full bg-gradient-soft">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading graph…
          </div>
        )}
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="flex max-w-md items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Backend unreachable. Start it with <code className="font-mono">cd backend && npm run dev</code>.
            </div>
          </div>
        )}
        {!isLoading && !isError && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No entities yet. Upload documents and seed extraction to populate the graph.
          </div>
        )}
        {nodes.length > 0 && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="hsl(var(--border))" />
            <Controls className="!rounded-lg !border !border-border !bg-card !shadow-soft [&>button]:!border-border [&>button]:!bg-card" />
          </ReactFlow>
        )}
      </div>
    </Card>
  );
};
