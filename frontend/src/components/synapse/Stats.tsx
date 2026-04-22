import { Card } from "@/components/ui/card";
import { FileText, Workflow, Sparkles, Database, Loader2 } from "lucide-react";
import { useDocuments, useEntities, useRelationships } from "@/lib/hooks";

export const Stats = () => {
  const docs = useDocuments();
  const ents = useEntities();
  const rels = useRelationships();

  const stats = [
    { label: "Documents",    value: docs.data?.length, icon: FileText, loading: docs.isLoading },
    { label: "Entities",     value: ents.data?.length, icon: Database, loading: ents.isLoading },
    { label: "Relationships",value: rels.data?.length, icon: Workflow, loading: rels.isLoading },
    { label: "LLMs",         value: 4,                 icon: Sparkles, loading: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-border/60 p-4 shadow-soft transition-shadow hover:shadow-elevated">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 font-display text-2xl font-bold tracking-tight">
                {s.loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (s.value ?? "—")}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <s.icon className="h-4 w-4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
