ALTER TABLE series
  ADD COLUMN IF NOT EXISTS origin_country text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS imdb_rating numeric(3,1),
  ADD COLUMN IF NOT EXISTS imdb_position integer;

COMMENT ON COLUMN series.origin_country IS 'TMDB origin_country (TR, KR, JP, US, …)';
COMMENT ON COLUMN series.imdb_rating IS 'IMDb 10 üzerinden puan (watchlist)';
COMMENT ON COLUMN series.imdb_position IS 'IMDb watchlist sırası';

UPDATE series s
SET
  imdb_rating = COALESCE(s.imdb_rating, w.imdb_rating),
  imdb_position = COALESCE(s.imdb_position, w.imdb_position)
FROM imdb_watchlist w
WHERE w.imdb_id = s.imdb_id;
