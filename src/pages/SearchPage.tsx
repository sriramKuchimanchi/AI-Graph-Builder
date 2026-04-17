import { AppLayout } from "@/components/synapse/AppLayout";
import { SearchPanel } from "@/components/synapse/SearchPanel";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

const recent = [
  "What products did OpenAI release in 2025?",
  "How are Anthropic and OpenAI connected?",
  "Who leads the top AI labs?",
  "Summarize Q3 financial highlights",
  "List all locations mentioned in interviews",
];

const SearchPage = () => (
  <AppLayout
    eyebrow="Step 5"
    title="Semantic Search"
    description="Ask anything in natural language. Synapse traverses the graph and synthesizes answers across all enabled LLMs."
  >
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3">
        <SearchPanel />
      </div>

      <Card className="border-border/60 p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-semibold">Recent queries</h3>
        </div>
        <div className="space-y-1.5">
          {recent.map((q) => (
            <button
              key={q}
              className="w-full rounded-md border border-border/60 bg-card px-2.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft/40 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </Card>
    </div>
  </AppLayout>
);

export default SearchPage;
