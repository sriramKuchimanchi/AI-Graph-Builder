import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Cpu, Sparkles, Brain, Zap, GitMerge, Loader2, AlertCircle } from "lucide-react";
import { useLLMs } from "@/lib/hooks";

const providerIcon: Record<string, React.ElementType> = {
  OpenAI: Sparkles,
  Anthropic: Brain,
  Google: Zap,
  Meta: Cpu,
};

export const Orchestrator = () => {
  const { data: llms, isLoading, isError } = useLLMs();

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <div>
          <h3 className="font-display text-base font-semibold">LLM Orchestrator</h3>
          <p className="text-xs text-muted-foreground">Models registered in the database</p>
        </div>
        <Badge className="gap-1.5 bg-primary-soft text-primary hover:bg-primary-soft">
          <span className="pulse-dot" /> Online
        </Badge>
      </div>

      <div className="space-y-3 p-5">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading models…
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4" />
            Backend unreachable. Start it with <code className="font-mono">cd backend && npm run dev</code>.
          </div>
        )}

        {llms?.map((llm) => {
          const Icon = providerIcon[llm.provider] ?? Cpu;
          return (
            <div
              key={llm.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{llm.display_name}</span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {llm.provider}
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                  <span>{llm.model_id}</span>
                  <span>weight {Number(llm.weight).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Switch defaultChecked={llm.enabled} />
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider ${
                    llm.enabled ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {llm.enabled ? "active" : "idle"}
                </span>
              </div>
            </div>
          );
        })}

        <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary-soft/60 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <GitMerge className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Synthesizer</div>
            <div className="text-xs text-muted-foreground">
              Reconciles outputs · weighted-consensus strategy
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">v0.1</Badge>
        </div>
      </div>
    </Card>
  );
};
