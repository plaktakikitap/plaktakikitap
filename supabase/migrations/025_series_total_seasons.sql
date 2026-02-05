-- Diziler için toplam sezon sayısı (dizide kaç sezon var)
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS total_seasons INT;

COMMENT ON COLUMN series.total_seasons IS 'Dizinin toplam sezon sayısı; seasons_watched izlenen sezon sayısı';
