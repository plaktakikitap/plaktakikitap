-- YouTube abone sayısı elle girilecek (API kaldırıldı)
ALTER TABLE plaktaki_kitap_settings
  ADD COLUMN IF NOT EXISTS youtube_subscriber_count INT;

COMMENT ON COLUMN plaktaki_kitap_settings.youtube_subscriber_count IS 'Manuel girilen YouTube abone sayısı';
