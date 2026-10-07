-- Bölüm yorumu ve tekrar izlemenin süreye yansıması.
-- watch_count = ek izleme; toplam = izlendiyse 1 + watch_count.

ALTER TABLE public.series_episodes
  ADD COLUMN IF NOT EXISTS review text;

COMMENT ON COLUMN public.series_episodes.review IS 'Bu bölüme dair yorum';
COMMENT ON COLUMN public.series_episodes.watch_count IS 'Ek izleme sayısı; toplam = izlendiyse 1 + watch_count';

CREATE OR REPLACE FUNCTION public.update_series_watch_stats()
RETURNS TRIGGER AS $$
DECLARE
  sid uuid;
BEGIN
  sid := COALESCE(NEW.series_id, OLD.series_id);
  UPDATE public.series
  SET total_watched_minutes = (
    SELECT COALESCE(SUM(
      CASE
        WHEN watched IS TRUE AND runtime IS NOT NULL
          THEN runtime * (1 + COALESCE(watch_count, 0))
        ELSE 0
      END
    ), 0)
    FROM public.series_episodes
    WHERE series_id = sid
  )
  WHERE content_id = sid;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS series_watch_stats_trigger ON public.series_episodes;
CREATE TRIGGER series_watch_stats_trigger
  AFTER INSERT OR UPDATE OF watched, runtime, watch_count OR DELETE
  ON public.series_episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_series_watch_stats();
