const { query } = require("../config/db");
const llm = require("../services/llm.service");
const synthesizer = require("../services/synthesizer.service");

exports.query = async (req, res, next) => {
  try {
    const { q } = req.body || {};
    if (!q || typeof q !== "string") return res.status(400).json({ error: "Missing 'q'" });

    const { rows: [queryRow] } = await query(
      `INSERT INTO queries (user_id, prompt) VALUES ($1, $2) RETURNING id`,
      [req.user.sub, q]
    );

    const { rows: matchedEntities } = await query(
      `SELECT id, name, type
       FROM entities
       WHERE user_id = $1 AND LOWER(name) LIKE '%' || LOWER($2) || '%'
       ORDER BY mention_count DESC
       LIMIT 10`,
      [req.user.sub, q.split(" ").slice(0, 1)[0] || q]
    );

    const responses = await llm.fanOut(q);
    const synthesized = await synthesizer.merge(responses);

    await query(
      `UPDATE queries
       SET synthesized_answer = $1, confidence = $2, synthesizer_strategy = $3
       WHERE id = $4`,
      [synthesized.text, synthesized.confidence, synthesized.strategy, queryRow.id]
    );

    res.json({
      queryId: queryRow.id,
      query: q,
      answer: synthesized.text,
      confidence: synthesized.confidence,
      contributors: synthesized.contributors,
      citations: matchedEntities,
      responses,
    });
  } catch (e) { next(e); }
};
