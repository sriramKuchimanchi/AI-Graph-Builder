const { Router } = require("express");
const requireAuth = require("../middleware/auth");
const rateLimit = require("../middleware/rateLimit");
const c = require("../controllers/auth.controller");

const router = Router();

const signupLimiter = rateLimit(15 * 60 * 1000, 5);
const signinLimiter = rateLimit(15 * 60 * 1000, 10);
const pwdLimiter = rateLimit(60 * 60 * 1000, 3);

router.post("/signup", signupLimiter, c.signup);
router.post("/signin", signinLimiter, c.signin);
router.post("/forgot-password", pwdLimiter, c.forgotPassword);
router.post("/reset-password", pwdLimiter, c.resetPassword);
router.get("/me", requireAuth, c.me);

module.exports = router;
