-- Series: Letterboxd grid parity with films (year + genre_tags)
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS year INT,
  ADD COLUMN IF NOT EXISTS genre_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rating_5 NUMERIC(3,2);

COMMENT ON COLUMN series.year IS 'Yapım yılı (ilk sezon)';
COMMENT ON COLUMN series.genre_tags IS 'Tür etiketleri (Dram, Komedi, ...)';
COMMENT ON COLUMN series.rating_5 IS '0–5 puan; content_items.rating ile birlikte tutulabilir';
