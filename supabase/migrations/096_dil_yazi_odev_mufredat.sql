-- 30 günlük yazı müfredatı: gun + prompt_hedef.
-- Mevcut tarihli günlük override'lar silinmez.

ALTER TABLE dil_yazi_odevleri
  ADD COLUMN IF NOT EXISTS gun INTEGER
    CHECK (gun IS NULL OR (gun >= 1 AND gun <= 30)),
  ADD COLUMN IF NOT EXISTS prompt_hedef TEXT;

ALTER TABLE dil_yazi_odevleri
  ALTER COLUMN tarih DROP NOT NULL;

ALTER TABLE dil_yazi_odevleri
  ALTER COLUMN tarih DROP DEFAULT;

DROP INDEX IF EXISTS dil_yazi_odevleri_dil_seviye_tarih_key;

CREATE UNIQUE INDEX IF NOT EXISTS dil_yazi_odevleri_mufredat_key
  ON dil_yazi_odevleri (dil, seviye, gun)
  WHERE gun IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS dil_yazi_odevleri_gunluk_key
  ON dil_yazi_odevleri (dil, seviye, tarih)
  WHERE tarih IS NOT NULL;
