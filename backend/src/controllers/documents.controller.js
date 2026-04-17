/**
 * Documents controller — skeleton.
 * Replace mock responses with `db.query(...)` calls when you're ready.
 */
// const { query } = require("../config/db");

exports.list = async (_req, res, next) => {
  try {
    // const { rows } = await query("SELECT * FROM documents ORDER BY created_at DESC");
    res.json({
      data: [
        { id: 1, name: "sample.pdf", size_bytes: 245678, status: "indexed" },
      ],
    });
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    res.json({ data: { id: req.params.id, name: "sample.pdf", status: "indexed" } });
  } catch (e) { next(e); }
};

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    // TODO: insert into `documents`, enqueue parsing + extraction
    res.status(201).json({
      data: {
        id: null,
        name: req.file.originalname,
        size_bytes: req.file.size,
        path: req.file.path,
        status: "queued",
      },
    });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    // await query("DELETE FROM documents WHERE id = $1", [req.params.id]);
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (e) { next(e); }
};
