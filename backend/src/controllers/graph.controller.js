const { query } = require("../config/db");

exports.fullGraph = async (_req, res, next) => {
  try {
    const [{ rows: nodes }, { rows: edges }] = await Promise.all([
      query(
        `SELECT id, name AS label, type, mention_count
         FROM entities
         ORDER BY mention_count DESC
         LIMIT 500`
      ),
      query(
        `SELECT id, source_entity_id AS source, target_entity_id AS target, predicate, confidence
         FROM relationships
         ORDER BY confidence DESC NULLS LAST
         LIMIT 1000`
      ),
    ]);

    res.json({ nodes, edges });
  } catch (e) { next(e); }
};

exports.neighbors = async (req, res, next) => {
  try {
    const { entityId } = req.params;
    const { rows } = await query(
      `SELECT
         r.id AS edge_id,
         r.predicate,
         r.confidence,
         CASE WHEN r.source_entity_id = $1 THEN r.target_entity_id ELSE r.source_entity_id END AS neighbor_id,
         CASE WHEN r.source_entity_id = $1 THEN t.name ELSE s.name END AS neighbor_name,
         CASE WHEN r.source_entity_id = $1 THEN t.type ELSE s.type END AS neighbor_type,
         CASE WHEN r.source_entity_id = $1 THEN 'outgoing' ELSE 'incoming' END AS direction
       FROM relationships r
       JOIN entities s ON s.id = r.source_entity_id
       JOIN entities t ON t.id = r.target_entity_id
       WHERE r.source_entity_id = $1 OR r.target_entity_id = $1
       ORDER BY r.confidence DESC NULLS LAST
       LIMIT 100`,
      [entityId]
    );
    res.json({ entityId, neighbors: rows });
  } catch (e) { next(e); }
};
