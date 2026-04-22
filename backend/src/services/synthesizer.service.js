exports.merge = async (responses = []) => {
  if (!responses.length) return { text: "", confidence: 0, contributors: [] };

  const totalConfidence = responses.reduce((sum, r) => sum + (r.confidence || 0), 0);
  const avgConfidence = responses.length ? totalConfidence / responses.length : 0;

  const topResponses = [...responses]
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 3);

  const baseResponse = topResponses[0];
  const otherModels = topResponses.slice(1).map((r) => r.model);

  let mergedText = baseResponse.text;
  if (otherModels.length > 0) {
    mergedText += `\n\n[Also considered: ${otherModels.join(", ")}]`;
  }

  return {
    text: mergedText,
    confidence: Math.min(avgConfidence, 0.95),
    contributors: responses.map((r) => r.model),
    strategy: "weighted-consensus",
  };
};
