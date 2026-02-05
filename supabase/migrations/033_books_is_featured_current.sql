-- Öne çıkan "şu an okuyorum" kitabı (en fazla bir tane, admin seçer)
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS is_featured_current BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN books.is_featured_current IS 'True ise "Şu an okuyorum" kartında bu kitap gösterilir; sadece bir kitap true olmalı (status=reading iken anlamlı)';
