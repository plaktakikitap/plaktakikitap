-- Add caption, date (shot date), and type (analog/dijital/diğer) to photos

ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS caption TEXT,
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS type TEXT;

COMMENT ON COLUMN photos.caption IS 'Optional short description (VSCO-style)';
COMMENT ON COLUMN photos.date IS 'Shot/display date (e.g. for ordering and display)';
COMMENT ON COLUMN photos.type IS 'Category: analog, dijital, or diğer';

-- Optional: constraint to enforce allowed type values
ALTER TABLE photos
  DROP CONSTRAINT IF EXISTS photos_type_check;
ALTER TABLE photos
  ADD CONSTRAINT photos_type_check CHECK (type IS NULL OR type IN ('analog', 'dijital', 'diğer'));

CREATE INDEX IF NOT EXISTS idx_photos_date ON photos (date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_photos_type ON photos (type) WHERE type IS NOT NULL;
