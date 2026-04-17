const synthesizer = require("../services/synthesizer.service");
const llm = require("../services/llm.service");

exports.listLLMs = async (_req, res, next) => {
  try {
    res.json({
      data: [
        { id: "gpt-5", provider: "OpenAI", enabled: true, weight: 0.35 },
        { id: "claude-opus-4", provider: "Anthropic", enabled: true, weight: 0.30 },
        { id: "gemini-2.5-pro", provider: "Google", enabled: true, weight: 0.25 },
        { id: "llama-3.1-405b", provider: "Meta", enabled: false, weight: 0.10 },
      ],
    });
  } catch (e) { next(e); }
};

exports.query = async (req, res, next) => {
  try {
    const { prompt, models } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing 'prompt'" });

    const responses = await llm.fanOut(prompt, models);
    const synthesized = await synthesizer.merge(responses);

    res.json({ prompt, responses, synthesized });
  } catch (e) { next(e); }
};
