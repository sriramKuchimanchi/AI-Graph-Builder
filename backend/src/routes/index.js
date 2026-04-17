const { Router } = require("express");

const documents = require("./documents.routes");
const entities = require("./entities.routes");
const relationships = require("./relationships.routes");
const graph = require("./graph.routes");
const search = require("./search.routes");
const orchestrator = require("./orchestrator.routes");

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.use("/documents", documents);
router.use("/entities", entities);
router.use("/relationships", relationships);
router.use("/graph", graph);
router.use("/search", search);
router.use("/orchestrator", orchestrator);

module.exports = router;
