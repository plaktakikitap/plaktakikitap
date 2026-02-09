-- İzleme günlüğü (watch log) dizileri için season_count, episode_count sütunları
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS season_count INT,
  ADD COLUMN IF NOT EXISTS episode_count INT;

COMMENT ON COLUMN series.season_count IS 'Sezon sayısı (total_seasons ile uyumlu)';
COMMENT ON COLUMN series.episode_count IS 'Bölüm sayısı (episodes_watched ile uyumlu)';

-- Mevcut veriyi total_seasons / episodes_watched ile doldur
UPDATE series
SET
  season_count = COALESCE(season_count, total_seasons),
  episode_count = COALESCE(episode_count, episodes_watched)
WHERE season_count IS NULL OR episode_count IS NULL;
