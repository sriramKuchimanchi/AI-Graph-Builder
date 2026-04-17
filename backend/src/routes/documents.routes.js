const { Router } = require("express");
const upload = require("../middleware/upload");
const c = require("../controllers/documents.controller");

const router = Router();

router.get("/", c.list);
router.get("/:id", c.getOne);
router.post("/upload", upload.single("file"), c.upload);
router.delete("/:id", c.remove);

module.exports = router;
