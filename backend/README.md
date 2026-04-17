# Synapse Backend — Node.js + Express + PostgreSQL

Backend for the **AI Knowledge Graph Builder** with JWT auth, document ingest,
graph queries, and a multi-LLM orchestrator stub.

## Quick start

```bash
cd backend
npm install
cp .env.example .env       # edit DB credentials + JWT_SECRET
npm run dev                # http://localhost:4000
```

## Database setup (pgAdmin 4)

1. Right-click **Databases** → **Create → Database…** → name it `synapse`.
2. Right-click `synapse` → **Query Tool**.
3. Open `backend/db/schema.sql`, paste, run (F5).
4. (Optional) Run `backend/db/seed.sql` for demo data.

## Environment variables

| Var                       | Purpose                                 |
|---------------------------|-----------------------------------------|
| `PORT`                    | API port (default 4000)                 |
| `CORS_ORIGIN`             | Frontend origin (default `*`)           |
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Postgres connection |
| `JWT_SECRET`              | **Change this in production**           |
| `JWT_EXPIRES_IN`          | e.g. `7d`                               |
| `RESET_TOKEN_EXPIRES_MIN` | Forgot-password token lifetime          |
| `UPLOAD_DIR`              | Where uploaded files are stored         |
| `MAX_UPLOAD_MB`           | Upload size cap                         |

## API endpoints

### Auth (public)
| Method | Path                          | Body                         |
|--------|-------------------------------|------------------------------|
| POST   | `/api/auth/signup`            | `{ email, password }`        |
| POST   | `/api/auth/signin`            | `{ email, password }`        |
| POST   | `/api/auth/forgot-password`   | `{ email }` → returns token  |
| POST   | `/api/auth/reset-password`    | `{ token, password }`        |
| GET    | `/api/auth/me`                | (Bearer token)               |

### Protected (require `Authorization: Bearer <token>`)
| Method | Path                                | Returns                   |
|--------|-------------------------------------|---------------------------|
| GET    | `/api/documents`                    | All documents             |
| POST   | `/api/documents/upload`             | Multipart upload          |
| DELETE | `/api/documents/:id`                | Delete a document         |
| GET    | `/api/entities?type=&search=`       | Filtered entities         |
| GET    | `/api/relationships`                | All relationships         |
| GET    | `/api/graph`                        | `{nodes, edges}`          |
| GET    | `/api/graph/:entityId/neighbors`    | Neighbors of an entity    |
| POST   | `/api/search`  `{q}`                | Synthesized answer        |
| GET    | `/api/orchestrator/llms`            | LLM registry              |
| POST   | `/api/orchestrator/query` `{prompt}`| Fan-out + synthesizer     |

`/api/health` is open and returns `{status, time}`.

## Notes on the forgot-password flow

For a college demo there's no SMTP. `POST /api/auth/forgot-password` returns
the reset token in the response (`devToken`) so you can copy it into the
`/reset-password` page in the frontend.
