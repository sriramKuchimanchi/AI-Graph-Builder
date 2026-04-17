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
import { Button } from "@/components/ui/button";
import { Maximize2, Filter, RotateCcw } from "lucide-react";

const EntityNode = ({ data }: NodeProps<{ label: string; type: string; primary?: boolean }>) => (
  <div
    className={`relative rounded-xl border px-4 py-2.5 shadow-soft transition-all ${
      data.primary
        ? "border-primary/50 bg-gradient-primary text-primary-foreground shadow-glow"
        : "border-border bg-card hover:border-primary/40"
    }`}
  >
    <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-primary/40" />
    <div className={`text-[10px] font-medium uppercase tracking-wider ${data.primary ? "opacity-80" : "text-muted-foreground"}`}>
      {data.type}
    </div>
    <div className="text-sm font-semibold">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-primary/40" />
  </div>
);

const nodeTypes = { entity: EntityNode };

export const GraphView = () => {
  const nodes: Node[] = useMemo(
    () => [
      { id: "1", type: "entity", position: { x: 350, y: 30 }, data: { label: "OpenAI", type: "Organization", primary: true } },
      { id: "2", type: "entity", position: { x: 80, y: 160 }, data: { label: "Sam Altman", type: "Person" } },
      { id: "3", type: "entity", position: { x: 350, y: 200 }, data: { label: "GPT-5", type: "Product" } },
      { id: "4", type: "entity", position: { x: 620, y: 160 }, data: { label: "San Francisco", type: "Location" } },
      { id: "5", type: "entity", position: { x: 350, y: 360 }, data: { label: "Q3 2025", type: "Date" } },
      { id: "6", type: "entity", position: { x: 100, y: 340 }, data: { label: "Anthropic", type: "Organization" } },
      { id: "7", type: "entity", position: { x: 620, y: 340 }, data: { label: "Claude Opus", type: "Product" } },
    ],
    []
  );

  const edges: Edge[] = useMemo(
    () => [
      { id: "e1-2", source: "2", target: "1", label: "leads", animated: true },
      { id: "e1-3", source: "1", target: "3", label: "released", animated: true },
      { id: "e1-4", source: "1", target: "4", label: "located in" },
      { id: "e3-5", source: "3", target: "5", label: "launched" },
      { id: "e6-7", source: "6", target: "7", label: "developed" },
      { id: "e1-6", source: "1", target: "6", label: "competes with", style: { strokeDasharray: "5 5" } },
    ],
    []
  );

  const styledEdges = edges.map((e) => ({
    ...e,
    style: { stroke: "hsl(var(--primary))", strokeWidth: 1.5, ...e.style },
    labelStyle: { fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 },
    labelBgStyle: { fill: "hsl(var(--background))" },
    labelBgPadding: [4, 2] as [number, number],
  }));

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <div>
          <h3 className="font-display text-base font-semibold">Knowledge Graph</h3>
          <p className="text-xs text-muted-foreground">Interactive view — drag nodes, zoom, pan</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-[10px]">
            7 nodes · 6 edges
          </Badge>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <Filter className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="h-[520px] w-full bg-gradient-soft">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="hsl(var(--border))" />
          <Controls className="!rounded-lg !border !border-border !bg-card !shadow-soft [&>button]:!border-border [&>button]:!bg-card" />
        </ReactFlow>
      </div>
    </Card>
  );
};
