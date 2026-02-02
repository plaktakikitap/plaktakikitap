-- plaktakikitap: Content base + films, series, books, media, tags
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Content base table
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('film','series','book','post','translation','project','certificate','art','planner_entry')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  rating NUMERIC(2,1),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','unlisted','private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Films detail
CREATE TABLE IF NOT EXISTS films (
  content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  duration_min INT NOT NULL,
  year INT,
  poster_url TEXT,
  review TEXT
);

-- Series detail
CREATE TABLE IF NOT EXISTS series (
  content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  avg_episode_min INT,
  episodes_watched INT DEFAULT 0,
  seasons_watched INT DEFAULT 0,
  review TEXT
);

-- Books detail
CREATE TABLE IF NOT EXISTS books (
  content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  pages INT,
  author TEXT,
  quote TEXT,
  review TEXT,
  cover_url TEXT
);

-- Media assets (images, videos, links)
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('image','video','link')),
  url TEXT NOT NULL,
  caption TEXT
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS content_tags (
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Enable on all tables
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- Public read: public + unlisted (content_items only; detail tables open for join)
CREATE POLICY "public_read_content" ON content_items
  FOR SELECT
  USING (visibility IN ('public', 'unlisted'));

CREATE POLICY "public_read_films" ON films
  FOR SELECT USING (true);

CREATE POLICY "public_read_series" ON series
  FOR SELECT USING (true);

CREATE POLICY "public_read_books" ON books
  FOR SELECT USING (true);

CREATE POLICY "public_read_media" ON media_assets
  FOR SELECT USING (true);

CREATE POLICY "public_read_tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "public_read_content_tags" ON content_tags
  FOR SELECT USING (true);

-- Admin full access (authenticated)
CREATE POLICY "admin_all_content" ON content_items
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_films" ON films
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_series" ON series
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_books" ON books
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_media" ON media_assets
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_tags" ON tags
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_content_tags" ON content_tags
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
