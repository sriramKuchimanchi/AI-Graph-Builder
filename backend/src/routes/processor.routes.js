const { Router } = require("express");
const requireAuth = require("../middleware/auth");
const processor = require("../controllers/processor.controller");

const router = Router();

router.post("/process-queued", requireAuth, processor.processQueuedDocuments);

module.exports = router;
