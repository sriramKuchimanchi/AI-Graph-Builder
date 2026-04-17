# Synapse Backend (Node.js + Express + PostgreSQL)

Standalone backend scaffold for the **AI Knowledge Graph Builder** project.
This is **not connected** to the frontend — it's a pure skeleton you can run, extend, and wire up yourself.

## Stack

- **Node.js** + **Express** (REST API)
- **PostgreSQL** (via `pg` driver) — managed locally through **pgAdmin 4**
- **Multer** for file uploads
- **dotenv** for config

## Project structure

```
backend/
├── package.json
├── .env.example
├── server.js                 # Entry point
├── src/
│   ├── config/
│   │   └── db.js             # Postgres pool (no auto-connect; lazy)
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── upload.js         # Multer config for document uploads
│   ├── controllers/
│   │   ├── documents.controller.js
│   │   ├── entities.controller.js
│   │   ├── relationships.controller.js
│   │   ├── graph.controller.js
│   │   ├── search.controller.js
│   │   └── orchestrator.controller.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── documents.routes.js
│   │   ├── entities.routes.js
│   │   ├── relationships.routes.js
│   │   ├── graph.routes.js
│   │   ├── search.routes.js
│   │   └── orchestrator.routes.js
│   └── services/
│       ├── extraction.service.js     # Stub: entity/relation extraction
│       ├── llm.service.js            # Stub: per-LLM clients
│       └── synthesizer.service.js    # Stub: merges multi-LLM responses
└── db/
    └── schema.sql            # Run this in pgAdmin 4
```

## Setup

```bash
cd backend
npm install
cp .env.example .env       # then edit DB credentials
npm run dev
```

## Database setup (pgAdmin 4)

1. Open pgAdmin 4 → right-click **Databases** → **Create → Database…** → name it `synapse`.
2. Right-click the new `synapse` database → **Query Tool**.
3. Open `backend/db/schema.sql`, paste the contents, and run it (F5).
4. Confirm the tables appear under `synapse → Schemas → public → Tables`.

## API endpoints (skeleton)

| Method | Path                                | Purpose                              |
|--------|-------------------------------------|--------------------------------------|
| GET    | `/api/health`                       | Service heartbeat                    |
| POST   | `/api/documents/upload`             | Upload a document                    |
| GET    | `/api/documents`                    | List documents                       |
| GET    | `/api/documents/:id`                | Get one document                     |
| DELETE | `/api/documents/:id`                | Delete a document                    |
| GET    | `/api/entities`                     | List extracted entities              |
| GET    | `/api/entities/:id`                 | Get one entity                       |
| GET    | `/api/relationships`                | List extracted relationships         |
| GET    | `/api/graph`                        | Full graph (nodes + edges)           |
| GET    | `/api/graph/:entityId/neighbors`    | Neighbors of an entity               |
| POST   | `/api/search`                       | Semantic / NL query over graph       |
| GET    | `/api/orchestrator/llms`            | List configured LLMs                 |
| POST   | `/api/orchestrator/query`           | Fan-out + synthesize                 |

All controllers currently return mock JSON or `501 Not Implemented` placeholders.
