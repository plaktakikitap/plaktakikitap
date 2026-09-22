ALTER TABLE imdb_watchlist
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS episode_count integer;

COMMENT ON COLUMN imdb_watchlist.poster_url IS 'TMDB afiş (w500)';
COMMENT ON COLUMN imdb_watchlist.episode_count IS 'TMDB toplam bölüm; tahmini süre = episode_count * runtime_mins';
