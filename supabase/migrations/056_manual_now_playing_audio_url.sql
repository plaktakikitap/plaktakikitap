-- Manuel şarkılara MP3 URL (yüklenen dosya) ekle; play ile çalınsın
ALTER TABLE manual_now_playing
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

COMMENT ON COLUMN manual_now_playing.audio_url IS 'Yüklenen MP3 dosyasının public URL’i; varsa ana sayfada play ile çalar.';
