-- Photo EXIF-style metadata + Turkish category (analog / dijital / diğer)

ALTER TABLE photos ADD COLUMN IF NOT EXISTS camera text;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS lens text;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS film text;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS category text DEFAULT 'dijital';

-- Backfill category from existing type (analog | digital | other).
-- DEFAULT 'dijital' fills existing rows immediately, so overwrite from type.
UPDATE photos
SET category = CASE
  WHEN type = 'analog' THEN 'analog'
  WHEN type = 'digital' THEN 'dijital'
  WHEN type = 'other' THEN 'diğer'
  WHEN type = 'dijital' THEN 'dijital'
  WHEN type = 'diğer' THEN 'diğer'
    ELSE 'diğer'
  END;

ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_category_check;
ALTER TABLE photos
  ADD CONSTRAINT photos_category_check
  CHECK (category IS NULL OR category IN ('analog', 'dijital', 'diğer'));

CREATE INDEX IF NOT EXISTS idx_photos_category ON photos (category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_photos_camera ON photos (camera) WHERE camera IS NOT NULL;

COMMENT ON COLUMN photos.camera IS 'Camera body (e.g. Canon AE-1)';
COMMENT ON COLUMN photos.lens IS 'Lens (e.g. 50mm)';
COMMENT ON COLUMN photos.film IS 'Film stock (e.g. Kodak Gold 200)';
COMMENT ON COLUMN photos.category IS 'Display category: analog, dijital, diğer';
