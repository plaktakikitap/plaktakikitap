-- Eymen'in Favori 5'lisi: film ve dizi kartlarında favori işareti + sıra
ALTER TABLE films
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS favorite_order INT;

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS favorite_order INT;

COMMENT ON COLUMN films.is_favorite IS 'Eymen''in Favori 5''lisi vitrininde gösterilsin mi';
COMMENT ON COLUMN films.favorite_order IS 'Vitrinde sıra (büyük = en son eklenen); en son 5 gösterilir';
COMMENT ON COLUMN series.is_favorite IS 'Eymen''in Favori 5''lisi vitrininde gösterilsin mi';
COMMENT ON COLUMN series.favorite_order IS 'Vitrinde sıra (büyük = en son eklenen); en son 5 gösterilir';

CREATE INDEX IF NOT EXISTS idx_films_favorite ON films (is_favorite, favorite_order DESC NULLS LAST) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_series_favorite ON series (is_favorite, favorite_order DESC NULLS LAST) WHERE is_favorite = true;
