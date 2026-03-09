-- Add ordering and visibility to categories
ALTER TABLE categories ADD COLUMN display_order INT DEFAULT 0;
ALTER TABLE categories ADD COLUMN is_visible_on_navbar BOOLEAN DEFAULT TRUE;
ALTER TABLE categories ADD COLUMN is_visible_on_home BOOLEAN DEFAULT TRUE;

-- Create settings table
CREATE TABLE site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial settings
INSERT INTO site_settings (key, value) VALUES ('show_about_in_navbar', 'true'::jsonb) ON CONFLICT (key) DO NOTHING;
