# Synapse — AI Knowledge Graph Builder

A full-stack application that ingests documents, extracts entities and relationships using LLMs, visualizes them as an interactive knowledge graph, and answers natural language queries by synthesizing responses from multiple AI models.

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

- **Document Ingestion** — Upload PDF, DOCX, TXT, and MD files (up to 50 MB)
- **Entity & Relationship Extraction** — LLM-powered extraction via Groq (llama-3.1-8b-instant) with regex fallback
- **Knowledge Graph Visualization** — Interactive graph using React Flow
- **Multi-LLM Orchestration** — Fan-out queries to OpenAI, Anthropic, Google, and Meta models
- **Semantic Search** — Natural language queries synthesized across all enabled LLMs
- **Authentication** — JWT-based sign up, sign in, forgot/reset password flow

---

## Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| TanStack Query v5 | Server state, caching, polling |
| React Flow | Knowledge graph visualization |
| Tailwind CSS + shadcn/ui | Styling and components |
| Sonner | Toast notifications |

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| PostgreSQL (pg) | Primary database |
| pdfjs-dist | PDF text extraction (Node-compatible) |
| mammoth | DOCX text extraction |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| multer | File upload handling |
| Groq API | LLM extraction & search (llama-3.1-8b-instant) |

---

## Project Structure

```
graph-weaver-pro/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── synapse/
│       │   │   ├── AppLayout.tsx        # Main layout wrapper
│       │   │   ├── AppSidebar.tsx       # Navigation sidebar
│       │   │   ├── AuthShell.tsx        # Auth page wrapper
│       │   │   ├── ConnectionStatus.tsx # Backend health indicator
│       │   │   ├── ExtractionPanel.tsx  # Entity/relationship viewer
│       │   │   ├── GraphView.tsx        # React Flow graph
│       │   │   ├── Orchestrator.tsx     # LLM model cards
│       │   │   ├── ProtectedRoute.tsx   # Auth guard
│       │   │   ├── SearchPanel.tsx      # Semantic search UI
│       │   │   ├── Stats.tsx            # Overview stats cards
│       │   │   └── UploadPanel.tsx      # Document upload UI
│       │   └── ui/                      # shadcn/ui components
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
        │   └── db.js                    # PostgreSQL pool
        ├── controllers/
        │   ├── auth.controller.js       # Signup, signin, reset
        │   ├── documents.controller.js  # Upload, list, delete + auto-process
        │   ├── entities.controller.js   # Entity listing
        │   ├── graph.controller.js      # Graph nodes & edges
        │   ├── orchestrator.controller.js # LLM management
        │   ├── processor.controller.js  # Manual reprocess trigger
        │   ├── relationships.controller.js
        │   └── search.controller.js     # Semantic query
        ├── middleware/
        │   ├── auth.js                  # JWT verification
        │   ├── errorHandler.js
        │   ├── rateLimit.js             # In-memory rate limiting
        │   └── upload.js                # Multer config
        ├── routes/
        │   ├── index.js                 # Route aggregator
        │   ├── auth.routes.js
        │   ├── documents.routes.js
        │   ├── entities.routes.js
        │   ├── graph.routes.js
        │   ├── orchestrator.routes.js
        │   ├── processor.routes.js
        │   ├── relationships.routes.js
        │   └── search.routes.js
        └── services/
            ├── extraction.service.js    # PDF parsing + LLM entity extraction
            ├── llm.service.js           # Multi-provider LLM fan-out
            └── synthesizer.service.js  # Weighted-consensus merge
```

---

## Database Schema

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
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

-- Individual LLM responses to queries
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

-- Entity citations for queries
CREATE TABLE query_citations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id        UUID    NOT NULL REFERENCES queries(id)        ON DELETE CASCADE,
    entity_id       UUID    REFERENCES entities(id)               ON DELETE SET NULL,
    relationship_id UUID    REFERENCES relationships(id)          ON DELETE SET NULL,
    chunk_id        UUID    REFERENCES document_chunks(id)        ON DELETE SET NULL,
    rank            INTEGER NOT NULL DEFAULT 0
);

-- Convenience view for graph edges
CREATE VIEW v_graph_edges AS
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

-- Seed default LLM models
INSERT INTO llms (model_id, display_name, provider, enabled, weight) VALUES
    ('gpt-5',           'GPT-5',          'OpenAI',    TRUE,  0.350),
    ('claude-opus-4',   'Claude Opus 4',  'Anthropic', TRUE,  0.300),
    ('gemini-2.5-pro',  'Gemini 2.5 Pro', 'Google',    TRUE,  0.250),
    ('llama-3.1-405b',  'Llama 3.1 405B', 'Meta',      FALSE, 0.100)
ON CONFLICT (model_id) DO NOTHING;

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at     BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_entities_updated_at  BEFORE UPDATE ON entities  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm
- A [Groq API key](https://console.groq.com) (free) for LLM extraction

### 1. Clone and install

```bash
git clone <your-repo-url>
cd graph-weaver-pro

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE synapse;"
psql -U postgres -d synapse -f backend/schema.sql
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values (see below)
```

### 4. Run the app

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Frontend: http://localhost:8080  
Backend API: http://localhost:4000

---

## Environment Variables

Create `backend/.env`:

```env
# Database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=synapse

# Auth
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File uploads
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=50

# Password reset
RESET_TOKEN_EXPIRES_MIN=30

# LLM API keys (all optional — Groq is the free fallback)
GROQ_API_KEY=gsk_...          # Free at console.groq.com — enables LLM extraction
OPENAI_API_KEY=sk-...         # Optional
ANTHROPIC_API_KEY=sk-ant-...  # Optional
GOOGLE_API_KEY=...            # Optional
```

> **Minimum requirement:** Only `GROQ_API_KEY` is needed for full functionality. Without it, extraction falls back to regex patterns which are less accurate.

---

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Register a new user |
| POST | `/auth/signin` | No | Sign in, returns JWT |
| GET | `/auth/me` | Yes | Get current user |
| POST | `/auth/forgot-password` | No | Generate reset token |
| POST | `/auth/reset-password` | No | Reset password with token |

### Documents
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/documents` | Yes | List all documents |
| GET | `/documents/:id` | Yes | Get single document |
| POST | `/documents/upload` | Yes | Upload file (multipart/form-data) |
| DELETE | `/documents/:id` | Yes | Delete document |

### Entities & Graph
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/entities` | Yes | List entities (`?type=&search=&limit=`) |
| GET | `/entities/:id` | Yes | Get single entity |
| GET | `/relationships` | Yes | List relationships |
| GET | `/graph` | Yes | Full graph (nodes + edges) |
| GET | `/graph/:entityId/neighbors` | Yes | Entity neighborhood |

### Search & Orchestrator
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/search` | Yes | Semantic query `{ q: string }` |
| GET | `/orchestrator/llms` | Yes | List registered LLMs |
| POST | `/orchestrator/query` | Yes | Direct LLM fan-out |

### Processor
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/processor/process-queued` | Yes | Manually reprocess queued/failed documents |

---

## Pipeline Overview

```
Upload PDF/DOCX/TXT
        │
        ▼
  documents table (status: queued)
        │
        ▼  (setImmediate — non-blocking)
  extraction.service.js
        │
        ├─ status: parsing  → Read file with pdfjs-dist (PDF) or mammoth (DOCX)
        ├─ status: extracting → Chunk text → call Groq llama-3.1-8b-instant
        │                       for each chunk → parse JSON entities + relationships
        └─ status: indexed  → Store in entities, entity_mentions, relationships tables
                                        │
                                        ▼
                              Graph page (React Flow)
                              Extraction page (entity list)
                              Search page (LLM fan-out + synthesis)
```

---

## Known Issues & Fixes

### Document stuck on "Queued"
The processor wasn't being triggered after upload. Fixed in `documents.controller.js` by calling `processDocument()` via `setImmediate` after the upload response is sent.

### "Install" appearing as entity
`pdf-parse` was failing silently on newer Node.js versions (`DOMMatrix is not defined`) and returning a placeholder string that got parsed as entities. Fixed by switching to `pdfjs-dist` with the legacy ESM build.

### pdfjs-dist worker path on Windows
`require.resolve()` returns a `C:\...` path which Node's ESM loader rejects. Fixed by wrapping with `pathToFileURL(workerPath).href` to produce a valid `file:///C:/...` URL.

### entity_mentions insert missing user_id
The original extraction service inserted entities without `user_id`, violating the `UNIQUE (user_id, name, type)` constraint. Fixed by passing `userId` through to `extractFromDocument()`.

### Excessive polling
`useDocuments` was polling every 2 seconds indefinitely. Fixed to only poll while a document's status is `parsing` or `extracting`, and stop once all are `indexed` or `failed`.