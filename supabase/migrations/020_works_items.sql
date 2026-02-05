-- Yetenek Vitrini — unified works_items + private storage
-- Types: youtube, art, photo, experience, project, certificate, software, cv_role

CREATE TABLE IF NOT EXISTS works_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'youtube', 'art', 'photo', 'experience', 'project', 'certificate', 'software', 'cv_role'
  )),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  url TEXT,
  external_url TEXT,
  image_url TEXT,
  meta JSONB DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_works_items_visibility ON works_items (visibility);
CREATE INDEX idx_works_items_type ON works_items (type);
CREATE INDEX idx_works_items_sort ON works_items (sort_order);
CREATE INDEX idx_works_items_featured ON works_items (is_featured) WHERE is_featured = true;

COMMENT ON COLUMN works_items.meta IS 'Extra: year, issuer, role, org, start_year, end_year, stack[], github_url, metrics, medium, location, seed';

ALTER TABLE works_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "works_items_public_select"
  ON works_items FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "works_items_service_all"
  ON works_items FOR ALL
  USING (auth.role() = 'service_role');

-- Storage bucket (run in Supabase SQL if storage schema exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'works-media',
      'works-media',
      false,
      10485760,
      ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']::text[]
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Storage RLS: only service_role can manage objects (uploads from server)
-- Signed URLs are generated server-side; no anon read policy needed for private bucket
