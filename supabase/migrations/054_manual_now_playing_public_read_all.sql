-- Ana sayfada "Şu an dinliyorum" alanında tüm şarkılar sırayla gösterilsin diye
-- herkese SELECT izni (sadece okuma; ekleme/güncelleme admin'de kalıyor).
DROP POLICY IF EXISTS "public_read_active_manual_track" ON manual_now_playing;
CREATE POLICY "public_read_all_manual_now_playing"
  ON manual_now_playing FOR SELECT
  USING (true);
