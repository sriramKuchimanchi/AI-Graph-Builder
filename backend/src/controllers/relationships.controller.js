// const { query } = require("../config/db");

exports.list = async (_req, res, next) => {
  try {
    res.json({
      data: [
        {
          id: 1,
          source_entity_id: 2,
          target_entity_id: 1,
          predicate: "leads",
          confidence: 0.98,
        },
      ],
    });
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    res.json({ data: { id: req.params.id, predicate: "leads", confidence: 0.98 } });
  } catch (e) { next(e); }
};
