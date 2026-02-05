-- VSCO-style photos: shot_at (display date), type enum analog/digital/other

-- Rename date -> shot_at if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'date'
  ) THEN
    ALTER TABLE photos RENAME COLUMN date TO shot_at;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'shot_at'
  ) THEN
    ALTER TABLE photos ADD COLUMN shot_at DATE;
  END IF;
END $$;

-- Ensure type column exists
ALTER TABLE photos ADD COLUMN IF NOT EXISTS type TEXT;

-- Backfill old type values to enum
UPDATE photos SET type = 'digital' WHERE type = 'dijital';
UPDATE photos SET type = 'other' WHERE type = 'diğer' OR type IS NULL;

-- Constraint: analog, digital, other. Default other.
ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_type_check;
ALTER TABLE photos ADD CONSTRAINT photos_type_check
  CHECK (type IS NULL OR type IN ('analog', 'digital', 'other'));
ALTER TABLE photos ALTER COLUMN type SET DEFAULT 'other';

COMMENT ON COLUMN photos.shot_at IS 'Shot/display date shown under photo';
COMMENT ON COLUMN photos.type IS 'Category: analog, digital, other (for filtering)';

-- Indexes (created_at already exists from 021)
DROP INDEX IF EXISTS idx_photos_date;
CREATE INDEX IF NOT EXISTS idx_photos_shot_at ON photos (shot_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_photos_type ON photos (type) WHERE type IS NOT NULL;
