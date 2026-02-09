-- Dizi DVD rafı: ön kapak ve yan kapak (spine) görselleri
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS poster_url TEXT,
  ADD COLUMN IF NOT EXISTS spine_url TEXT;

COMMENT ON COLUMN series.poster_url IS 'Ön kapak (poster) görseli';
COMMENT ON COLUMN series.spine_url IS 'DVD spine (yan yüz) görseli; yoksa poster_url veya placeholder kullanılır';
