-- Alıntılar: books ile 1-N ilişki
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  page_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT quotes_text_not_empty CHECK (char_length(trim(text)) > 0),
  CONSTRAINT quotes_page_positive CHECK (page_number IS NULL OR page_number > 0)
);

CREATE INDEX IF NOT EXISTS quotes_book_id_idx ON quotes(book_id);
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes(created_at DESC);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Ziyaretçi: yalnızca public/unlisted kitapların alıntıları
DROP POLICY IF EXISTS "public_read_quotes" ON quotes;
CREATE POLICY "public_read_quotes"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = quotes.book_id
        AND b.visibility IN ('public', 'unlisted')
    )
  );

-- Admin (authenticated): tam erişim
DROP POLICY IF EXISTS "admin_all_quotes" ON quotes;
CREATE POLICY "admin_all_quotes"
  ON quotes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE quotes IS 'Kitap alıntıları — books.id FK';
COMMENT ON COLUMN quotes.page_number IS 'Opsiyonel sayfa numarası';
