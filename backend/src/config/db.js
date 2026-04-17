/**
 * PostgreSQL connection pool.
 *
 * NOTE: This file does NOT eagerly connect on import. The pool is created
 * lazily so the server still boots even if Postgres is unreachable.
 * Call `query()` to actually use the database.
 */

const { Pool } = require("pg");

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST || "localhost",
      port: parseInt(process.env.PGPORT || "5432", 10),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      database: process.env.PGDATABASE || "synapse",
      max: 10,
      idleTimeoutMillis: 30000,
    });

    pool.on("error", (err) => {
      console.error("[pg] unexpected pool error:", err.message);
    });
  }
  return pool;
}

async function query(text, params) {
  const start = Date.now();
  const res = await getPool().query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log("[pg]", { ms: duration, rows: res.rowCount, sql: text.split("\n")[0] });
  }
  return res;
}

module.exports = { getPool, query };
