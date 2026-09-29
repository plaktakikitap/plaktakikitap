-- Müfredat gun (1-30) ile ilerler. Takvim tarihi ödev anahtarı değildir.
-- Her dil + seviye kendi başlangıç gününden sayar (dil_yazi_ilerleme).

CREATE TABLE IF NOT EXISTS dil_yazi_ilerleme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dil TEXT NOT NULL CHECK (dil IN ('ingilizce', 'fransizca', 'almanca')),
  seviye TEXT NOT NULL CHECK (seviye IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  baslangic_tarihi DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (dil, seviye)
);

ALTER TABLE dil_yazi_ilerleme ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dil_yazi_ilerleme_service_role_all ON dil_yazi_ilerleme;
CREATE POLICY dil_yazi_ilerleme_service_role_all
  ON dil_yazi_ilerleme
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Tarihli override gönderimlerini aynı dil/seviye müfredat gününe taşı.
UPDATE dil_yazi_gonderimleri AS g
SET odev_id = c.id
FROM dil_yazi_odevleri AS o
JOIN dil_yazi_odevleri AS c
  ON c.dil = o.dil
 AND c.seviye = o.seviye
 AND c.gun = COALESCE(o.gun, 1)
 AND c.tarih IS NULL
WHERE g.odev_id = o.id
  AND o.tarih IS NOT NULL;

DELETE FROM dil_yazi_odevleri
WHERE tarih IS NOT NULL;

DROP INDEX IF EXISTS dil_yazi_odevleri_gunluk_key;

ALTER TABLE dil_yazi_odevleri
  DROP COLUMN IF EXISTS tarih;

UPDATE dil_yazi_odevleri
SET gun = 1
WHERE gun IS NULL;

ALTER TABLE dil_yazi_odevleri
  ALTER COLUMN gun SET NOT NULL;

ALTER TABLE dil_yazi_odevleri
  ALTER COLUMN gun SET DEFAULT 1;

DROP INDEX IF EXISTS dil_yazi_odevleri_mufredat_key;

CREATE UNIQUE INDEX IF NOT EXISTS dil_yazi_odevleri_dil_seviye_gun_key
  ON dil_yazi_odevleri (dil, seviye, gun);
