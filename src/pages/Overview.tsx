import { AppLayout } from "@/components/synapse/AppLayout";
import { Stats } from "@/components/synapse/Stats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Upload, ScanSearch, Network, Cpu, Search, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  { title: "Upload documents", desc: "Add PDFs, DOCX, TXT to grow your graph", icon: Upload, to: "/documents", color: "from-indigo-500 to-violet-500" },
  { title: "Review extractions", desc: "Validate entities & relationships", icon: ScanSearch, to: "/extraction" },
  { title: "Open the graph", desc: "Pan, zoom, trace connections", icon: Network, to: "/graph" },
  { title: "Configure LLMs", desc: "Tune models in the orchestrator", icon: Cpu, to: "/orchestrator" },
  { title: "Ask a question", desc: "Synthesized graph search", icon: Search, to: "/search" },
];

const activity = [
  { who: "Synthesizer", what: "merged 3 LLM responses for query #186", when: "just now" },
  { who: "Extractor", what: "indexed Quarterly_Report_Q3.pdf · 142 entities", when: "2m ago" },
  { who: "Orchestrator", what: "routed query to GPT-5, Claude, Gemini", when: "4m ago" },
  { who: "You", what: "uploaded Interview_Transcript.txt", when: "12m ago" },
  { who: "Graph", what: "new edge: OpenAI →released→ GPT-5 (0.95)", when: "18m ago" },
];

const Overview = () => {
  const nav = useNavigate();
  return (
    <AppLayout
      eyebrow="Workspace"
      title="Welcome back"
      description="Your knowledge graph is live. Here's what's happening across documents, extraction, and the orchestrator."
      actions={
        <Button onClick={() => nav("/documents")} className="gap-1.5 shadow-glow">
          <Upload className="h-4 w-4" /> Upload
        </Button>
      }
    >
      <div className="space-y-6">
        <Stats />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 p-5 shadow-soft lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold">Quick actions</h3>
                <p className="text-xs text-muted-foreground">Jump straight into the workflow</p>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {quickActions.map((a) => (
                <button
                  key={a.title}
                  onClick={() => nav(a.to)}
                  className="group flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-soft"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-transform group-hover:scale-110">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      {a.title}
                      <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                    <div className="text-xs text-muted-foreground">{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-border/60 p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold">Activity</h3>
                <p className="text-xs text-muted-foreground">Live workspace events</p>
              </div>
              <Badge variant="secondary" className="gap-1.5 text-[10px]">
                <Activity className="h-3 w-3" /> Live
              </Badge>
            </div>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="relative mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary">
                    {i === 0 && <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs">
                      <span className="font-semibold">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Overview;
