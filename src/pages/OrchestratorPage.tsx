import { AppLayout } from "@/components/synapse/AppLayout";
import { Orchestrator } from "@/components/synapse/Orchestrator";
import { Card } from "@/components/ui/card";
import { GitMerge, Scale, Shuffle, ShieldCheck } from "lucide-react";

const strategies = [
  { name: "Weighted consensus", icon: Scale, desc: "Average per-token confidence weighted by model reliability", active: true },
  { name: "Majority vote", icon: Shuffle, desc: "Pick the answer that the most models converge on" },
  { name: "Cite-and-verify", icon: ShieldCheck, desc: "Re-grounds every claim against source docs" },
];

const OrchestratorPage = () => (
  <AppLayout
    eyebrow="Step 4"
    title="Orchestrator"
    description="Fan queries out across multiple LLMs, then synthesize their outputs into a single trustworthy answer."
  >
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Orchestrator />
      </div>

      <Card className="border-border/60 p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold">Synthesis strategy</h3>
            <p className="text-xs text-muted-foreground">How to reconcile models</p>
          </div>
        </div>

        <div className="space-y-2">
          {strategies.map((s) => (
            <button
              key={s.name}
              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                s.active
                  ? "border-primary/50 bg-primary-soft/50"
                  : "border-border/60 bg-card hover:border-primary/40"
              }`}
            >
              <s.icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.active ? "text-primary" : "text-muted-foreground"}`} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <span className="text-primary">∑</span> answer = Σ (wᵢ · response_i)
          <br />
          <span className="text-primary">where</span> Σ wᵢ = 1.0
        </div>
      </Card>
    </div>
  </AppLayout>
);

export default OrchestratorPage;
