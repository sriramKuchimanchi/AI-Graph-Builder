const { query } = require("../config/db");



const callOpenAI = async (prompt, model) => {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const start = Date.now();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      model,
      text: data.choices?.[0]?.message?.content || "",
      confidence: 0.85,
      latency_ms: Date.now() - start,
    };
  } catch (e) {
    console.error("[llm] OpenAI error:", e.message);
    return null;
  }
};

const callAnthropic = async (prompt, model) => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const start = Date.now();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      model,
      text: data.content?.[0]?.text || "",
      confidence: 0.85,
      latency_ms: Date.now() - start,
    };
  } catch (e) {
    console.error("[llm] Anthropic error:", e.message);
    return null;
  }
};

const callGoogle = async (prompt, model) => {
  if (!process.env.GOOGLE_API_KEY) return null;
  try {
    const start = Date.now();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500 },
        }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      model,
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      confidence: 0.85,
      latency_ms: Date.now() - start,
    };
  } catch (e) {
    console.error("[llm] Google error:", e.message);
    return null;
  }
};

const callGroq = async (prompt, model = "llama-3.1-8b-instant") => {
  if (!process.env.GROQ_API_KEY) return null;
  try {
    const start = Date.now();
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.error("[llm] Groq error response:", err);
      return null;
    }
    const data = await response.json();
    return {
      model,
      text: data.choices?.[0]?.message?.content || "",
      confidence: 0.80,
      latency_ms: Date.now() - start,
    };
  } catch (e) {
    console.error("[llm] Groq error:", e.message);
    return null;
  }
};


const dispatchModel = async (prompt, modelId) => {
  if (modelId.includes("gpt"))              return callOpenAI(prompt, modelId);
  if (modelId.includes("claude"))           return callAnthropic(prompt, modelId);
  if (modelId.includes("gemini"))           return callGoogle(prompt, modelId);
  if (modelId.includes("llama") || modelId.includes("groq")) return callGroq(prompt, modelId);
  return null;
};


exports.fanOut = async (prompt, models = []) => {
  if (!models.length) {
    const { rows } = await query(
      `SELECT model_id FROM llms WHERE enabled = TRUE ORDER BY weight DESC`
    );
    models = rows.map((r) => r.model_id);
  }

  const responses = [];

  await Promise.all(
    models.map(async (modelId) => {
      const result = await dispatchModel(prompt, modelId);
      if (result) responses.push(result);
    })
  );

  if (!responses.length) {
    console.warn("[llm] All configured models failed — trying Groq llama-3.1-8b-instant");
    const groqResult = await callGroq(prompt, "llama-3.1-8b-instant");
    if (groqResult) {
      responses.push(groqResult);
    } else {
      responses.push({
        model: "none",
        text: `No LLM API keys configured. Add GROQ_API_KEY to your .env for a free fallback (llama-3.1-8b-instant). Prompt was: "${prompt.substring(0, 120)}"`,
        confidence: 0,
        latency_ms: 0,
      });
    }
  }

  return responses;
};