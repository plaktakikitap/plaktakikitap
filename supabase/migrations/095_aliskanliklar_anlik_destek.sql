-- Anlık destek: bağlam, eğer–o zaman, akşam ritüeli, çevre haritası, dürtü kaydı.
-- Additive only. Mevcut alışkanlık ve kayıt satırları silinmez.

ALTER TABLE aliskanliklar
  ADD COLUMN IF NOT EXISTS baglamlar text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS muhtemel_engel text,
  ADD COLUMN IF NOT EXISTS eger_kosulu text,
  ADD COLUMN IF NOT EXISTS o_zaman_davranis text;

ALTER TABLE aliskanliklar
  DROP CONSTRAINT IF EXISTS aliskanliklar_baglamlar_check;
ALTER TABLE aliskanliklar
  ADD CONSTRAINT aliskanliklar_baglamlar_check
  CHECK (baglamlar <@ ARRAY['ev', 'is', 'yol', 'dusuk_enerji']::text[]);

ALTER TABLE aliskanlik_gunleri
  ADD COLUMN IF NOT EXISTS baglam text,
  ADD COLUMN IF NOT EXISTS atlanan_oneriler uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS uygun_degil uuid[] NOT NULL DEFAULT '{}';

ALTER TABLE aliskanlik_gunleri
  DROP CONSTRAINT IF EXISTS aliskanlik_gunleri_baglam_check;
ALTER TABLE aliskanlik_gunleri
  ADD CONSTRAINT aliskanlik_gunleri_baglam_check
  CHECK (
    baglam IS NULL
    OR baglam IN ('ev', 'is', 'yol', 'dusuk_enerji')
  );

CREATE TABLE IF NOT EXISTS aliskanlik_aksam_sablon (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  adimlar jsonb NOT NULL DEFAULT '[]'::jsonb,
  guncelleme_tarihi timestamptz DEFAULT now()
);

INSERT INTO aliskanlik_aksam_sablon (id, adimlar)
VALUES (
  1,
  '[
    {"kod":"kiyafet","ad":"Yarının kıyafetini hazırla"},
    {"kod":"canta","ad":"Çantayı hazırla"},
    {"kod":"ogun_su","ad":"Ara öğünü veya suyu hazırla"},
    {"kod":"kuran","ad":"Kur’an’ı görünür yere koy"},
    {"kod":"telefon","ad":"Telefonu yatağın dışındaki şarj yerine bırak"},
    {"kod":"ilk_davranis","ad":"Yarının ilk önemli davranışını seç"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS aliskanlik_aksam_kayitlari (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date UNIQUE NOT NULL,
  adimlar jsonb NOT NULL DEFAULT '{}'::jsonb,
  ilk_davranis text,
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aliskanlik_cevre_alanlari (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  alan text UNIQUE NOT NULL
    CHECK (alan IN (
      'yatak_odasi',
      'calisma_masasi',
      'mutfak',
      'canta',
      'telefon',
      'yolculuk'
    )),
  desteklenen_davranis text,
  gorunur_isaret text,
  kaldirilacak_engel text,
  surtunme text,
  haftanin_degisikligi text,
  bu_hafta_aktif boolean NOT NULL DEFAULT false,
  tamamlandi boolean NOT NULL DEFAULT false,
  aktif_hafta date,
  guncelleme_tarihi timestamptz DEFAULT now()
);

INSERT INTO aliskanlik_cevre_alanlari (alan)
VALUES
  ('yatak_odasi'),
  ('calisma_masasi'),
  ('mutfak'),
  ('canta'),
  ('telefon'),
  ('yolculuk')
ON CONFLICT (alan) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS idx_aliskanlik_cevre_hafta_tek
  ON aliskanlik_cevre_alanlari (bu_hafta_aktif)
  WHERE bu_hafta_aktif;

CREATE TABLE IF NOT EXISTS aliskanlik_durtuler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date NOT NULL,
  saat smallint NOT NULL CHECK (saat >= 0 AND saat <= 23),
  sebep text NOT NULL
    CHECK (sebep IN ('is', 'paylasim', 'mesaj', 'merak', 'can_sikintisi')),
  amac text,
  alternatif text,
  durum text NOT NULL DEFAULT 'bekliyor'
    CHECK (durum IN (
      'bekliyor',
      'amac_tamamlandi',
      'istek_gecti',
      'hala_istiyorum',
      'alternatif_yapildi'
    )),
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aliskanlik_durtuler_tarih
  ON aliskanlik_durtuler (tarih DESC);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'aliskanlik_aksam_sablon',
    'aliskanlik_aksam_kayitlari',
    'aliskanlik_cevre_alanlari',
    'aliskanlik_durtuler'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Sadece admin" ON %I', t);
    EXECUTE format(
      'CREATE POLICY "Sadece admin" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
    EXECUTE format('DROP POLICY IF EXISTS "%s_service_role_all" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_service_role_all" ON %I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')',
      t, t
    );
  END LOOP;
END $$;
