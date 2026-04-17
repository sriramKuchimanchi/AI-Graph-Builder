export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const TOKEN_KEY = "synapse.token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api${path}`, { ...init, headers });

  if (res.status === 401) {
    tokenStore.clear();
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export type AuthUser = { id: string; email: string; created_at: string };

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

export const api = {
  health: () => request<{ status: string; time: string }>("/health"),

  auth: {
    signup: (email: string, password: string) =>
      request<{ user: AuthUser; token: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    signin: (email: string, password: string) =>
      request<{ user: AuthUser; token: string }>("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: AuthUser }>("/auth/me"),
    forgotPassword: (email: string) =>
      request<{ ok: boolean; message: string; devToken?: string; expiresInMinutes?: number }>(
        "/auth/forgot-password",
        { method: "POST", body: JSON.stringify({ email }) }
      ),
    resetPassword: (token: string, password: string) =>
      request<{ ok: boolean }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      }),
  },

  documents: {
    list: () => request<{ data: Document[] }>("/documents"),
    get: (id: string) => request<{ data: Document }>(`/documents/${id}`),
    upload: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const token = tokenStore.get();
      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
