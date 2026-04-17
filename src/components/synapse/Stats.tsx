import { FileText, Workflow, Sparkles, Database } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  { label: "Documents", value: "24", icon: FileText, delta: "+3 today" },
  { label: "Entities", value: "1,284", icon: Database, delta: "+142" },
  { label: "Relations", value: "3,617", icon: Workflow, delta: "+287" },
  { label: "Queries", value: "186", icon: Sparkles, delta: "+24" },
];

export const Stats = () => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    {stats.map((s) => (
      <Card key={s.label} className="border-border/60 p-4 shadow-soft transition-shadow hover:shadow-elevated">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold tracking-tight">{s.value}</div>
            <div className="mt-0.5 text-[10px] font-medium text-primary">{s.delta}</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <s.icon className="h-4 w-4" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);
