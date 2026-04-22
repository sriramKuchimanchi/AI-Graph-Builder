const { query } = require("../config/db");
const llm = require("../services/llm.service");
const synthesizer = require("../services/synthesizer.service");

exports.listLLMs = async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, model_id, display_name, provider, enabled, weight
       FROM llms
       ORDER BY weight DESC`
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
};

exports.toggleLLM = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "'enabled' must be a boolean" });
    }
    const { rows } = await query(
      `UPDATE llms SET enabled = $1 WHERE id = $2
       RETURNING id, model_id, display_name, provider, enabled, weight`,
      [enabled, id]
    );
    if (!rows.length) return res.status(404).json({ error: "LLM not found" });
    res.json({ data: rows[0] });
  } catch (e) { next(e); }
};

exports.query = async (req, res, next) => {
  try {
    const { prompt, models } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing 'prompt'" });

    let modelList = models;
    if (!modelList || !modelList.length) {
      const { rows } = await query(
        `SELECT model_id FROM llms WHERE enabled = TRUE ORDER BY weight DESC`
      );
      modelList = rows.map((r) => r.model_id);
    }

    const responses = await llm.fanOut(prompt, modelList);
    const synthesized = await synthesizer.merge(responses);

    res.json({ prompt, responses, synthesized });
  } catch (e) { next(e); }
};