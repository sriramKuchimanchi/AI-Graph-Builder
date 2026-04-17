const { query } = require("../config/db");
const llm = require("../services/llm.service");
const synthesizer = require("../services/synthesizer.service");

exports.query = async (req, res, next) => {
  try {
    const { q } = req.body || {};
    if (!q || typeof q !== "string") return res.status(400).json({ error: "Missing 'q'" });

    // 1) Persist the query
    const { rows: [queryRow] } = await query(
      `INSERT INTO queries (prompt) VALUES ($1) RETURNING id`,
      [q]
    );

    // 2) Naive entity match against the graph (substring) — replace with embeddings later
    const { rows: matchedEntities } = await query(
      `SELECT id, name, type
       FROM entities
       WHERE LOWER(name) LIKE '%' || LOWER($1) || '%'
       ORDER BY mention_count DESC
       LIMIT 10`,
      [q.split(" ").slice(0, 1)[0] || q]
    );

    // 3) Fan out to LLMs and synthesize
    const responses = await llm.fanOut(q);
    const synthesized = await synthesizer.merge(responses);

    // 4) Persist synthesized answer
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
