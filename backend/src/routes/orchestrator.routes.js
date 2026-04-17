const { Router } = require("express");
const c = require("../controllers/orchestrator.controller");

const router = Router();

router.get("/llms", c.listLLMs);
router.post("/query", c.query);

module.exports = router;
