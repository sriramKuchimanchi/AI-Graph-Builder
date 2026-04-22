const { query } = require("../config/db");
const { processDocument } = require("./documents.controller");
const fs = require("fs");

exports.processQueuedDocuments = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT d.id, d.storage_path, d.user_id
       FROM documents d
       WHERE d.status IN ('queued', 'failed')`
    );

    if (!rows.length) return res.json({ processed: 0, results: [] });

    res.json({ processing: rows.length, message: "Processing started in background" });

    for (const doc of rows) {
      if (!fs.existsSync(doc.storage_path)) {
        await query(
          `UPDATE documents SET status = 'failed', error_message = 'File missing on disk', updated_at = NOW() WHERE id = $1`,
          [doc.id]
        );
        continue;
      }
      processDocument(doc.id, doc.storage_path, doc.user_id);
    }
  } catch (e) { next(e); }
};