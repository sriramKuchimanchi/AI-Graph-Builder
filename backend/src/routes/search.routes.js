const { Router } = require("express");
const c = require("../controllers/search.controller");

const router = Router();

router.post("/", c.query);

module.exports = router;
