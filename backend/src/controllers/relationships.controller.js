const { query } = require("../config/db");

exports.list = async (req, res, next) => {
  try {
    const { limit = 200 } = req.query;
    const { rows } = await query(
      `SELECT
         r.id, r.predicate, r.confidence,
         r.source_entity_id, s.name AS source_name, s.type AS source_type,
         r.target_entity_id, t.name AS target_name, t.type AS target_type,
         r.created_at
       FROM relationships r
       JOIN entities s ON s.id = r.source_entity_id
       JOIN entities t ON t.id = r.target_entity_id
       ORDER BY r.confidence DESC NULLS LAST, r.created_at DESC
       LIMIT $1`,
      [Math.min(parseInt(limit, 10) || 200, 1000)]
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM v_graph_edges WHERE edge_id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Relationship not found" });
    res.json({ data: rows[0] });
  } catch (e) { next(e); }
};
