-- App reads site_settings.value JSON; dedicated column kept in sync for SQL.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS music_source TEXT NOT NULL DEFAULT 'lastfm';

DO $$
BEGIN
  ALTER TABLE site_settings
    ADD CONSTRAINT site_settings_music_source_check
    CHECK (music_source IN ('lastfm', 'manuel'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE site_settings
SET value = COALESCE(value, '{}'::jsonb) || jsonb_build_object(
  'music_source',
  COALESCE(music_source, 'lastfm')
)
WHERE value IS NULL OR NOT (value ? 'music_source');
