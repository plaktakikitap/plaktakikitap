-- IMDb watchlist import (CSV). Not the watch-log `series` table
-- (that one is keyed by content_id and powers /izleme-gunlugum/diziler).

CREATE TABLE IF NOT EXISTS imdb_watchlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  imdb_id text UNIQUE,
  title text NOT NULL,
  original_title text,
  imdb_url text,
  title_type text,
  imdb_rating numeric(3,1),
  runtime_mins integer,
  year integer,
  genres text[],
  release_date text,
  user_rating integer,
  date_rated date,
  imdb_position integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS imdb_watchlist_imdb_id_idx ON imdb_watchlist(imdb_id);
CREATE INDEX IF NOT EXISTS imdb_watchlist_year_idx ON imdb_watchlist(year);
CREATE INDEX IF NOT EXISTS imdb_watchlist_title_type_idx ON imdb_watchlist(title_type);

ALTER TABLE imdb_watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_imdb_watchlist" ON imdb_watchlist;
CREATE POLICY "admin_all_imdb_watchlist"
  ON imdb_watchlist FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE imdb_watchlist IS 'IMDb watchlist CSV import; ayrı tablo çünkü public.series izleme günlüğüne ait';
