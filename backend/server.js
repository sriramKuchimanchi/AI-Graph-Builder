require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const routes = require("./src/routes");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  "/uploads",
  express.static(path.resolve(process.env.UPLOAD_DIR || "./uploads"))
);

app.get("/", (_req, res) => {
  res.json({ name: "Synapse Backend", version: "1.0.0", docs: "/api" });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Synapse backend running on http://localhost:${PORT}`);
});
