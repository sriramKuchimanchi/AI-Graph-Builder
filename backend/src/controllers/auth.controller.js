const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(u) {
  return { id: u.id, email: u.email, created_at: u.created_at };
}

exports.signup = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Valid email required" });
    if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
    if (existing.rowCount) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email.toLowerCase(), hash]
    );

    const token = signToken(rows[0]);
    res.status(201).json({ user: publicUser(rows[0]), token });
  } catch (e) { next(e); }
};

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const { rows } = await query(
      `SELECT id, email, password_hash, created_at FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(rows[0]);
    res.json({ user: publicUser(rows[0]), token });
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, email, created_at FROM users WHERE id = $1`,
      [req.user.sub]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(rows[0]) });
  } catch (e) { next(e); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });

    const { rows } = await query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    const response = { ok: true, message: "If that email exists, a reset link has been generated." };

    if (!rows.length) return res.json(response);

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const minutes = parseInt(process.env.RESET_TOKEN_EXPIRES_MIN || "30", 10);

    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)`,
      [rows[0].id, tokenHash, String(minutes)]
    );

    // For a college demo we return the token directly so there's no SMTP needed.
    res.json({ ...response, devToken: token, expiresInMinutes: minutes });
  } catch (e) { next(e); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: "Token and new password required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const { rows } = await query(
      `SELECT id, user_id, expires_at, used_at
         FROM password_resets WHERE token_hash = $1`,
      [tokenHash]
    );
    if (!rows.length) return res.status(400).json({ error: "Invalid token" });

    const reset = rows[0];
    if (reset.used_at) return res.status(400).json({ error: "Token already used" });
    if (new Date(reset.expires_at) < new Date()) return res.status(400).json({ error: "Token expired" });

    const hash = await bcrypt.hash(password, 10);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, reset.user_id]);
    await query(`UPDATE password_resets SET used_at = NOW() WHERE id = $1`, [reset.id]);

    res.json({ ok: true });
  } catch (e) { next(e); }
};
