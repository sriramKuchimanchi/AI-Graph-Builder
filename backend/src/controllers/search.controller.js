// const { query } = require("../config/db");

exports.query = async (req, res, next) => {
  try {
    const { q } = req.body || {};
    if (!q) return res.status(400).json({ error: "Missing 'q'" });

    // TODO: embed q, traverse graph, build context, call orchestrator
    res.json({
      query: q,
      answer: "Stub answer — wire up extraction + orchestrator to populate this.",
      citations: [],
      traversal: [],
    });
  } catch (e) { next(e); }
};
