-- Senkron ambient müzik: admin yüklediği MP3'ler, global playlist tek zamanla herkese aynı pozisyonda
CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration_sec INT NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_tracks_active_order
  ON music_tracks (is_active, order_index) WHERE is_active = true;

COMMENT ON TABLE music_tracks IS 'Ana sayfa senkron çalma listesi: MP3 yükleme, sıra, kapak. playlist_start_time site_settings.value içinde.';

ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "music_tracks_public_select_active"
  ON music_tracks FOR SELECT
  USING (is_active = true);

CREATE POLICY "music_tracks_admin_all"
  ON music_tracks FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Storage: müzik dosyaları (MP3) ve kapak görselleri
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'music',
      'music',
      true,
      52428800,
      ARRAY['audio/mpeg','audio/mp3','image/jpeg','image/png','image/webp']::text[]
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
