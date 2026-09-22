-- Public archive quotes (1000kitap import) may have no books.id match
DROP POLICY IF EXISTS "public_read_quotes" ON quotes;
CREATE POLICY "public_read_quotes"
  ON quotes FOR SELECT
  USING (
    book_id IS NULL
    OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = quotes.book_id
        AND b.visibility IN ('public', 'unlisted')
    )
  );
