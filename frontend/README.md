# Synapse — AI Knowledge Graph Builder

Full-stack project: React/Vite frontend + Node/Express + PostgreSQL backend.
Auth (JWT + bcrypt), document upload, entity/relationship extraction,
graph visualization, multi-LLM orchestrator, semantic search.

## Run it

### 1. Database (pgAdmin 4)
- Create a database named `synapse`.
- Run `backend/db/schema.sql` in the Query Tool.
- (Optional) Run `backend/db/seed.sql` for demo data.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env       # edit credentials + JWT_SECRET
npm run dev                # http://localhost:4000
```

### 3. Frontend
```bash
npm install
cp .env.example .env       # optional: override VITE_API_URL
npm run dev                # http://localhost:8080
```

Sign up, then explore: Documents → Extraction → Graph → Orchestrator → Search.

## Env vars

- **Backend** (`backend/.env`): see `backend/.env.example`
- **Frontend** (`.env` in repo root): only `VITE_API_URL` (defaults to `http://localhost:4000`)

## API

See `backend/README.md` for the full endpoint reference.
