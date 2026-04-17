import { AppLayout } from "@/components/synapse/AppLayout";
import { ExtractionPanel } from "@/components/synapse/ExtractionPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";

const breakdown = [
  { type: "Person", count: 47, pct: 22 },
  { type: "Organization", count: 68, pct: 32 },
  { type: "Location", count: 31, pct: 15 },
  { type: "Product", count: 38, pct: 18 },
  { type: "Date", count: 28, pct: 13 },
];

const Extraction = () => (
  <AppLayout
    eyebrow="Step 2"
    title="Extraction"
    description="Review entities and relationships extracted from your sources. Confidence-scored, deduplicated, ready for the graph."
    actions={
      <>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" /> Filter
        </Button>
        <Button size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export JSON
        </Button>
      </>
    }
  >
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ExtractionPanel />
      </div>

      <Card className="border-border/60 p-5 shadow-soft">
        <h3 className="mb-1 font-display text-base font-semibold">Entity breakdown</h3>
        <p className="mb-4 text-xs text-muted-foreground">Distribution across all sources</p>
        <div className="space-y-3">
          {breakdown.map((b) => (
            <div key={b.type}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium">{b.type}</span>
                <span className="font-mono text-xs text-muted-foreground">{b.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-primary"
                  style={{ width: `${b.pct * 3}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-primary/30 bg-primary-soft/40 p-3">
          <div className="font-display text-2xl font-bold text-primary">94.2%</div>
          <div className="text-[11px] text-muted-foreground">
            Mean extraction confidence across 1,284 entities
          </div>
        </div>
      </Card>
    </div>
  </AppLayout>
);

export default Extraction;
