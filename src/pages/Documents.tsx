import { AppLayout } from "@/components/synapse/AppLayout";
import { UploadPanel } from "@/components/synapse/UploadPanel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Globe, Mic, FolderInput } from "lucide-react";

const sources = [
  { icon: FileText, name: "PDF / DOCX / TXT", desc: "Drag & drop files", active: true },
  { icon: Globe, name: "Web URL", desc: "Crawl & ingest a page" },
  { icon: Mic, name: "Audio / Video", desc: "Transcribe then index" },
  { icon: FolderInput, name: "Bulk import", desc: "Connect a folder or S3" },
];

const Documents = () => (
  <AppLayout
    eyebrow="Step 1"
    title="Documents"
    description="Ingest sources from anywhere. Files are queued, parsed, and chunked before extraction."
  >
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <UploadPanel />
      </div>
      <div className="space-y-4">
        <Card className="border-border/60 p-5 shadow-soft">
          <h3 className="mb-3 font-display text-base font-semibold">Source types</h3>
          <div className="space-y-2">
            {sources.map((s) => (
              <div
                key={s.name}
                className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                  s.active
                    ? "border-primary/40 bg-primary-soft/40"
                    : "border-border/60 bg-card hover:border-primary/30"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                </div>
                {s.active && <Badge className="bg-primary text-[10px] text-primary-foreground">Active</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/60 p-5 shadow-soft">
          <h3 className="mb-2 font-display text-base font-semibold">Pipeline</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Each document flows through a 4-stage pipeline before it lands on the graph.
          </p>
          <ol className="space-y-3">
            {["Parse & chunk", "Embed", "Entity & relation extract", "Merge into graph"].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  </AppLayout>
);

export default Documents;
