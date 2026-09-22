ALTER TABLE series
  ADD COLUMN IF NOT EXISTS imdb_id text;

CREATE UNIQUE INDEX IF NOT EXISTS series_imdb_id_uidx
  ON series (imdb_id)
  WHERE imdb_id IS NOT NULL;

COMMENT ON COLUMN series.imdb_id IS 'IMDb tt… id; TMDB enrich scripts/enrich-series-tmdb.ts';
