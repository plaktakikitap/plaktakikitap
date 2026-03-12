-- Dizi izleme durumu: bitirilmiş, devamını bekliyorum, yarıda bıraktım
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('finished', 'waiting', 'dropped'));

COMMENT ON COLUMN series.status IS 'Dizi durumu: finished=Bitirilmiş, waiting=Devamını Bekliyorum, dropped=Yarıda Bıraktım';
