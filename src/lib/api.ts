// Hardcoded backend URL for local development.
// Run the backend with: `cd backend && npm run dev`
export const API_BASE_URL = "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

// ---------- Types ----------
export type Document = {
  id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number;
  status: "queued" | "parsing" | "extracting" | "indexed" | "failed";
  page_count: number | null;
  created_at: string;
  updated_at: string;
};

export type Entity = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  mention_count: number;
  properties: Record<string, unknown>;
  created_at: string;
};

export type Relationship = {
  id: string;
  predicate: string;
  confidence: number;
  source_entity_id: string;
  source_name: string;
  source_type: string;
  target_entity_id: string;
  target_name: string;
  target_type: string;
  created_at: string;
};

export type GraphNode = { id: string; label: string; type: string; mention_count: number };
export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  predicate: string;
  confidence: number;
};

export type LLM = {
  id: string;
  model_id: string;
  display_name: string;
  provider: string;
  enabled: boolean;
  weight: number;
};

export type LLMResponse = {
  model: string;
  text: string;
  confidence: number;
  latency_ms: number;
};

export type SearchResult = {
  queryId: string;
  query: string;
  answer: string;
  confidence: number;
  contributors: string[];
  citations: Array<{ id: string; name: string; type: string }>;
  responses: LLMResponse[];
};

// ---------- API ----------
export const api = {
  health: () => request<{ status: string; time: string }>("/health"),

  documents: {
    list: () => request<{ data: Document[] }>("/documents"),
    get: (id: string) => request<{ data: Document }>(`/documents/${id}`),
    upload: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      return res.json() as Promise<{ data: Document }>;
    },
    remove: (id: string) =>
      request<{ data: { id: string; deleted: boolean } }>(`/documents/${id}`, {
        method: "DELETE",
      }),
  },

  entities: {
    list: (params?: { type?: string; search?: string; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.type) qs.set("type", params.type);
      if (params?.search) qs.set("search", params.search);
      if (params?.limit) qs.set("limit", String(params.limit));
      const suffix = qs.toString() ? `?${qs}` : "";
      return request<{ data: Entity[] }>(`/entities${suffix}`);
    },
  },

  relationships: {
    list: () => request<{ data: Relationship[] }>("/relationships"),
  },

  graph: {
    full: () => request<{ nodes: GraphNode[]; edges: GraphEdge[] }>("/graph"),
  },

  search: {
    query: (q: string) =>
      request<SearchResult>("/search", {
        method: "POST",
        body: JSON.stringify({ q }),
      }),
  },

  orchestrator: {
    listLLMs: () => request<{ data: LLM[] }>("/orchestrator/llms"),
  },
};
