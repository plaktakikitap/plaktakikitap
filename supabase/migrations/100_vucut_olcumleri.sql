-- Beslenme sayfası: tarihli vücut ölçüleri (tartı + mezura)

CREATE TABLE IF NOT EXISTS public.vucut_olcumleri (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date NOT NULL UNIQUE,
  kilo_kg numeric,
  boy_cm numeric,
  yag_yuzde numeric,
  kas_yuzde numeric,
  su_yuzde numeric,
  protein_yuzde numeric,
  iskelet_kas_yuzde numeric,
  kemik_kg numeric,
  visseral_yag numeric,
  bmr_kcal numeric,
  metabolik_yas numeric,
  bel_cm numeric,
  kalca_cm numeric,
  gogus_cm numeric,
  boyun_cm numeric,
  notlar text,
  olusturma_tarihi timestamptz DEFAULT now(),
  CONSTRAINT vucut_olcumleri_en_az_biri CHECK (
    kilo_kg IS NOT NULL OR boy_cm IS NOT NULL OR yag_yuzde IS NOT NULL
    OR kas_yuzde IS NOT NULL OR su_yuzde IS NOT NULL OR protein_yuzde IS NOT NULL
    OR iskelet_kas_yuzde IS NOT NULL OR kemik_kg IS NOT NULL OR visseral_yag IS NOT NULL
    OR bmr_kcal IS NOT NULL OR metabolik_yas IS NOT NULL OR bel_cm IS NOT NULL
    OR kalca_cm IS NOT NULL OR gogus_cm IS NOT NULL OR boyun_cm IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_vucut_olcumleri_tarih ON public.vucut_olcumleri (tarih DESC);

ALTER TABLE public.vucut_olcumleri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sadece admin" ON public.vucut_olcumleri;
CREATE POLICY "Sadece admin" ON public.vucut_olcumleri
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vucut_olcumleri_service_role_all" ON public.vucut_olcumleri;
CREATE POLICY "vucut_olcumleri_service_role_all" ON public.vucut_olcumleri
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
