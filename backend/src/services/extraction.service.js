const fs = require("fs");
const path = require("path");
const { query } = require("../config/db");


const readPdf = async (filePath) => {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { pathToFileURL } = require("url");
  const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
};

const readDocumentFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt" || ext === ".md") {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (ext === ".pdf") {
    try {
      const text = await readPdf(filePath);
      if (text && text.trim().length > 10) {
        console.log(`[extraction] pdfjs extracted ${text.length} chars`);
        return text;
      }
      throw new Error("pdfjs returned empty text");
    } catch (e) {
      throw new Error(`PDF reading failed: ${e.message}. Run: npm install pdfjs-dist`);
    }
  }

  if (ext === ".docx") {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || "";
    } catch {
      throw new Error("Could not read DOCX. Run: npm install mammoth");
    }
  }

  throw new Error(`Unsupported file type: ${ext}`);
};


const callGroqExtract = async (text) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = `Extract all named entities and relationships from the following text.

Return ONLY a valid JSON object in this exact format (no markdown, no explanation):
{
  "entities": [
    {"name": "OpenAI", "type": "Organization"},
    {"name": "Sam Altman", "type": "Person"},
    {"name": "San Francisco", "type": "Location"}
  ],
  "relationships": [
    {"source": "Sam Altman", "target": "OpenAI", "predicate": "is CEO of"},
    {"source": "Microsoft", "target": "OpenAI", "predicate": "partnered with"}
  ]
}

Valid entity types: Person, Organization, Location, Product, Date, Event, Concept, Other

Text:
${text.substring(0, 3000)}`;

  try {
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[extraction] Groq API error:", err);
      return null;
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    console.log(`[extraction] Groq: ${parsed.entities?.length} entities, ${parsed.relationships?.length} rels`);
    return parsed;
  } catch (e) {
    console.error("[extraction] Groq parse error:", e.message);
    return null;
  }
};


const extractWithRegex = (text) => {
  const entities = [];
  const seen = new Set();

  const patterns = [
    { re: /\b(OpenAI|Microsoft|Google|Anthropic|Amazon|Meta|Apple|Facebook|Instagram|Netflix|Tesla|Nvidia|IBM|Intel|Oracle|Salesforce|Adobe|Spotify|Twitter|LinkedIn|AWS|GPT)\b/g, type: "Organization" },
    { re: /\b(San Francisco|New York|Redmond|Mountain View|Seattle|Cupertino|London|Paris|Tokyo|Berlin|Sydney|Toronto|Austin|Boston|Chicago)\b/g, type: "Location" },
    { re: /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, type: "Person" },
  ];

  for (const { re, type } of patterns) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      const name = (match[1] ?? match[0]).trim();
      if (name && name.length > 2 && !seen.has(name)) {
        seen.add(name);
        entities.push({ name, type, confidence: 0.6 });
      }
    }
  }

  return { entities, relationships: [] };
};


const chunkText = (text, chunkSize = 2000) => {
  const chunks = [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  if (!chunks.length && text.trim()) chunks.push(text.trim().substring(0, chunkSize));
  return chunks;
};


exports.extractFromDocument = async (filePath, documentId, userId) => {
  if (!userId) {
    const { rows } = await query(`SELECT user_id FROM documents WHERE id = $1`, [documentId]);
    if (!rows.length) throw new Error(`Document ${documentId} not found`);
    userId = rows[0].user_id;
  }

  const text = await readDocumentFile(filePath);
  console.log(`[extraction] Read ${text.length} chars from ${path.basename(filePath)}`);

  const chunks = chunkText(text);
  console.log(`[extraction] ${chunks.length} chunk(s)`);

  const storedEntities = new Map();
  const mentionsToInsert = [];
  const relationshipsToInsert = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkRes = await query(
      `INSERT INTO document_chunks (document_id, chunk_index, content, token_count)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [documentId, i, chunk, chunk.split(/\s+/).length]
    );
    const chunkId = chunkRes.rows[0].id;

    let extracted = await callGroqExtract(chunk);
    if (!extracted) {
      console.warn(`[extraction] No Groq key — using regex fallback for chunk ${i}`);
      extracted = extractWithRegex(chunk);
    }

    const { entities = [], relationships = [] } = extracted;
    console.log(`[extraction] Chunk ${i}: ${entities.length} entities, ${relationships.length} rels`);

    for (const entity of entities) {
      if (!entity.name || entity.name.length < 2) continue;
      const key = `${entity.type}:${entity.name}`;
      let entityId = storedEntities.get(key);

      if (!entityId) {
        const res = await query(
          `INSERT INTO entities (user_id, name, type, mention_count)
           VALUES ($1, $2, $3, 1)
           ON CONFLICT (user_id, name, type)
           DO UPDATE SET mention_count = entities.mention_count + 1
           RETURNING id`,
          [userId, entity.name, entity.type]
        );
        entityId = res.rows[0].id;
        storedEntities.set(key, entityId);
      }

      mentionsToInsert.push({
        entity_id: entityId,
        chunk_id: chunkId,
        surface_text: entity.name,
        confidence: entity.confidence ?? 0.85,
      });
    }

    for (const rel of relationships) {
      if (!rel.source || !rel.target || !rel.predicate) continue;
      const srcId = [...storedEntities.entries()].find(([k]) => k.endsWith(`:${rel.source}`))?.[1];
      const tgtId = [...storedEntities.entries()].find(([k]) => k.endsWith(`:${rel.target}`))?.[1];

      if (srcId && tgtId && srcId !== tgtId) {
        relationshipsToInsert.push({
          source_entity_id: srcId,
          target_entity_id: tgtId,
          predicate: rel.predicate,
          confidence: 0.85,
          document_id: documentId,
          chunk_id: chunkId,
        });
      }
    }
  }

  for (const m of mentionsToInsert) {
    await query(
      `INSERT INTO entity_mentions (entity_id, chunk_id, surface_text, confidence) VALUES ($1, $2, $3, $4)`,
      [m.entity_id, m.chunk_id, m.surface_text, m.confidence]
    );
  }

  for (const r of relationshipsToInsert) {
    await query(
      `INSERT INTO relationships (source_entity_id, target_entity_id, predicate, confidence, document_id, chunk_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (source_entity_id, target_entity_id, predicate) DO NOTHING`,
      [r.source_entity_id, r.target_entity_id, r.predicate, r.confidence, r.document_id, r.chunk_id]
    );
  }

  console.log(`[extraction] Done: ${storedEntities.size} entities, ${relationshipsToInsert.length} rels`);

  return {
    chunksCreated: chunks.length,
    entitiesFound: storedEntities.size,
    mentionsCreated: mentionsToInsert.length,
    relationshipsCreated: relationshipsToInsert.length,
  };
};