import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, MapPin, Calendar, Tag, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useEntities, useRelationships } from "@/lib/hooks";

const typeIcons: Record<string, React.ElementType> = {
  Organization: Building2,
  Person: User,
  Location: MapPin,
  Product: Tag,
  Date: Calendar,
};

export const ExtractionPanel = () => {
  const entities = useEntities();
  const relationships = useRelationships();

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <h3 className="font-display text-base font-semibold">Extraction Results</h3>
        <p className="text-xs text-muted-foreground">Entities & relationships found across sources</p>
      </div>

      <Tabs defaultValue="entities" className="w-full">
        <div className="px-5 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entities">Entities ({entities.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="relations">Relations ({relationships.data?.length ?? 0})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="entities" className="m-0 px-5 py-4">
          <QueryStates query={entities} emptyText="No entities extracted yet.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {entities.data?.map((e) => {
                const Icon = typeIcons[e.type] ?? HelpCircle;
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5 transition-all hover:border-primary/40 hover:shadow-soft"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{e.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {e.type}
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      ×{e.mention_count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </QueryStates>
        </TabsContent>

        <TabsContent value="relations" className="m-0 px-5 py-4">
          <QueryStates query={relationships} emptyText="No relationships extracted yet.">
            <div className="space-y-2">
              {relationships.data?.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-md bg-primary-soft px-2 py-0.5 font-medium text-primary">
                      {r.source_name}
                    </span>
                    <span className="font-mono text-xs italic text-muted-foreground">— {r.predicate} →</span>
                    <span className="rounded-md bg-primary-soft px-2 py-0.5 font-medium text-primary">
                      {r.target_name}
                    </span>
                  </div>
                  <div className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {(Number(r.confidence) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </QueryStates>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

function QueryStates<T>({
  query,
  emptyText,
  children,
}: {
  query: { isLoading: boolean; isError: boolean; error: unknown; data: T[] | undefined };
  emptyText: string;
  children: React.ReactNode;
}) {
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
        <AlertCircle className="h-4 w-4" />
        Backend unreachable.
      </div>
    );
  }
  if (!query.data?.length) {
    return <div className="py-8 text-center text-sm text-muted-foreground">{emptyText}</div>;
  }
  return <>{children}</>;
}
