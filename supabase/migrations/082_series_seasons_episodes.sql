-- TMDB + bölüm izleme: series genişlemesi, sezon/bölüm tabloları
-- public.series PK = content_id (id yok). FK'ler content_id'ye bağlanır.
-- series.status zaten var (finished/waiting/dropped) — TMDB yayın durumu tmdb_status.

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS tmdb_id integer,
  ADD COLUMN IF NOT EXISTS backdrop_url text,
  ADD COLUMN IF NOT EXISTS overview text,
  ADD COLUMN IF NOT EXISTS total_episodes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS episode_runtime integer,
  ADD COLUMN IF NOT EXISTS tmdb_status text,
  ADD COLUMN IF NOT EXISTS last_air_date date,
  ADD COLUMN IF NOT EXISTS watch_status text DEFAULT 'watchlist',
  ADD COLUMN IF NOT EXISTS dropped_at_season integer,
  ADD COLUMN IF NOT EXISTS dropped_at_episode integer,
  ADD COLUMN IF NOT EXISTS total_watched_minutes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS watch_count integer DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'series_watch_status_check'
      AND conrelid = 'public.series'::regclass
  ) THEN
    ALTER TABLE series
      ADD CONSTRAINT series_watch_status_check
      CHECK (watch_status IN ('watchlist', 'watching', 'completed', 'dropped', 'rewatching'));
  END IF;
END $$;

COMMENT ON COLUMN series.tmdb_id IS 'TMDB TV id';
COMMENT ON COLUMN series.tmdb_status IS 'TMDB yayın durumu: Ended, Returning Series, Canceled, …';
COMMENT ON COLUMN series.watch_status IS 'İzleme: watchlist/watching/completed/dropped/rewatching';
COMMENT ON COLUMN series.episode_runtime IS 'TMDB ortalama bölüm süresi (dk); avg_episode_min ile yan yana';
COMMENT ON COLUMN series.total_watched_minutes IS 'İzlenen bölüm runtime toplamı (series_episodes trigger)';

CREATE TABLE IF NOT EXISTS series_seasons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id uuid NOT NULL REFERENCES series(content_id) ON DELETE CASCADE,
  season_number integer NOT NULL,
  name text,
  episode_count integer DEFAULT 0,
  air_date date,
  poster_url text,
  overview text,
  UNIQUE (series_id, season_number)
);

CREATE TABLE IF NOT EXISTS series_episodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id uuid NOT NULL REFERENCES series(content_id) ON DELETE CASCADE,
  season_id uuid REFERENCES series_seasons(id) ON DELETE CASCADE,
  season_number integer NOT NULL,
  episode_number integer NOT NULL,
  name text,
  overview text,
  runtime integer,
  air_date date,
  still_url text,
  watched boolean DEFAULT false,
  watched_at timestamptz,
  watch_count integer DEFAULT 0,
  UNIQUE (series_id, season_number, episode_number)
);

CREATE INDEX IF NOT EXISTS series_episodes_series_id_idx ON series_episodes(series_id);
CREATE INDEX IF NOT EXISTS series_episodes_watched_idx ON series_episodes(series_id, watched);
CREATE INDEX IF NOT EXISTS series_seasons_series_id_idx ON series_seasons(series_id);

CREATE OR REPLACE FUNCTION update_series_watch_stats()
RETURNS TRIGGER AS $$
DECLARE
  sid uuid;
BEGIN
  sid := COALESCE(NEW.series_id, OLD.series_id);
  UPDATE series
  SET total_watched_minutes = (
    SELECT COALESCE(SUM(runtime), 0)
    FROM series_episodes
    WHERE series_id = sid
      AND watched = true
      AND runtime IS NOT NULL
  )
  WHERE content_id = sid;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS series_watch_stats_trigger ON series_episodes;
CREATE TRIGGER series_watch_stats_trigger
  AFTER INSERT OR UPDATE OF watched, runtime OR DELETE
  ON series_episodes
  FOR EACH ROW EXECUTE FUNCTION update_series_watch_stats();

ALTER TABLE series_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_episodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_series_seasons" ON series_seasons;
CREATE POLICY "public_read_series_seasons"
  ON series_seasons FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_series_episodes" ON series_episodes;
CREATE POLICY "public_read_series_episodes"
  ON series_episodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_series_seasons" ON series_seasons;
CREATE POLICY "admin_all_series_seasons"
  ON series_seasons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_all_series_episodes" ON series_episodes;
CREATE POLICY "admin_all_series_episodes"
  ON series_episodes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
