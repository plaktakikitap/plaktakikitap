-- Public bucket for admin image uploads (cover, poster, thumbnail, etc.)
-- Full public URL returned; no signed URLs needed.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'admin-uploads',
      'admin-uploads',
      true,
      10485760,
      ARRAY['image/jpeg','image/png','image/webp','image/gif']::text[]
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
