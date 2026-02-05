-- DVD rafı görünümü için yan yüzey (spine) görseli
ALTER TABLE films
  ADD COLUMN IF NOT EXISTS spine_url TEXT;

COMMENT ON COLUMN films.spine_url IS 'DVD spine (yan yüz) görseli; yoksa poster_url kullanılır';
