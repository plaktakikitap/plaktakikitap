-- admin-uploads bucket: CV ve sertifika PDF yüklemeleri için
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    UPDATE storage.buckets
    SET
      allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf'
      ]::text[],
      file_size_limit = 15728640
    WHERE id = 'admin-uploads';
  END IF;
END $$;
