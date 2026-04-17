exports.merge = async (responses = []) => {
  if (!responses.length) return { text: "", confidence: 0, contributors: [] };
  const best = [...responses].sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
  return {
    text: best.text,
    confidence: best.confidence,
    contributors: responses.map((r) => r.model),
    strategy: "weighted-consensus",
  };
};
