-- Anonim sayfa görüntülenmeleri (PII yok). Saat/gün İstanbul'dan API'de yazılır.

CREATE TABLE IF NOT EXISTS sayfa_goruntulenmeleri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sayfa_yolu TEXT NOT NULL,
  saat INTEGER NOT NULL CHECK (saat BETWEEN 0 AND 23),
  gun_haftada INTEGER NOT NULL CHECK (gun_haftada BETWEEN 0 AND 6),
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sayfa_goruntuleme_saat
  ON sayfa_goruntulenmeleri (gun_haftada, saat);

CREATE INDEX IF NOT EXISTS idx_sayfa_goruntuleme_tarih
  ON sayfa_goruntulenmeleri (tarih DESC);

ALTER TABLE sayfa_goruntulenmeleri ENABLE ROW LEVEL SECURITY;
