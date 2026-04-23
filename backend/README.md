# Synapse — AI Knowledge Graph Builder

A full-stack application that ingests documents, extracts entities and relationships using LLMs, visualizes them as an interactive knowledge graph, and answers natural language queries grounded in your document content.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Pipeline Overview](#pipeline-overview)
- [Known Issues & Fixes](#known-issues--fixes)

---

## Features

- **Document Ingestion** — Upload PDF, DOCX, TXT, or MD files (up to 50 MB). Each new upload automatically replaces all previous data.
- **LLM Entity & Relationship Extraction** — Uses Groq (llama-3.1-8b-instant) to extract named entities and relationships from document chunks. Falls back to regex if no API key is set.
- **Knowledge Graph Visualization** — Interactive dagre-layout graph with color-coded entity types, minimap, zoom controls, and working fullscreen.
- **Document-Grounded Search** — Natural language queries answered using only the content from your uploaded documents. The LLM is given your graph and document chunks as context.
- **LLM Orchestrator** — Toggle models on/off. Changes persist to the database.
- **Authentication** — JWT-based sign up, sign in, forgot/reset password flow.

---

## Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| TanStack Query v5 | Server state, caching, polling |
| React Flow + @dagrejs/dagre | Knowledge graph visualization with automatic layout |
| Tailwind CSS + shadcn/ui | Styling and components |
| Sonner | Toast notifications |

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| PostgreSQL (pg) | Primary database |
| pdfjs-dist | PDF text extraction (Node/Windows compatible) |
| mammoth | DOCX text extraction |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| multer | File upload handling |
| Groq API (llama-3.1-8b-instant) | Entity extraction + document-grounded search |

---

## Project Structure

```
graph-weaver-pro/
├── frontend/
│   └── src/
│       ├── components/
│       │   └── synapse/
│       │       ├── AppLayout.tsx        # Main layout wrapper
│       │       ├── AppSidebar.tsx       # Navigation sidebar
│       │       ├── AuthShell.tsx        # Auth page wrapper
│       │       ├── ConnectionStatus.tsx # Backend health indicator
│       │       ├── ExtractionPanel.tsx  # Entity/relationship viewer
│       │       ├── GraphView.tsx        # React Flow + dagre graph
│       │       ├── Orchestrator.tsx     # LLM model cards with working toggle
│       │       ├── ProtectedRoute.tsx   # Auth guard
│       │       ├── SearchPanel.tsx      # Semantic search UI
│       │       ├── Stats.tsx            # Overview stats cards
│       │       └── UploadPanel.tsx      # Document upload UI
│       ├── lib/
│       │   ├── api.ts                   # All API calls
│       │   ├── auth.tsx                 # Auth context & provider
│       │   ├── hooks.ts                 # TanStack Query hooks
│       │   └── utils.ts                 # cn() helper
│       └── pages/
│           ├── Overview.tsx
│           ├── Documents.tsx
│           ├── Extraction.tsx
│           ├── Graph.tsx
│           ├── OrchestratorPage.tsx
│           ├── SearchPage.tsx
│           ├── SignIn.tsx
│           ├── SignUp.tsx
│           ├── ForgotPassword.tsx
│           └── ResetPassword.tsx
│
└── backend/
    └── src/
        ├── config/
        │   └── db.js                       # PostgreSQL pool
        ├── controllers/
        │   ├── auth.controller.js           # Signup, signin, reset
        │   ├── documents.controller.js      # Upload (auto-clears previous data), list, delete
        │   ├── entities.controller.js       # Entity listing
        │   ├── graph.controller.js          # Graph nodes & edges (filtered by user)
        │   ├── orchestrator.controller.js   # LLM listing + toggle
        │   ├── processor.controller.js      # Manual reprocess trigger
        │   ├── relationships.controller.js
        │   └── search.controller.js         # Document-grounded semantic query
        ├── middleware/
        │   ├── auth.js                      # JWT verification
        │   ├── errorHandler.js
        │   ├── rateLimit.js                 # In-memory rate limiting
        │   └── upload.js                    # Multer config
        ├── routes/
        │   ├── index.js
        │   ├── auth.routes.js
        │   ├── documents.routes.js
        │   ├── entities.routes.js
        │   ├── graph.routes.js
        │   ├── orchestrator.routes.js       # Includes PATCH /llms/:id
        │   ├── processor.routes.js
        │   ├── relationships.routes.js
        │   └── search.routes.js
        └── services/
            ├── extraction.service.js        # pdfjs-dist PDF parsing + Groq entity extraction
            ├── llm.service.js               # Multi-provider LLM fan-out with Groq fallback
            └── synthesizer.service.js       # Weighted-consensus merge
```

---

## Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE document_status AS ENUM ('queued', 'parsing', 'extracting', 'indexed', 'failed');
CREATE TYPE entity_type     AS ENUM ('Person', 'Organization', 'Location', 'Product', 'Date', 'Event', 'Concept', 'Other');
CREATE TYPE llm_provider    AS ENUM ('OpenAI', 'Anthropic', 'Google', 'Meta', 'Other');

-- Users
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Password reset tokens
CREATE TABLE password_resets (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT        NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Uploaded documents
CREATE TABLE documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          TEXT            NOT NULL,
    mime_type     TEXT,
    size_bytes    BIGINT          NOT NULL DEFAULT 0,
    storage_path  TEXT,
    status        document_status NOT NULL DEFAULT 'queued',
    error_message TEXT,
    page_count    INTEGER,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_documents_user_id    ON documents(user_id);
CREATE INDEX idx_documents_status     ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Text chunks extracted from documents
CREATE TABLE document_chunks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID    NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content     TEXT    NOT NULL,
    page_number INTEGER,
    token_count INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (document_id, chunk_index)
);
CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);

-- Named entities extracted from chunks
CREATE TABLE entities (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          TEXT        NOT NULL,
    type          entity_type NOT NULL DEFAULT 'Other',
    description   TEXT,
    mention_count INTEGER     NOT NULL DEFAULT 0,
    properties    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name, type)
);
CREATE INDEX idx_entities_user_id    ON entities(user_id);
CREATE INDEX idx_entities_type       ON entities(type);
CREATE INDEX idx_entities_name_lower ON entities(LOWER(name));

-- Entity occurrences within chunks
CREATE TABLE entity_mentions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id    UUID         NOT NULL REFERENCES entities(id)        ON DELETE CASCADE,
    chunk_id     UUID         NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    surface_text TEXT         NOT NULL,
    char_start   INTEGER,
    char_end     INTEGER,
    confidence   NUMERIC(4,3) NOT NULL DEFAULT 0.0 CHECK (confidence BETWEEN 0 AND 1),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mentions_entity_id ON entity_mentions(entity_id);
CREATE INDEX idx_mentions_chunk_id  ON entity_mentions(chunk_id);

-- Relationships between entities
CREATE TABLE relationships (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id UUID         NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id UUID         NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    predicate        TEXT         NOT NULL,
    confidence       NUMERIC(4,3) NOT NULL DEFAULT 0.0 CHECK (confidence BETWEEN 0 AND 1),
    document_id      UUID         REFERENCES documents(id)       ON DELETE SET NULL,
    chunk_id         UUID         REFERENCES document_chunks(id) ON DELETE SET NULL,
    properties       JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CHECK (source_entity_id <> target_entity_id),
    UNIQUE (source_entity_id, target_entity_id, predicate)
);
CREATE INDEX idx_rel_source    ON relationships(source_entity_id);
CREATE INDEX idx_rel_target    ON relationships(target_entity_id);
CREATE INDEX idx_rel_predicate ON relationships(predicate);

-- Registered LLM models
CREATE TABLE llms (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id     TEXT         NOT NULL UNIQUE,
    display_name TEXT         NOT NULL,
    provider     llm_provider NOT NULL,
    enabled      BOOLEAN      NOT NULL DEFAULT TRUE,
    weight       NUMERIC(4,3) NOT NULL DEFAULT 0.250 CHECK (weight BETWEEN 0 AND 1),
    config       JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- User search queries
CREATE TABLE queries (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt               TEXT         NOT NULL,
    synthesized_answer   TEXT,
    synthesizer_strategy TEXT         DEFAULT 'weighted-consensus',
    confidence           NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_queries_user_id    ON queries(user_id);
CREATE INDEX idx_queries_created_at ON queries(created_at DESC);

-- Individual LLM responses per query
CREATE TABLE llm_responses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id      UUID         NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    llm_id        UUID         NOT NULL REFERENCES llms(id),
    response_text TEXT         NOT NULL,
    confidence    NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    latency_ms    INTEGER,
    raw           JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (query_id, llm_id)
);
CREATE INDEX idx_llm_responses_query_id ON llm_responses(query_id);

-- Entity citations for queries
CREATE TABLE query_citations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id        UUID    NOT NULL REFERENCES queries(id)        ON DELETE CASCADE,
    entity_id       UUID    REFERENCES entities(id)               ON DELETE SET NULL,
    relationship_id UUID    REFERENCES relationships(id)          ON DELETE SET NULL,
    chunk_id        UUID    REFERENCES document_chunks(id)        ON DELETE SET NULL,
    rank            INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_citations_query_id ON query_citations(query_id);

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at     BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_entities_updated_at  BEFORE UPDATE ON entities  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Convenience view for graph edges
CREATE OR REPLACE VIEW v_graph_edges AS
SELECT
    r.id              AS edge_id,
    r.source_entity_id,
    s.name            AS source_name,
    s.type            AS source_type,
    r.target_entity_id,
    t.name            AS target_name,
    t.type            AS target_type,
    r.predicate,
    r.confidence
FROM relationships r
JOIN entities s ON s.id = r.source_entity_id
JOIN entities t ON t.id = r.target_entity_id;

-- Seed LLM (only Groq is used — free, no setup required beyond API key)
INSERT INTO llms (model_id, display_name, provider, enabled, weight)
VALUES ('llama-3.1-8b-instant', 'Llama 3.1 8B Instant', 'Meta', TRUE, 1.0)
ON CONFLICT (model_id) DO NOTHING;
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A free [Groq API key](https://console.groq.com)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd graph-weaver-pro

cd backend && npm install
cd ../frontend && npm install
```

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE synapse;"
psql -U postgres -d synapse -f backend/schema.sql
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — see Environment Variables below
```

### 4. Run

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Frontend: http://localhost:8080  
Backend: http://localhost:4000

---

## Environment Variables

`backend/.env`:

```env
# Database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=synapse

# Auth
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=7d

# File uploads
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=50

# Password reset
RESET_TOKEN_EXPIRES_MIN=30

# LLM — only GROQ_API_KEY is required for full functionality
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=      # optional
ANTHROPIC_API_KEY=   # optional
GOOGLE_API_KEY=      # optional
```

---

## API Reference

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Register |
| POST | `/auth/signin` | No | Sign in, returns JWT |
| GET | `/auth/me` | Yes | Current user |
| POST | `/auth/forgot-password` | No | Generate reset token |
| POST | `/auth/reset-password` | No | Reset with token |

### Documents
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/documents` | Yes | List documents |
| GET | `/documents/:id` | Yes | Get one |
| POST | `/documents/upload` | Yes | Upload — auto-deletes previous data |
| DELETE | `/documents/:id` | Yes | Delete one |

### Entities & Graph
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/entities` | Yes | List (`?type=&search=&limit=`) |
| GET | `/entities/:id` | Yes | Get one |
| GET | `/relationships` | Yes | List relationships |
| GET | `/graph` | Yes | Full graph (nodes + edges, user-scoped) |
| GET | `/graph/:entityId/neighbors` | Yes | Neighbors of an entity |

### Search & Orchestrator
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/search` | Yes | Document-grounded query `{ q: string }` |
| GET | `/orchestrator/llms` | Yes | List models |
| PATCH | `/orchestrator/llms/:id` | Yes | Toggle enabled `{ enabled: boolean }` |
| POST | `/orchestrator/query` | Yes | Direct LLM fan-out |

### Processor
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/processor/process-queued` | Yes | Reprocess queued/failed documents |

---

## Pipeline Overview

```
Upload PDF / DOCX / TXT
        │
        ▼
  Delete all previous data for this user
  (entity_mentions → relationships → entities → documents)
        │
        ▼
  Insert new document row (status: queued)
        │
        ▼  setImmediate — non-blocking
  extraction.service.js
        │
        ├─ status: parsing    → Read file (pdfjs-dist for PDF, mammoth for DOCX)
        ├─ status: extracting → Chunk text (2000 chars) →
        │                       call Groq llama-3.1-8b-instant per chunk →
        │                       parse JSON { entities, relationships } →
        │                       store in entities + relationships tables
        └─ status: indexed    → Done
                │
                ▼
      Graph page   — dagre layout, color-coded by type, fullscreen
      Extraction   — entity + relationship counts
      Search       — LLM answers grounded in your document chunks + graph
```

---

## Resetting All Data

To wipe everything and start fresh, run in pgAdmin or psql:

```sql
DELETE FROM entity_mentions;
DELETE FROM relationships;
DELETE FROM entities;
DELETE FROM document_chunks;
DELETE FROM documents;
```

Then re-upload your document.

---

## Known Issues & Fixes Applied

| Issue | Fix |
|---|---|
| Document stuck on "Queued" | `upload` handler now calls `processDocument()` via `setImmediate` after responding |
| "Install" appearing as entity | `pdf-parse` fails silently on Node 18+ (`DOMMatrix` missing); switched to `pdfjs-dist` legacy ESM build |
| pdfjs worker path on Windows | `require.resolve()` returns `C:\...`; fixed with `pathToFileURL(workerPath).href` |
| `user_id` missing from entity inserts | `extractFromDocument` now accepts and passes `userId` to all DB inserts |
| Old entities persisting after new upload | Upload now explicitly deletes `entity_mentions → relationships → entities → documents` in order before inserting |
| Graph not filtered by user | `graph.controller.js` now adds `WHERE user_id = $1` to both nodes and edges queries |
| Search using external knowledge | `search.controller.js` now builds graph context + chunk context and passes it to the LLM prompt |
| LLM toggle not persisting | Added `PATCH /orchestrator/llms/:id` endpoint; `Orchestrator.tsx` calls it on switch change |
| Excessive document polling | `useDocuments` only polls every 2s when status is `parsing` or `extracting`, stops otherwise |
| Graph node overlap | Replaced custom force simulation with `@dagrejs/dagre` for guaranteed non-overlapping layout |
| Fullscreen button broken | Replaced React Flow `<Controls>` with custom buttons; fullscreen calls `requestFullscreen()` on the canvas div directly |