-- watched_at: when the film/series was watched (for "Son izlediğim" and shelf order)
-- creator_or_director: for series (creator or director name)

ALTER TABLE films
  ADD COLUMN IF NOT EXISTS watched_at TIMESTAMPTZ;

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS watched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS creator_or_director TEXT;

COMMENT ON COLUMN films.watched_at IS 'İzlenme tarihi; "Son izlediğim" ve raf sırası buna göre';
COMMENT ON COLUMN series.watched_at IS 'İzlenme tarihi; "Son izlediğim" ve raf sırası buna göre';
COMMENT ON COLUMN series.creator_or_director IS 'Dizi yaratıcısı veya yönetmeni';

-- Backfill watched_at from content_items.created_at for existing rows
UPDATE films f
SET watched_at = c.created_at
FROM content_items c
WHERE f.content_id = c.id AND f.watched_at IS NULL;

UPDATE series s
SET watched_at = c.created_at
FROM content_items c
WHERE s.content_id = c.id AND s.watched_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_films_watched_at ON films (watched_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_series_watched_at ON series (watched_at DESC NULLS LAST);
