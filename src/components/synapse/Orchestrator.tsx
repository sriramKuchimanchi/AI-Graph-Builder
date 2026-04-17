import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Cpu, Sparkles, Brain, Zap, GitMerge } from "lucide-react";

const llms = [
  { name: "GPT-5", provider: "OpenAI", icon: Sparkles, latency: "1.2s", status: "active", weight: 0.35 },
  { name: "Claude Opus 4", provider: "Anthropic", icon: Brain, latency: "1.8s", status: "active", weight: 0.30 },
  { name: "Gemini 2.5 Pro", provider: "Google", icon: Zap, latency: "0.9s", status: "active", weight: 0.25 },
  { name: "Llama 3.1 405B", provider: "Meta", icon: Cpu, latency: "2.4s", status: "idle", weight: 0.10 },
];

export const Orchestrator = () => {
  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <div>
          <h3 className="font-display text-base font-semibold">LLM Orchestrator</h3>
          <p className="text-xs text-muted-foreground">Route, fan-out, and synthesize responses</p>
        </div>
        <Badge className="gap-1.5 bg-primary-soft text-primary hover:bg-primary-soft">
          <span className="pulse-dot" /> Online
        </Badge>
      </div>

      <div className="space-y-3 p-5">
        {llms.map((llm) => (
          <div
            key={llm.name}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <llm.icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{llm.name}</span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {llm.provider}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                <span>~{llm.latency}</span>
                <span>weight {llm.weight.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <Switch defaultChecked={llm.status === "active"} />
              <span
                className={`text-[10px] font-medium uppercase tracking-wider ${
                  llm.status === "active" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {llm.status}
              </span>
            </div>
          </div>
        ))}

        <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary-soft/60 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <GitMerge className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Synthesizer</div>
            <div className="text-xs text-muted-foreground">
              Reconciles outputs · weighted consensus + citation fusion
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">v2.1</Badge>
        </div>
      </div>
    </Card>
  );
};
