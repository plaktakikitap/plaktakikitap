-- Photos are public portfolio content; serve via getPublicUrl (no expiring signed URLs).
UPDATE storage.buckets
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif']::text[]
WHERE id = 'photos-media';
