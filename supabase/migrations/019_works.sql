-- Yaptıklarım / Yetenek Vitrini — YouTube, Sanat, Projeler, Rozetler, CV
-- works_videos: YouTube embed
CREATE TABLE IF NOT EXISTS works_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- works_art: Fotoğraf / resim galerisi (lightbox)
CREATE TABLE IF NOT EXISTS works_art (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- works_projects: Tourmania, Amazon vb. proje kartları
CREATE TABLE IF NOT EXISTS works_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  summary TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- works_badges: Sertifika / rozetler
CREATE TABLE IF NOT EXISTS works_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- works_experiences: CV zaman çizelgesi
CREATE TABLE IF NOT EXISTS works_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- works_settings: cv_download_url vb.
CREATE TABLE IF NOT EXISTS works_settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_works_videos_order ON works_videos (order_index);
CREATE INDEX idx_works_art_order ON works_art (order_index);
CREATE INDEX idx_works_projects_order ON works_projects (order_index);
CREATE INDEX idx_works_badges_order ON works_badges (order_index);
CREATE INDEX idx_works_experiences_order ON works_experiences (order_index);

ALTER TABLE works_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE works_art ENABLE ROW LEVEL SECURITY;
ALTER TABLE works_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE works_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE works_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE works_settings ENABLE ROW LEVEL SECURITY;

-- Public read for all works tables
CREATE POLICY "works_videos_select" ON works_videos FOR SELECT USING (true);
CREATE POLICY "works_art_select" ON works_art FOR SELECT USING (true);
CREATE POLICY "works_projects_select" ON works_projects FOR SELECT USING (true);
CREATE POLICY "works_badges_select" ON works_badges FOR SELECT USING (true);
CREATE POLICY "works_experiences_select" ON works_experiences FOR SELECT USING (true);
CREATE POLICY "works_settings_select" ON works_settings FOR SELECT USING (true);

-- Admin write (service_role or authenticated)
CREATE POLICY "works_videos_insert" ON works_videos FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "works_videos_update" ON works_videos FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "works_videos_delete" ON works_videos FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "works_art_insert" ON works_art FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "works_art_update" ON works_art FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "works_art_delete" ON works_art FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "works_projects_insert" ON works_projects FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "works_projects_update" ON works_projects FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "works_projects_delete" ON works_projects FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "works_badges_insert" ON works_badges FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "works_badges_update" ON works_badges FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "works_badges_delete" ON works_badges FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "works_experiences_insert" ON works_experiences FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "works_experiences_update" ON works_experiences FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "works_experiences_delete" ON works_experiences FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "works_settings_insert" ON works_settings FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "works_settings_update" ON works_settings FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "works_settings_delete" ON works_settings FOR DELETE USING (auth.role() = 'service_role');

-- Default CV key
INSERT INTO works_settings (key, value) VALUES ('cv_download_url', '') ON CONFLICT (key) DO NOTHING;
