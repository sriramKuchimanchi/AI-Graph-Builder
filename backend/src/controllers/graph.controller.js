// const { query } = require("../config/db");

exports.fullGraph = async (_req, res, next) => {
  try {
    res.json({
      nodes: [
        { id: 1, label: "OpenAI", type: "Organization" },
        { id: 2, label: "Sam Altman", type: "Person" },
        { id: 3, label: "GPT-5", type: "Product" },
      ],
      edges: [
        { id: 1, source: 2, target: 1, predicate: "leads", confidence: 0.98 },
        { id: 2, source: 1, target: 3, predicate: "released", confidence: 0.95 },
      ],
    });
  } catch (e) { next(e); }
};

exports.neighbors = async (req, res, next) => {
  try {
    res.json({
      entityId: req.params.entityId,
      neighbors: [{ id: 3, label: "GPT-5", predicate: "released" }],
    });
  } catch (e) { next(e); }
};
