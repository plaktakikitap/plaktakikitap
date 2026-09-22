-- Public list page /diziler reads imdb_watchlist via anon client
DROP POLICY IF EXISTS "public_read_imdb_watchlist" ON imdb_watchlist;
CREATE POLICY "public_read_imdb_watchlist"
  ON imdb_watchlist FOR SELECT
  USING (true);
