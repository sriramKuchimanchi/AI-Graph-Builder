
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('queued', 'parsing', 'extracting', 'indexed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE entity_type AS ENUM ('Person', 'Organization', 'Location', 'Product', 'Date', 'Event', 'Concept', 'Other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE llm_provider AS ENUM ('OpenAI', 'Anthropic', 'Google', 'Meta', 'Other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

CREATE TABLE IF NOT EXISTS password_resets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT        NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);


CREATE TABLE IF NOT EXISTS documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT        NOT NULL,
    mime_type       TEXT,
    size_bytes      BIGINT      NOT NULL DEFAULT 0,
    storage_path    TEXT,
    status          document_status NOT NULL DEFAULT 'queued',
    error_message   TEXT,
    page_count      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id    ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status     ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

CREATE TABLE IF NOT EXISTS document_chunks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index     INTEGER     NOT NULL,
    content         TEXT        NOT NULL,
    page_number     INTEGER,
    token_count     INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);


CREATE TABLE IF NOT EXISTS entities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT        NOT NULL,
    type            entity_type NOT NULL DEFAULT 'Other',
    description     TEXT,
    mention_count   INTEGER     NOT NULL DEFAULT 0,
    properties      JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name, type)
);

CREATE INDEX IF NOT EXISTS idx_entities_user_id     ON entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_type        ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_name_lower  ON entities(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_entities_properties  ON entities USING GIN (properties);

CREATE TABLE IF NOT EXISTS entity_mentions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id       UUID        NOT NULL REFERENCES entities(id)        ON DELETE CASCADE,
    chunk_id        UUID        NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    surface_text    TEXT        NOT NULL,
    char_start      INTEGER,
    char_end        INTEGER,
    confidence      NUMERIC(4,3) NOT NULL DEFAULT 0.0 CHECK (confidence BETWEEN 0 AND 1),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentions_entity_id ON entity_mentions(entity_id);
CREATE INDEX IF NOT EXISTS idx_mentions_chunk_id  ON entity_mentions(chunk_id);


CREATE TABLE IF NOT EXISTS relationships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id    UUID        NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id    UUID        NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    predicate           TEXT        NOT NULL,
    confidence          NUMERIC(4,3) NOT NULL DEFAULT 0.0 CHECK (confidence BETWEEN 0 AND 1),
    document_id         UUID        REFERENCES documents(id) ON DELETE SET NULL,
    chunk_id            UUID        REFERENCES document_chunks(id) ON DELETE SET NULL,
    properties          JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (source_entity_id <> target_entity_id),
    UNIQUE (source_entity_id, target_entity_id, predicate)
);

CREATE INDEX IF NOT EXISTS idx_rel_source    ON relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_rel_target    ON relationships(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_rel_predicate ON relationships(predicate);


CREATE TABLE IF NOT EXISTS llms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id        TEXT        NOT NULL UNIQUE,
    display_name    TEXT        NOT NULL,
    provider        llm_provider NOT NULL,
    enabled         BOOLEAN     NOT NULL DEFAULT TRUE,
    weight          NUMERIC(4,3) NOT NULL DEFAULT 0.250 CHECK (weight BETWEEN 0 AND 1),
    config          JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS queries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt              TEXT        NOT NULL,
    synthesized_answer  TEXT,
    synthesizer_strategy TEXT       DEFAULT 'weighted-consensus',
    confidence          NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queries_user_id    ON queries(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);

CREATE TABLE IF NOT EXISTS llm_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id        UUID        NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    llm_id          UUID        NOT NULL REFERENCES llms(id),
    response_text   TEXT        NOT NULL,
    confidence      NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    latency_ms      INTEGER,
    raw             JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (query_id, llm_id)
);

CREATE INDEX IF NOT EXISTS idx_llm_responses_query_id ON llm_responses(query_id);

CREATE TABLE IF NOT EXISTS query_citations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id        UUID        NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    entity_id       UUID        REFERENCES entities(id) ON DELETE SET NULL,
    relationship_id UUID        REFERENCES relationships(id) ON DELETE SET NULL,
    chunk_id        UUID        REFERENCES document_chunks(id) ON DELETE SET NULL,
    rank            INTEGER     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_citations_query_id ON query_citations(query_id);


CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_entities_updated_at ON entities;
CREATE TRIGGER trg_entities_updated_at
BEFORE UPDATE ON entities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE OR REPLACE VIEW v_graph_edges AS
SELECT
    r.id              AS edge_id,
    r.source_entity_id,
    s.name            AS source_name,
    s.type            AS source_type,
    r.target_entity_id,
    t.name            AS target_name,
    t.type            AS target_type,
    r.predicate,
    r.confidence
FROM relationships r
JOIN entities s ON s.id = r.source_entity_id
JOIN entities t ON t.id = r.target_entity_id;


INSERT INTO llms (model_id, display_name, provider, enabled, weight) VALUES
    ('gpt-5',           'GPT-5',          'OpenAI',    TRUE,  0.350),
    ('claude-opus-4',   'Claude Opus 4',  'Anthropic', TRUE,  0.300),
    ('gemini-2.5-pro',  'Gemini 2.5 Pro', 'Google',    TRUE,  0.250),
    ('llama-3.1-405b',  'Llama 3.1 405B', 'Meta',      FALSE, 0.100)
ON CONFLICT (model_id) DO NOTHING;
