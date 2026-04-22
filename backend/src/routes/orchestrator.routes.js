const { Router } = require("express");
const c = require("../controllers/orchestrator.controller");

const router = Router();

router.get("/llms", c.listLLMs);
router.patch("/llms/:id", c.toggleLLM);
router.post("/query", c.query);

module.exports = router;