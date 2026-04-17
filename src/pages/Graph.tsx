import { AppLayout } from "@/components/synapse/AppLayout";
import { GraphView } from "@/components/synapse/GraphView";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, User, MapPin, Calendar, Tag } from "lucide-react";

const legend = [
  { type: "Organization", icon: Building2 },
  { type: "Person", icon: User },
  { type: "Location", icon: MapPin },
  { type: "Product", icon: Tag },
  { type: "Date", icon: Calendar },
];

const Graph = () => (
  <AppLayout
    eyebrow="Step 3"
    title="Knowledge Graph"
    description="A live, queryable map of every entity and relationship discovered across your corpus."
    actions={
      <Button size="sm" variant="outline">
        Export GraphML
      </Button>
    }
  >
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3">
        <GraphView />
      </div>

      <div className="space-y-4">
        <Card className="border-border/60 p-5 shadow-soft">
          <h3 className="mb-3 font-display text-base font-semibold">Legend</h3>
          <div className="space-y-2">
            {legend.map((l) => (
              <div key={l.type} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <l.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium">{l.type}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 p-5 shadow-soft">
          <h3 className="mb-2 font-display text-base font-semibold">Graph stats</h3>
          <div className="space-y-2.5">
            {[
              ["Nodes", "1,284"],
              ["Edges", "3,617"],
              ["Avg degree", "5.6"],
              ["Components", "7"],
              ["Density", "0.004"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                <span className="text-xs text-muted-foreground">{k}</span>
                <span className="font-mono text-sm font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 p-5 shadow-soft">
          <Badge className="mb-2 bg-primary-soft text-primary hover:bg-primary-soft">Tip</Badge>
          <p className="text-xs text-muted-foreground">
            Drag nodes to rearrange. Use the controls to fit, zoom, and lock the layout.
          </p>
        </Card>
      </div>
    </div>
  </AppLayout>
);

export default Graph;
