const { Router } = require("express");
const requireAuth = require("../middleware/auth");

const auth = require("./auth.routes");
const documents = require("./documents.routes");
const entities = require("./entities.routes");
const relationships = require("./relationships.routes");
const graph = require("./graph.routes");
const search = require("./search.routes");
const orchestrator = require("./orchestrator.routes");
const processor = require("./processor.routes");

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.use("/auth", auth);

router.use("/documents", requireAuth, documents);
router.use("/entities", requireAuth, entities);
router.use("/relationships", requireAuth, relationships);
router.use("/graph", requireAuth, graph);
router.use("/search", requireAuth, search);

router.use("/orchestrator", requireAuth, orchestrator);
router.use("/processor", requireAuth, processor);

module.exports = router;
