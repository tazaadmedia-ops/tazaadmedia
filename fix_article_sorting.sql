-- Fix article sorting logic: Ensure all published articles have a valid published_at date.
-- This script sets published_at to the original created_at date for any articles where it's currently NULL.

UPDATE articles
SET published_at = created_at
WHERE published_at IS NULL AND status = 'published';

-- Optional: You can also set it for draft articles if you want them to have a 'default' date,
-- but the editor will handle it when they are pushed live.
