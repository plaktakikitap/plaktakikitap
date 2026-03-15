-- Tekrar izleme sayısı: raf ta tekrar göstermeden süre toplama
-- rewatch_count = ek izleme sayısı (0 = 1 kez, 64 = 65 kez)
-- Toplam süre = duration * (1 + rewatch_count)

ALTER TABLE films
  ADD COLUMN IF NOT EXISTS rewatch_count INT NOT NULL DEFAULT 0;

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS rewatch_count INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN films.rewatch_count IS 'Ek izleme sayısı; toplam = 1 + rewatch_count. Süre: duration_min * (1 + rewatch_count)';
COMMENT ON COLUMN series.rewatch_count IS 'Diziyi baştan sona tekrar izleme sayısı; süre: total_duration_min * (1 + rewatch_count)';
