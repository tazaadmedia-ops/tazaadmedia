-- Migration: Add featured_image_caption to articles
ALTER TABLE articles ADD COLUMN featured_image_caption TEXT;
