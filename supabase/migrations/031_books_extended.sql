-- books: page_count, status (okunuyor/bitti), rating, spine_url, start_date, end_date
-- title ve author zaten var (content_items.title, books.author). tags zaten eklendi (030).

-- Sayfa sayısı (mevcut pages ile senkron)
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS page_count INT;
UPDATE books SET page_count = pages WHERE page_count IS NULL AND pages IS NOT NULL;

-- Durum: okunuyor / bitti
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('reading', 'finished'));
UPDATE books SET status = 'finished' WHERE status IS NULL;

-- Kitap puanı (0-5 veya content_items.rating ile senkron tutulabilir)
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS rating NUMERIC CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

-- Sırt görseli (kitaplık sırtında kullanılır)
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS spine_url TEXT;

-- Okuma başlangıç / bitiş tarihleri
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

COMMENT ON COLUMN books.page_count IS 'Sayfa sayısı (spine genişliği için)';
COMMENT ON COLUMN books.status IS 'reading = okunuyor, finished = bitti';
COMMENT ON COLUMN books.spine_url IS 'Kitaplık rafında sırt görseli';
COMMENT ON COLUMN books.start_date IS 'Okumaya başlama tarihi';
COMMENT ON COLUMN books.end_date IS 'Okumayı bitirme tarihi';
