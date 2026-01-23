-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & AUTHORS (RBAC)
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'author', 'subscriber');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    username VARCHAR(50) UNIQUE, -- Mandatory for authors
    avatar_url TEXT,
    bio TEXT,
    social_links JSONB DEFAULT '{}', -- { twitter, facebook, instagram, website }
    role user_role DEFAULT 'subscriber',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES (Hierarchical)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(60) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MEDIA (DAM - Digital Asset Management)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID REFERENCES users(id),
    url TEXT NOT NULL,
    filename VARCHAR(255),
    mime_type VARCHAR(50),
    size_bytes BIGINT,
    alt_text TEXT,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ARTICLES (The Core)
CREATE TYPE article_status AS ENUM ('draft', 'review', 'scheduled', 'published', 'archived');

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subdeck TEXT, -- Short intro/summary
    slug TEXT UNIQUE NOT NULL,
    
    -- Content: Stores the Tiptap JSON structure
    content_json JSONB DEFAULT '{}',
    -- Plain text for search indexing
    content_text TEXT, 
    
    -- Structure
    primary_category_id UUID REFERENCES categories(id),
    featured_image_id UUID REFERENCES media(id),
    
    -- SEO
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    canonical_url TEXT,
    
    -- Workflow
    status article_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ARTICLE AUTHORS (Many-to-Many for Bylines)
CREATE TABLE article_authors (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_order INT DEFAULT 1,
    PRIMARY KEY (article_id, author_id)
);

-- 6. REVISIONS (Version Control)
CREATE TABLE article_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    editor_id UUID REFERENCES users(id),
    content_snapshot JSONB,
    change_summary TEXT, -- "Fixed typo", "Added chart"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. COMMENTS
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    parent_id UUID REFERENCES comments(id), -- Threading
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(primary_category_id);
CREATE INDEX idx_comments_article ON comments(article_id);
