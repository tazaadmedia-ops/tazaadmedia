-- Add is_pinned column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Optional: Create index for faster sorting on home page
CREATE INDEX IF NOT EXISTS idx_articles_is_pinned ON articles(is_pinned DESC);
