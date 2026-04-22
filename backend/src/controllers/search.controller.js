const { query } = require("../config/db");
const synthesizer = require("../services/synthesizer.service");

const callGroqWithContext = async (userQuery, context) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a knowledge graph assistant. Answer the user's question using ONLY the information provided below from their documents. Do not use any external knowledge or make assumptions beyond what is given. If the answer cannot be found in the provided context, say "I couldn't find information about that in your documents."

--- ENTITIES AND RELATIONSHIPS FROM YOUR DOCUMENTS ---
${context.graph}

--- RELEVANT TEXT CHUNKS FROM YOUR DOCUMENTS ---
${context.chunks}

--- USER QUESTION ---
${userQuery}

Answer concisely and only based on the above context:`;

  try {
    const start = Date.now();
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("[search] Groq error:", await response.text());
      return null;
    }

    const data = await response.json();
    return {
      model: "llama-3.1-8b-instant",
      text: data.choices?.[0]?.message?.content || "",
      confidence: 0.85,
      latency_ms: Date.now() - start,
    };
  } catch (e) {
    console.error("[search] Groq call failed:", e.message);
    return null;
  }
};

exports.query = async (req, res, next) => {
  try {
    const { q } = req.body || {};
    if (!q || typeof q !== "string") return res.status(400).json({ error: "Missing 'q'" });

    // 1. Persist the query
    const { rows: [queryRow] } = await query(
      `INSERT INTO queries (user_id, prompt) VALUES ($1, $2) RETURNING id`,
      [req.user.sub, q]
    );

    // 2. Find matching entities (used for citations)
    const { rows: matchedEntities } = await query(
      `SELECT id, name, type
       FROM entities
       WHERE user_id = $1 AND LOWER(name) LIKE '%' || LOWER($2) || '%'
       ORDER BY mention_count DESC
       LIMIT 10`,
      [req.user.sub, q.split(" ")[0] || q]
    );

    // 3. Build graph context — all entities + relationships for this user
    const { rows: entityRows } = await query(
      `SELECT name, type FROM entities WHERE user_id = $1 ORDER BY mention_count DESC LIMIT 100`,
      [req.user.sub]
    );

    const { rows: relRows } = await query(
      `SELECT s.name AS source, r.predicate, t.name AS target
       FROM relationships r
       JOIN entities s ON s.id = r.source_entity_id
       JOIN entities t ON t.id = r.target_entity_id
       WHERE s.user_id = $1
       ORDER BY r.confidence DESC
       LIMIT 100`,
      [req.user.sub]
    );

    const graphContext = [
      "Entities: " + entityRows.map((e) => `${e.name} (${e.type})`).join(", "),
      "",
      "Relationships:",
      ...relRows.map((r) => `  - ${r.source} → ${r.predicate} → ${r.target}`),
    ].join("\n");

    // 4. Pull relevant document chunks (keyword search on content)
    const keywords = q.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    let chunkContext = "";
    if (keywords.length > 0) {
      const likeClause = keywords
        .map((_, i) => `LOWER(dc.content) LIKE '%' || $${i + 2} || '%'`)
        .join(" OR ");

      const { rows: chunkRows } = await query(
        `SELECT dc.content
         FROM document_chunks dc
         JOIN documents d ON d.id = dc.document_id
         WHERE d.user_id = $1 AND (${likeClause})
         ORDER BY dc.chunk_index
         LIMIT 5`,
        [req.user.sub, ...keywords]
      );

      chunkContext = chunkRows.map((c) => c.content).join("\n\n");
    }

    if (!chunkContext) {
      // Fall back to first few chunks of any document
      const { rows: fallbackChunks } = await query(
        `SELECT dc.content
         FROM document_chunks dc
         JOIN documents d ON d.id = dc.document_id
         WHERE d.user_id = $1
         ORDER BY d.created_at DESC, dc.chunk_index ASC
         LIMIT 3`,
        [req.user.sub]
      );
      chunkContext = fallbackChunks.map((c) => c.content).join("\n\n");
    }

    // 5. Call Groq with full document context
    const response = await callGroqWithContext(q, {
      graph: graphContext,
      chunks: chunkContext || "No document content available.",
    });

    const responses = response
      ? [response]
      : [{
          model: "none",
          text: "No GROQ_API_KEY configured. Add it to your .env to enable search.",
          confidence: 0,
          latency_ms: 0,
        }];

    const synthesized = await synthesizer.merge(responses);

    // 6. Persist synthesized answer
    await query(
      `UPDATE queries SET synthesized_answer = $1, confidence = $2, synthesizer_strategy = $3 WHERE id = $4`,
      [synthesized.text, synthesized.confidence, synthesized.strategy, queryRow.id]
    );

    res.json({
      queryId: queryRow.id,
      query: q,
      answer: synthesized.text,
      confidence: synthesized.confidence,
      contributors: synthesized.contributors,
      citations: matchedEntities,
      responses,
    });
  } catch (e) { next(e); }
};