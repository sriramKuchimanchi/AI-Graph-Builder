import { ArrowRight, GitBranch, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-mesh">
      <div className="container relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3.5 py-1.5 text-xs font-medium text-primary">
            <span className="pulse-dot" />
            Multi-LLM orchestration online
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Turn documents into a{" "}
            <span className="text-gradient">living knowledge graph</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Upload anything. Synapse extracts entities, maps relationships, and lets you query
            the graph with natural language — synthesized across multiple LLMs in real time.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 px-6 shadow-glow">
              Start building <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-6">
              Watch demo
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            <FeaturePill icon={Layers} title="Multi-source ingest" desc="PDF, DOCX, TXT, URLs" />
            <FeaturePill icon={GitBranch} title="Auto relationships" desc="Triples, weights, types" />
            <FeaturePill icon={Zap} title="Synthesized answers" desc="GPT, Claude, Gemini" />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturePill = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  </div>
);
