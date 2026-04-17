import { useState } from "react";
import { Search, Sparkles, Quote, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/lib/hooks";

const suggestions = [
  "What products did OpenAI release in 2025?",
  "How are Anthropic and OpenAI connected?",
  "Who leads OpenAI?",
];

export const SearchPanel = () => {
  const [q, setQ] = useState("Who leads OpenAI?");
  const search = useSearch();
  const result = search.data;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    search.mutate(q.trim());
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <h3 className="font-display text-base font-semibold">Semantic Graph Search</h3>
        <p className="text-xs text-muted-foreground">
          Ask in natural language — answers synthesized across all enabled LLMs
        </p>
      </div>

      <div className="p-5">
        <form onSubmit={submit} className="relative">
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
            disabled={search.isPending}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 gap-1.5"
          >
            {search.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Ask
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setQ(s); search.mutate(s); }}
              className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>

        {search.isError && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4" />
            {(search.error as Error).message}
          </div>
        )}

        {result && (
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
                  {result.contributors.length} models · {(result.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{result.answer}</p>

              {result.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Quote className="h-3 w-3" />
                  {result.citations.map((c) => (
                    <span key={c.id} className="font-mono">
                      {c.name} ({c.type})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Individual model outputs
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {result.responses.map((r) => (
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
          </div>
        )}
      </div>
    </Card>
  );
};
