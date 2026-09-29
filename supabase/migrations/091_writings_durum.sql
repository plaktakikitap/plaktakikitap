-- Yazı taslakları: durum taslak | yayinda | arsivlendi
-- Mevcut satırlar yayında kalır; yeni kayıtlar varsayılan taslak.

ALTER TABLE writings
  ADD COLUMN IF NOT EXISTS durum TEXT;

UPDATE writings
SET durum = 'yayinda'
WHERE durum IS NULL;

ALTER TABLE writings
  ALTER COLUMN durum SET DEFAULT 'taslak';

ALTER TABLE writings
  ALTER COLUMN durum SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'writings_durum_check'
      AND conrelid = 'writings'::regclass
  ) THEN
    ALTER TABLE writings
      ADD CONSTRAINT writings_durum_check
      CHECK (durum IN ('taslak', 'yayinda', 'arsivlendi'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_writings_durum ON writings (durum);

DROP POLICY IF EXISTS writings_public_select ON writings;
CREATE POLICY writings_public_select
  ON writings
  FOR SELECT
  TO anon, authenticated
  USING (durum = 'yayinda');
