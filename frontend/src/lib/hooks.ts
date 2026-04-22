import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { toast } from "sonner";

export const useHealth = () =>
  useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 15000,
    retry: false,
  });

export const useDocuments = () =>
  useQuery({
    queryKey: ["documents"],
    queryFn: api.documents.list,
    select: (r) => r.data,
    refetchInterval: (query) => {
      const raw = query.state.data as { data: Array<{ status: string }> } | undefined;
      const docs = raw?.data;
      if (!docs) return false;
      const isProcessing = docs.some((d) => d.status === "parsing" || d.status === "extracting");
      return isProcessing ? 2000 : false;
    },
  });

export const useUploadDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.documents.upload(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded — processing started");
      // Poll for 30s after upload to catch the status transitions
      setTimeout(() => qc.invalidateQueries({ queryKey: ["documents"] }), 3000);
      setTimeout(() => qc.invalidateQueries({ queryKey: ["documents"] }), 8000);
      setTimeout(() => qc.invalidateQueries({ queryKey: ["documents"] }), 15000);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.documents.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useEntities = () =>
  useQuery({
    queryKey: ["entities"],
    queryFn: () => api.entities.list({ limit: 200 }),
    select: (r) => r.data,
  });

export const useRelationships = () =>
  useQuery({
    queryKey: ["relationships"],
    queryFn: api.relationships.list,
    select: (r) => r.data,
  });

export const useGraph = () =>
  useQuery({
    queryKey: ["graph"],
    queryFn: api.graph.full,
  });

export const useLLMs = () =>
  useQuery({
    queryKey: ["llms"],
    queryFn: api.orchestrator.listLLMs,
    select: (r) => r.data,
  });

export const useSearch = () =>
  useMutation({
    mutationFn: (q: string) => api.search.query(q),
    onError: (e: Error) => toast.error(e.message),
  });