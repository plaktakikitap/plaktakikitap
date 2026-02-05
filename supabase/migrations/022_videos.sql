-- Plaktaki Kitap YouTube videos (channel showcase)
-- Featured video used on homepage card

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_videos_published_at ON videos (published_at DESC NULLS LAST);
CREATE INDEX idx_videos_featured ON videos (is_featured) WHERE is_featured = true;
CREATE INDEX idx_videos_sort ON videos (sort_order);

COMMENT ON TABLE videos IS 'YouTube videos for /videos page; thumbnail_url can be auto from YouTube or custom';

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos_public_select"
  ON videos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "videos_service_all"
  ON videos FOR ALL
  USING (auth.role() = 'service_role');
