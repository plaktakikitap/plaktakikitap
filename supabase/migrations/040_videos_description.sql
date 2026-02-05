-- Video açıklaması (opsiyonel)

ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN videos.description IS 'Video açıklaması; admin formundan girilir.';
