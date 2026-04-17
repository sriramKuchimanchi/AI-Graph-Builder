const { Router } = require("express");
const c = require("../controllers/graph.controller");

const router = Router();

router.get("/", c.fullGraph);
router.get("/:entityId/neighbors", c.neighbors);

module.exports = router;
