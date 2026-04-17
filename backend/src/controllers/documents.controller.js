const { query } = require("../config/db");

exports.list = async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, mime_type, size_bytes, status, page_count, created_at, updated_at
       FROM documents
       ORDER BY created_at DESC`
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, mime_type, size_bytes, status, page_count, storage_path, error_message, created_at, updated_at
       FROM documents WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Document not found" });
    res.json({ data: rows[0] });
  } catch (e) { next(e); }
};

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { originalname, mimetype, size, path } = req.file;

    const { rows } = await query(
      `INSERT INTO documents (name, mime_type, size_bytes, storage_path, status)
       VALUES ($1, $2, $3, $4, 'queued')
       RETURNING id, name, mime_type, size_bytes, status, created_at`,
      [originalname, mimetype, size, path]
    );

    res.status(201).json({ data: rows[0] });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const { rowCount } = await query(`DELETE FROM documents WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Document not found" });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (e) { next(e); }
};
