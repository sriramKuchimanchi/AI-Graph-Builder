/**
 * Extraction service — stub.
 * Real implementation would: parse text, run NER / OpenIE or an LLM,
 * produce { entities: [...], relationships: [...] } and persist them.
 */
exports.extractFromText = async (_text) => {
  return { entities: [], relationships: [] };
};

exports.extractFromDocument = async (_documentId) => {
  return { entities: [], relationships: [] };
};
