const { query } = require("../config/db");
const extraction = require("../services/extraction.service");
const fs = require("fs");

exports.list = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, mime_type, size_bytes, status, page_count, created_at, updated_at
       FROM documents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.sub]
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, mime_type, size_bytes, status, page_count, storage_path, error_message, created_at, updated_at
       FROM documents WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.sub]
    );
    if (!rows.length) return res.status(404).json({ error: "Document not found" });
    res.json({ data: rows[0] });
  } catch (e) { next(e); }
};

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { originalname, mimetype, size, path } = req.file;

    // Delete all previous data for this user — documents, entities, relationships, chunks
    const { rows: existing } = await query(
      `SELECT id, storage_path FROM documents WHERE user_id = $1`,
      [req.user.sub]
    );

    // Delete physical files from disk
    for (const doc of existing) {
      if (doc.storage_path && fs.existsSync(doc.storage_path)) {
        try { fs.unlinkSync(doc.storage_path); } catch (_) {}
      }
    }

    if (existing.length > 0) {
      // Explicitly wipe all extracted data for this user in dependency order
      // (entities has no direct document FK so CASCADE alone won't clean it)
      await query(
        `DELETE FROM entity_mentions
          WHERE chunk_id IN (
            SELECT dc.id FROM document_chunks dc
            JOIN documents d ON d.id = dc.document_id
            WHERE d.user_id = $1
          )`,
        [req.user.sub]
      );
      await query(
        `DELETE FROM relationships
          WHERE source_entity_id IN (
            SELECT id FROM entities WHERE user_id = $1
          )`,
        [req.user.sub]
      );
      await query(`DELETE FROM entities WHERE user_id = $1`, [req.user.sub]);
      await query(`DELETE FROM documents WHERE user_id = $1`, [req.user.sub]);
    }

    // Insert new document record
    const { rows } = await query(
      `INSERT INTO documents (user_id, name, mime_type, size_bytes, storage_path, status)
       VALUES ($1, $2, $3, $4, $5, 'queued')
       RETURNING id, name, mime_type, size_bytes, status, created_at`,
      [req.user.sub, originalname, mimetype, size, path]
    );

    const doc = rows[0];

    // Return immediately so the client isn't waiting, then process async
    res.status(201).json({ data: doc });

    // Trigger extraction in the background (don't await in request cycle)
    setImmediate(() => processDocument(doc.id, path, req.user.sub));

  } catch (e) { next(e); }
};

// Separated so it can also be called from the processor controller
async function processDocument(docId, filePath, userId) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    await query(
      `UPDATE documents SET status = 'parsing', updated_at = NOW() WHERE id = $1`,
      [docId]
    );

    await query(
      `UPDATE documents SET status = 'extracting', updated_at = NOW() WHERE id = $1`,
      [docId]
    );

    await extraction.extractFromDocument(filePath, docId, userId);

    await query(
      `UPDATE documents SET status = 'indexed', updated_at = NOW() WHERE id = $1`,
      [docId]
    );
  } catch (err) {
    console.error(`[processor] doc ${docId} failed:`, err.message);
    await query(
      `UPDATE documents SET status = 'failed', error_message = $2, updated_at = NOW() WHERE id = $1`,
      [docId, String(err.message).substring(0, 500)]
    ).catch(() => {});
  }
}

exports.processDocument = processDocument;

exports.remove = async (req, res, next) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM documents WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.sub]
    );
    if (!rowCount) return res.status(404).json({ error: "Document not found" });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (e) { next(e); }
};