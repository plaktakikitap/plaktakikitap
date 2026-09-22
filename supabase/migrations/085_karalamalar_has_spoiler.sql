-- Opsiyonel: spoiler içeren karalamaları hızlıca bulmak için
-- Tablo alanı `icerik` (content değil)

ALTER TABLE karalamalar
  ADD COLUMN IF NOT EXISTS has_spoiler boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_karalamalar_has_spoiler
  ON karalamalar (has_spoiler)
  WHERE has_spoiler = true;

CREATE OR REPLACE FUNCTION update_has_spoiler()
RETURNS TRIGGER AS $$
BEGIN
  NEW.has_spoiler := NEW.icerik ~* '\[spoiler\]';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS karalamalar_spoiler_trigger ON karalamalar;
CREATE TRIGGER karalamalar_spoiler_trigger
  BEFORE INSERT OR UPDATE OF icerik ON karalamalar
  FOR EACH ROW EXECUTE FUNCTION update_has_spoiler();

UPDATE karalamalar
SET has_spoiler = (icerik ~* '\[spoiler\]')
WHERE has_spoiler IS DISTINCT FROM (icerik ~* '\[spoiler\]');
