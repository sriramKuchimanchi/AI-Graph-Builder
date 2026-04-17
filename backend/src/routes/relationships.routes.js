const { Router } = require("express");
const c = require("../controllers/relationships.controller");

const router = Router();

router.get("/", c.list);
router.get("/:id", c.getOne);

module.exports = router;
