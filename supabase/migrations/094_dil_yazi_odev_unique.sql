-- Günlük yazı ödevi: dil + seviye + tarih tek kayıt.

CREATE UNIQUE INDEX IF NOT EXISTS dil_yazi_odevleri_dil_seviye_tarih_key
  ON dil_yazi_odevleri (dil, seviye, tarih);
