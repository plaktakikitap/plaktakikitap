-- Çevirmen notu ve tamamlanma yüzdesi

ALTER TABLE published_books
  ADD COLUMN IF NOT EXISTS translator_note TEXT,
  ADD COLUMN IF NOT EXISTS completion_percentage INT;

ALTER TABLE published_books
  ADD CONSTRAINT chk_completion_percentage
  CHECK (completion_percentage IS NULL OR (completion_percentage >= 0 AND completion_percentage <= 100));

COMMENT ON COLUMN published_books.translator_note IS 'Çevirmenin notu; modalda Çevirmenin Notu bölümünde gösterilir';
COMMENT ON COLUMN published_books.completion_percentage IS 'Tamamlanma yüzdesi (0-100)';
