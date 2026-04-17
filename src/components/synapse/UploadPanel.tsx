import { useRef, useState } from "react";
import { FileText, Upload, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocuments, useUploadDocument, useDeleteDocument } from "@/lib/hooks";
import type { Document } from "@/lib/api";

const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
};

export const UploadPanel = () => {
  const { data: docs, isLoading, isError, error } = useDocuments();
  const upload = useUploadDocument();
  const remove = useDeleteDocument();
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      await upload.mutateAsync(f).catch(() => {});
    }
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-soft">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <div>
          <h3 className="font-display text-base font-semibold">Document Library</h3>
          <p className="text-xs text-muted-foreground">Ingest sources into the graph</p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {docs?.length ?? 0} files
        </Badge>
      </div>

      <div className="p-5">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
            drag ? "border-primary bg-primary-soft" : "border-border bg-muted/20 hover:border-primary/50 hover:bg-primary-soft/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform group-hover:scale-110">
            {upload.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </div>
          <div className="font-medium">
            {upload.isPending ? "Uploading…" : "Drop files or click to upload"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">PDF, DOCX, TXT, MD up to 50 MB each</div>
        </div>

        <div className="mt-5 space-y-2.5">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4" />
              <div>
                <div className="font-medium">Could not load documents.</div>
                <div className="text-destructive/80">{(error as Error)?.message}</div>
              </div>
            </div>
          )}
          {!isLoading && !isError && docs?.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
              No documents yet. Upload one to get started.
            </div>
          )}
          {docs?.map((doc) => (
            <DocRow key={doc.id} doc={doc} onRemove={() => remove.mutate(doc.id)} />
          ))}
        </div>
      </div>
    </Card>
  );
};

const DocRow = ({ doc, onRemove }: { doc: Document; onRemove: () => void }) => {
  const statusMeta: Record<Document["status"], { label: string; color: string; icon: React.ElementType }> = {
    queued:     { label: "Queued",     color: "text-muted-foreground", icon: Loader2 },
    parsing:    { label: "Parsing",    color: "text-primary",          icon: Loader2 },
    extracting: { label: "Extracting", color: "text-primary",          icon: Loader2 },
    indexed:    { label: "Indexed",    color: "text-emerald-600",      icon: CheckCircle2 },
    failed:     { label: "Failed",     color: "text-destructive",      icon: AlertCircle },
  };
  const meta = statusMeta[doc.status];
  const Icon = meta.icon;

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{doc.name}</span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {formatBytes(doc.size_bytes)}
          </span>
        </div>
        <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium ${meta.color}`}>
          <Icon className={`h-3 w-3 ${doc.status !== "indexed" && doc.status !== "failed" ? "animate-spin" : ""}`} />
          {meta.label}
        </div>
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
