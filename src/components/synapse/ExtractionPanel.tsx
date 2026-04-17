import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, MapPin, Calendar, Tag } from "lucide-react";

const entities = [
  { name: "OpenAI", type: "Organization", icon: Building2, count: 28 },
  { name: "Sam Altman", type: "Person", icon: User, count: 19 },
  { name: "San Francisco", type: "Location", icon: MapPin, count: 12 },
  { name: "GPT-5", type: "Product", icon: Tag, count: 17 },
  { name: "Q3 2025", type: "Date", icon: Calendar, count: 9 },
  { name: "Anthropic", type: "Organization", icon: Building2, count: 14 },
  { name: "Claude Opus", type: "Product", icon: Tag, count: 11 },
  { name: "Dario Amodei", type: "Person", icon: User, count: 8 },
];

const relations = [
  { source: "Sam Altman", verb: "leads", target: "OpenAI", confidence: 0.98 },
  { source: "OpenAI", verb: "released", target: "GPT-5", confidence: 0.95 },
  { source: "OpenAI", verb: "headquartered in", target: "San Francisco", confidence: 0.92 },
  { source: "Dario Amodei", verb: "co-founded", target: "Anthropic", confidence: 0.97 },
  { source: "Anthropic", verb: "developed", target: "Claude Opus", confidence: 0.94 },
  { source: "GPT-5", verb: "launched in", target: "Q3 2025", confidence: 0.88 },
];

export const ExtractionPanel = () => {
  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <h3 className="font-display text-base font-semibold">Extraction Results</h3>
        <p className="text-xs text-muted-foreground">Entities & relationships found across sources</p>
      </div>

      <Tabs defaultValue="entities" className="w-full">
        <div className="px-5 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entities">Entities ({entities.length})</TabsTrigger>
            <TabsTrigger value="relations">Relations ({relations.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="entities" className="m-0 px-5 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {entities.map((e) => (
              <div
                key={e.name}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5 transition-all hover:border-primary/40 hover:shadow-soft"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <e.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{e.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {e.type}
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  ×{e.count}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="relations" className="m-0 px-5 py-4">
          <div className="space-y-2">
            {relations.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 font-medium text-primary">
                    {r.source}
                  </span>
                  <span className="font-mono text-xs italic text-muted-foreground">— {r.verb} →</span>
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 font-medium text-primary">
                    {r.target}
                  </span>
                </div>
                <div className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {(r.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
