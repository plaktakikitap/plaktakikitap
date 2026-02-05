-- Dil çifti etiketleri: çevirinin kaynak ve hedef dili (örn. EN → TR)

ALTER TABLE published_books
  ADD COLUMN IF NOT EXISTS source_lang TEXT,
  ADD COLUMN IF NOT EXISTS target_lang TEXT;

COMMENT ON COLUMN published_books.source_lang IS 'Kaynak dil kodu (örn. EN, FR)';
COMMENT ON COLUMN published_books.target_lang IS 'Hedef dil kodu (örn. TR)';
