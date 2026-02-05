-- Series: store total_duration_min = episode_count * avg_episode_min (computed on save)
-- Stats and UI use total_duration_min for totals; admin inputs episode_count + avg_episode_min.

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS total_duration_min INT;

COMMENT ON COLUMN series.total_duration_min IS 'episode_count * avg_episode_min; computed on insert/update';

-- Backfill from existing data (episodes_watched = episode count)
UPDATE series
SET total_duration_min = episodes_watched * avg_episode_min
WHERE avg_episode_min IS NOT NULL
  AND episodes_watched IS NOT NULL
  AND episodes_watched > 0;
