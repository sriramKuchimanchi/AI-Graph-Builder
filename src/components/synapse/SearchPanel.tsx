import { useState } from "react";
import { Search, Sparkles, ArrowRight, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const suggestions = [
  "What products did OpenAI release in 2025?",
  "How are Anthropic and OpenAI connected?",
  "Who leads the top AI labs?",
];

const llmResponses = [
  { model: "GPT-5", text: "OpenAI released GPT-5 in Q3 2025, focused on multimodal reasoning.", confidence: 0.92 },
  { model: "Claude Opus", text: "GPT-5 was the headline 2025 launch from OpenAI, alongside infra upgrades.", confidence: 0.88 },
  { model: "Gemini 2.5", text: "Per ingested docs, OpenAI shipped GPT-5 in Q3 2025.", confidence: 0.90 },
];

export const SearchPanel = () => {
  const [q, setQ] = useState("What products did OpenAI release in 2025?");
  const [showResult, setShowResult] = useState(true);

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <h3 className="font-display text-base font-semibold">Semantic Graph Search</h3>
        <p className="text-xs text-muted-foreground">
          Ask in natural language — answers synthesized across all enabled LLMs
        </p>
      </div>

      <div className="p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowResult(true);
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask anything about your knowledge graph…"
            className="h-12 pl-11 pr-32 text-sm shadow-soft"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> Ask
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>

        {showResult && (
          <div className="mt-6 animate-fade-in-up space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary-soft/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Synthesized Answer
                </div>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  3/3 models agree
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                In <span className="font-semibold text-primary">Q3 2025</span>, OpenAI publicly released{" "}
                <span className="font-semibold text-primary">GPT-5</span>, its flagship multimodal model.
                The launch was traced to 4 source documents and corroborated by all three active LLMs
                with a mean confidence of <span className="font-mono">90%</span>.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                <Quote className="h-3 w-3" />
                <span className="font-mono">Quarterly_Report_Q3.pdf · p.4</span>
                <span>·</span>
                <span className="font-mono">Research_Notes.docx · §2</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Individual model outputs
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                {llmResponses.map((r) => (
                  <div
                    key={r.model}
                    className="rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold">{r.model}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {(r.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              View graph traversal path <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
