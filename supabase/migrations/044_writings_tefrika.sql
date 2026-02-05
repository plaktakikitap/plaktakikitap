-- Tefrika Dergisi: Diğer kategorisinde sayı + dış link (yazı açılmaz, kart + Dergiyi Satın Al)

ALTER TABLE writings
  ADD COLUMN IF NOT EXISTS tefrika_issue TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT;

COMMENT ON COLUMN writings.tefrika_issue IS 'Dolu ise: Tefrika bölümünde kart olarak gösterilir, "X Sayısı İçin Yazdığım Yazı" + Dergiyi Satın Al.';
COMMENT ON COLUMN writings.external_url IS 'Tefrika için dergi satın alma linki veya diğer dış link.';
