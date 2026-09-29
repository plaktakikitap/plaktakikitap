-- Quiz / yazı ödevi / XP için ayrı öğrenme sistemi.
-- Mevcut dil_kelimeler + dil_notlar (kelime bankası) değişmez.

CREATE TABLE IF NOT EXISTS dil_kelime_hazinesi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dil TEXT NOT NULL CHECK (dil IN ('ingilizce', 'fransizca', 'almanca')),
  seviye TEXT NOT NULL CHECK (seviye IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  tip TEXT NOT NULL CHECK (tip IN ('kelime', 'phrasal', 'kalip', 'kolokasyon')),
  hedef_dil TEXT NOT NULL,
  anlam_tr TEXT NOT NULL,
  ornek_cumle TEXT,
  ornek_cumle_tr TEXT,
  notlar TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dil_ogrenme_kayitlari (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kelime_id UUID REFERENCES dil_kelime_hazinesi(id) ON DELETE CASCADE,
  durum TEXT NOT NULL DEFAULT 'yeni'
    CHECK (durum IN ('yeni', 'ogreniyor', 'tekrar', 'ustalasildi')),
  dogru_sayisi INTEGER DEFAULT 0,
  yanlis_sayisi INTEGER DEFAULT 0,
  son_gorulme TIMESTAMPTZ,
  sonraki_tekrar TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (kelime_id)
);

CREATE TABLE IF NOT EXISTS dil_yazi_odevleri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dil TEXT NOT NULL CHECK (dil IN ('ingilizce', 'fransizca', 'almanca')),
  seviye TEXT NOT NULL CHECK (seviye IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  prompt_tr TEXT NOT NULL,
  hedef_kelimeler UUID[],
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dil_yazi_gonderimleri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  odev_id UUID REFERENCES dil_yazi_odevleri(id),
  dil TEXT NOT NULL CHECK (dil IN ('ingilizce', 'fransizca', 'almanca')),
  metin TEXT NOT NULL,
  ai_geri_bildirim TEXT,
  puan INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dil_xp_kayitlari (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dil TEXT NOT NULL CHECK (dil IN ('ingilizce', 'fransizca', 'almanca')),
  etkinlik TEXT NOT NULL
    CHECK (etkinlik IN ('dogru_cevap', 'yanlislik', 'ustalasildi', 'yazi', 'streak_bonus')),
  xp INTEGER NOT NULL,
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kelime_hazinesi_dil_seviye
  ON dil_kelime_hazinesi (dil, seviye);

CREATE INDEX IF NOT EXISTS idx_ogrenme_kayitlari_durum
  ON dil_ogrenme_kayitlari (durum);

CREATE INDEX IF NOT EXISTS idx_ogrenme_kayitlari_sonraki
  ON dil_ogrenme_kayitlari (sonraki_tekrar);

CREATE INDEX IF NOT EXISTS idx_xp_tarih
  ON dil_xp_kayitlari (tarih, dil);

ALTER TABLE dil_kelime_hazinesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE dil_ogrenme_kayitlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE dil_yazi_odevleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE dil_yazi_gonderimleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE dil_xp_kayitlari ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dil_kelime_hazinesi_service_role_all ON dil_kelime_hazinesi;
CREATE POLICY dil_kelime_hazinesi_service_role_all
  ON dil_kelime_hazinesi
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS dil_ogrenme_kayitlari_service_role_all ON dil_ogrenme_kayitlari;
CREATE POLICY dil_ogrenme_kayitlari_service_role_all
  ON dil_ogrenme_kayitlari
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS dil_yazi_odevleri_service_role_all ON dil_yazi_odevleri;
CREATE POLICY dil_yazi_odevleri_service_role_all
  ON dil_yazi_odevleri
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS dil_yazi_gonderimleri_service_role_all ON dil_yazi_gonderimleri;
CREATE POLICY dil_yazi_gonderimleri_service_role_all
  ON dil_yazi_gonderimleri
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS dil_xp_kayitlari_service_role_all ON dil_xp_kayitlari;
CREATE POLICY dil_xp_kayitlari_service_role_all
  ON dil_xp_kayitlari
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
