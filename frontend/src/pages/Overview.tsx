import { AppLayout } from "@/components/synapse/AppLayout";
import { Stats } from "@/components/synapse/Stats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, ScanSearch, Network, Cpu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const pipeline = [
  { step: 1, title: "Upload documents", desc: "Add PDFs, DOCX, or TXT files to ingest", icon: Upload, to: "/documents" },
  { step: 2, title: "Extract entities & relations", desc: "Review what was found across sources", icon: ScanSearch, to: "/extraction" },
  { step: 3, title: "Visualize the graph", desc: "Explore connections interactively", icon: Network, to: "/graph" },
  { step: 4, title: "Configure orchestrator", desc: "Enable LLMs and tune the synthesizer", icon: Cpu, to: "/orchestrator" },
  { step: 5, title: "Query in natural language", desc: "Ask questions, get synthesized answers", icon: Search, to: "/search" },
];

const Overview = () => {
  const nav = useNavigate();
  return (
    <AppLayout
      eyebrow="Project"
      title="AI Knowledge Graph Builder"
      description="Upload documents, extract entities and relationships, visualize the graph, and query it with multiple LLMs synthesized into a single answer."
    >
      <div className="space-y-8">
        <Stats />

        <Card className="border-border/60 p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Pipeline</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Each stage of the system, in order. Click any step to jump in.
          </p>

          <div className="mt-5 space-y-2">
            {pipeline.map((p) => (
              <button
                key={p.step}
                onClick={() => nav(p.to)}
                className="group flex w-full items-center gap-4 rounded-lg border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-soft"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-sm font-bold text-primary">
                  {p.step}
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <p.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => nav("/documents")} className="gap-1.5 shadow-glow">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Overview;
