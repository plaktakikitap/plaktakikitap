-- Admin Diziler V2: arşiv görünürlüğü + paused izleme durumu
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_visibility_check;
ALTER TABLE content_items
  ADD CONSTRAINT content_items_visibility_check
  CHECK (visibility IN ('public', 'unlisted', 'private', 'archived'));

ALTER TABLE series DROP CONSTRAINT IF EXISTS series_watch_status_check;
ALTER TABLE series
  ADD CONSTRAINT series_watch_status_check
  CHECK (
    watch_status IS NULL
    OR watch_status IN (
      'watchlist',
      'watching',
      'completed',
      'dropped',
      'rewatching',
      'paused'
    )
  );

COMMENT ON COLUMN content_items.visibility IS 'public=izlendi/yayında, private=izlenecek, unlisted=gizli yayında, archived=arşiv';
COMMENT ON COLUMN series.watch_status IS 'İzleme: watchlist/watching/completed/dropped/rewatching/paused';
