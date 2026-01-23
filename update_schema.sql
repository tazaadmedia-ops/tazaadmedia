-- Run this script in your Supabase SQL Editor to apply the schema changes

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Optional: Add a comment or check constraint
COMMENT ON COLUMN users.username IS 'Mandatory for authors, lowercase, no spaces';
COMMENT ON COLUMN users.social_links IS 'JSON object containing twitter, facebook, instagram, website';
