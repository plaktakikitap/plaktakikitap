-- Plaktaki Kitap: normal videolar vs sesli kitaplar (iki kategori)

ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'normal_video'
  CHECK (type IN ('normal_video', 'audio_book'));

COMMENT ON COLUMN videos.type IS 'normal_video: başlık, açıklama, thumbnail. audio_book: kitap adı, özet, plak ikonu otomatik.';

CREATE INDEX IF NOT EXISTS idx_videos_type ON videos (type);
