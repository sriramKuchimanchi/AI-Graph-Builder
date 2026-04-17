# Synapse Backend (Node.js + Express + PostgreSQL)

Standalone backend for the **AI Knowledge Graph Builder**.
Pure Node + Postgres — no Supabase, no Lovable Cloud.

## Quick start

```bash
cd backend
npm install
cp .env.example .env       # edit DB credentials if needed
npm run dev                # starts on http://localhost:4000
```

## Database setup (pgAdmin 4)

1. Open pgAdmin 4 → right-click **Databases** → **Create → Database…** → name it `synapse`.
2. Right-click `synapse` → **Query Tool**.
3. Open `backend/db/schema.sql`, paste the contents, and run it (F5).
4. (Optional) Run `backend/db/seed.sql` for sample data so the frontend has something to display.

## How the connection works

- The backend reads `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` from `.env`.
- `src/config/db.js` creates a lazy `pg` Pool — the server boots even if Postgres is offline.
- All controllers now run **real SQL** against the schema.

## API endpoints

| Method | Path                                | Returns                              |
|--------|-------------------------------------|--------------------------------------|
| GET    | `/api/health`                       | `{status, time}`                     |
| GET    | `/api/documents`                    | All documents                        |
| GET    | `/api/documents/:id`                | One document                         |
| POST   | `/api/documents/upload`             | Inserts a row + saves file to disk   |
| DELETE | `/api/documents/:id`                | Deletes a document                   |
| GET    | `/api/entities?type=&search=`       | Filtered entities                    |
| GET    | `/api/entities/:id`                 | One entity                           |
| GET    | `/api/relationships`                | All relationships (joined w/ names)  |
| GET    | `/api/graph`                        | `{nodes, edges}` for visualization   |
| GET    | `/api/graph/:entityId/neighbors`    | Neighbors of an entity               |
| POST   | `/api/search`  body `{q}`           | NL query → synthesized answer        |
| GET    | `/api/orchestrator/llms`            | LLM registry from DB                 |
| POST   | `/api/orchestrator/query` `{prompt}`| Fan-out + synthesizer                |

## Frontend → Backend

The React app talks to `http://localhost:4000/api/...` (hardcoded in `src/lib/api.ts`).
Run the backend first, then the frontend.

## LLM service

`src/services/llm.service.js` is still a stub that returns deterministic mock responses,
so the orchestrator + synthesizer flow works end-to-end without any API keys.
Drop in real OpenAI / Anthropic / Gemini calls when you're ready.
