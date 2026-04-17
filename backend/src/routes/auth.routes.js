const { Router } = require("express");
const requireAuth = require("../middleware/auth");
const c = require("../controllers/auth.controller");

const router = Router();

router.post("/signup", c.signup);
router.post("/signin", c.signin);
router.post("/forgot-password", c.forgotPassword);
router.post("/reset-password", c.resetPassword);
router.get("/me", requireAuth, c.me);

module.exports = router;
