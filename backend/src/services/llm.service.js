/**
 * LLM service — stub.
 * `fanOut` would call each enabled LLM in parallel and return their raw responses.
 */
exports.fanOut = async (prompt, models = ["gpt-5", "claude-opus-4", "gemini-2.5-pro"]) => {
  return models.map((m) => ({
    model: m,
    text: `[stub response from ${m}] for prompt: ${prompt}`,
    confidence: 0.9,
    latency_ms: 0,
  }));
};
