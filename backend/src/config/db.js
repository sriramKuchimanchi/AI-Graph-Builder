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
    pool.on("error", (err) => console.error("[pg] pool error:", err.message));
  }
  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

module.exports = { getPool, query };
