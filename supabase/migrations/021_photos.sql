-- Personal photography + visual diary
-- Tags: #analog #digital #bw #street #istanbul; camera: #minolta #canon #fuji (stored in tags or camera)

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  camera TEXT,
  year INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was created earlier with different schema
ALTER TABLE photos ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE photos ADD COLUMN IF NOT EXISTS camera TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS year INT;

CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_photos_camera ON photos (camera) WHERE camera IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_photos_year ON photos (year) WHERE year IS NOT NULL;

COMMENT ON TABLE photos IS 'Personal photography archive; image_url can be storage path or external URL';

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_public_select"
  ON photos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "photos_service_all"
  ON photos FOR ALL
  USING (auth.role() = 'service_role');

-- Storage bucket for photo uploads (private; serve via signed URLs)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'photos-media',
      'photos-media',
      false,
      10485760,
      ARRAY['image/jpeg','image/png','image/webp','image/gif']::text[]
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
