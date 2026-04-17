-- =====================================================================
-- Synapse — demo seed data
-- Run this AFTER schema.sql in pgAdmin 4 (Query Tool on the synapse DB).
-- Safe to re-run: clears the demo rows and re-inserts them.
-- =====================================================================

BEGIN;

-- Clear existing demo data (cascades through FKs)
TRUNCATE TABLE
  query_citations,
  llm_responses,
  queries,
  relationships,
  entity_mentions,
  document_chunks,
  documents,
  entities
RESTART IDENTITY CASCADE;

-- ---- Documents ----
INSERT INTO documents (id, name, mime_type, size_bytes, status, page_count) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Quarterly_Report_Q3.pdf',  'application/pdf', 2516582, 'indexed', 24),
  ('22222222-2222-2222-2222-222222222222', 'Research_Notes.docx',      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 831488, 'extracting', 12),
  ('33333333-3333-3333-3333-333333333333', 'Interview_Transcript.txt', 'text/plain',      190464,  'queued',    NULL);

-- ---- Entities ----
INSERT INTO entities (id, name, type, description, mention_count) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'OpenAI',         'Organization', 'AI research and deployment company',         28),
  ('a0000000-0000-0000-0000-000000000002', 'Sam Altman',     'Person',       'CEO of OpenAI',                              19),
  ('a0000000-0000-0000-0000-000000000003', 'San Francisco',  'Location',     'City in California',                         12),
  ('a0000000-0000-0000-0000-000000000004', 'GPT-5',          'Product',      'Flagship multimodal model from OpenAI',      17),
  ('a0000000-0000-0000-0000-000000000005', 'Q3 2025',        'Date',         'Third quarter of 2025',                       9),
  ('a0000000-0000-0000-0000-000000000006', 'Anthropic',      'Organization', 'AI safety company',                          14),
  ('a0000000-0000-0000-0000-000000000007', 'Claude Opus',    'Product',      'Frontier model from Anthropic',              11),
  ('a0000000-0000-0000-0000-000000000008', 'Dario Amodei',   'Person',       'CEO of Anthropic',                            8);

-- ---- Relationships ----
INSERT INTO relationships (source_entity_id, target_entity_id, predicate, confidence, document_id) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'leads',           0.98, '11111111-1111-1111-1111-111111111111'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'released',        0.95, '11111111-1111-1111-1111-111111111111'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'headquartered in',0.92, '11111111-1111-1111-1111-111111111111'),
  ('a0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', 'co-founded',      0.97, '22222222-2222-2222-2222-222222222222'),
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007', 'developed',       0.94, '22222222-2222-2222-2222-222222222222'),
  ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'launched in',     0.88, '11111111-1111-1111-1111-111111111111'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'competes with',   0.81, NULL);

COMMIT;
