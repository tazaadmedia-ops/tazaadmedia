-- Add flag to articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

-- Create live_updates table
CREATE TABLE IF NOT EXISTS live_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    title TEXT,
    content TEXT NOT NULL,
    media_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE
);

-- Add index for efficient retrieval by article
CREATE INDEX IF NOT EXISTS idx_live_updates_article ON live_updates(article_id);
