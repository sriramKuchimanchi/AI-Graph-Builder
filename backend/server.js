require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const routes = require("./src/routes");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve uploaded files (optional, useful for local dev)
app.use(
  "/uploads",
  express.static(path.resolve(process.env.UPLOAD_DIR || "./uploads"))
);

// ---- Routes ----
app.get("/", (_req, res) => {
  res.json({
    name: "Synapse Backend",
    version: "0.1.0",
    docs: "/api",
  });
});

app.use("/api", routes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// ---- Error handler ----
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🧠  Synapse backend running on http://localhost:${PORT}`);
  console.log(`    Health: http://localhost:${PORT}/api/health\n`);
});
