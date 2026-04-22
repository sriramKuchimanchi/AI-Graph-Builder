const { query } = require("../config/db");

exports.list = async (req, res, next) => {
  try {
    const { type, search, limit = 200 } = req.query;
    const params = [req.user.sub];
    const where = ["user_id = $1"];

    if (type) { params.push(type); where.push(`type = $${params.length}`); }
    if (search) { params.push(`%${search.toLowerCase()}%`); where.push(`LOWER(name) LIKE $${params.length}`); }

    params.push(Math.min(parseInt(limit, 10) || 200, 1000));
    const sql = `
      SELECT id, name, type, description, mention_count, properties, created_at
      FROM entities
      WHERE ${where.join(" AND ")}
      ORDER BY mention_count DESC, name ASC
      LIMIT $${params.length}`;

    const { rows } = await query(sql, params);
    res.json({ data: rows });
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, type, description, mention_count, properties, created_at, updated_at
       FROM entities WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.sub]
    );
    if (!rows.length) return res.status(404).json({ error: "Entity not found" });
    res.json({ data: rows[0] });
  } catch (e) { next(e); }
};
