import { useState } from "react";
import { FileText, Upload, X, CheckCircle2, Loader2, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Doc = {
  id: string;
  name: string;
  size: string;
  status: "uploading" | "extracting" | "done";
  progress: number;
  entities?: number;
  relations?: number;
};

const initial: Doc[] = [
  { id: "1", name: "Quarterly_Report_Q3.pdf", size: "2.4 MB", status: "done", progress: 100, entities: 142, relations: 287 },
  { id: "2", name: "Research_Notes.docx", size: "812 KB", status: "extracting", progress: 64 },
  { id: "3", name: "Interview_Transcript.txt", size: "186 KB", status: "uploading", progress: 28 },
];

export const UploadPanel = () => {
  const [docs, setDocs] = useState<Doc[]>(initial);
  const [drag, setDrag] = useState(false);

  const remove = (id: string) => setDocs((d) => d.filter((x) => x.id !== id));

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newDocs: Doc[] = Array.from(files).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      status: "uploading",
      progress: 12,
    }));
    setDocs((d) => [...newDocs, ...d]);
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <div>
          <h3 className="font-display text-base font-semibold">Document Library</h3>
          <p className="text-xs text-muted-foreground">Ingest sources into the graph</p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {docs.length} files
        </Badge>
      </div>

      <div className="p-5">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
            drag
              ? "border-primary bg-primary-soft"
              : "border-border bg-muted/20 hover:border-primary/50 hover:bg-primary-soft/40"
          }`}
        >
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform group-hover:scale-110">
            <Upload className="h-5 w-5" />
          </div>
          <div className="font-medium">Drop files or click to upload</div>
          <div className="mt-1 text-xs text-muted-foreground">
            PDF, DOCX, TXT, MD up to 50 MB each
          </div>
        </label>

        <div className="mt-5 space-y-2.5">
          {docs.map((doc) => (
            <DocRow key={doc.id} doc={doc} onRemove={() => remove(doc.id)} />
          ))}
        </div>
      </div>
    </Card>
  );
};

const DocRow = ({ doc, onRemove }: { doc: Doc; onRemove: () => void }) => {
  const statusMeta = {
    uploading: { label: "Uploading", color: "text-muted-foreground" },
    extracting: { label: "Extracting", color: "text-primary" },
    done: { label: "Indexed", color: "text-emerald-600" },
  }[doc.status];

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
        <FileText className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{doc.name}</span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{doc.size}</span>
        </div>

        {doc.status === "done" ? (
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" /> Indexed
            </span>
            <span>{doc.entities} entities</span>
            <span>{doc.relations} relations</span>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={doc.progress} className="h-1" />
            <span className={`shrink-0 text-[10px] font-medium ${statusMeta.color}`}>
              <Loader2 className="mr-1 inline h-2.5 w-2.5 animate-spin" />
              {statusMeta.label} {doc.progress}%
            </span>
          </div>
        )}
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onRemove}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
