-- Movies/film alanları: director, genre_tags, rating 0-5 (çeyrek/yarım destekli)
-- title, cover (poster_url), spine (spine_url), review_text (review) zaten mevcut

ALTER TABLE films
  ADD COLUMN IF NOT EXISTS director TEXT,
  ADD COLUMN IF NOT EXISTS genre_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rating_5 NUMERIC(3,2) CHECK (rating_5 >= 0 AND rating_5 <= 5);

COMMENT ON COLUMN films.director IS 'Yönetmen';
COMMENT ON COLUMN films.genre_tags IS 'Tür etiketleri: dram, komedi, bilim kurgu, vb.';
COMMENT ON COLUMN films.rating_5 IS '0-5 arası puan; 0.25 ve 0.5 adımları desteklenir';
