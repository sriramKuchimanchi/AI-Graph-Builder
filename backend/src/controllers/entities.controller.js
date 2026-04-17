// const { query } = require("../config/db");

exports.list = async (_req, res, next) => {
  try {
    // const { rows } = await query("SELECT * FROM entities ORDER BY name");
    res.json({
      data: [
        { id: 1, name: "OpenAI", type: "Organization", mention_count: 28 },
        { id: 2, name: "Sam Altman", type: "Person", mention_count: 19 },
      ],
    });
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try {
    res.json({ data: { id: req.params.id, name: "OpenAI", type: "Organization" } });
  } catch (e) { next(e); }
};
