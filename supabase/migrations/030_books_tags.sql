-- Kitaplar için etiketler (#etiketler, tıklanabilir / filtreleme)
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN books.tags IS 'Kitap etiketleri; okuma günlüğü modalında tıklanabilir, filtreleme için kullanılır';
