-- Okunacaklar kütüphanesi: books.status = to_read
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_status_check;
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_new_status_check;

ALTER TABLE books
  ADD CONSTRAINT books_status_check
  CHECK (status IN ('reading', 'finished', 'paused', 'dropped', 'to_read'));

COMMENT ON COLUMN books.status IS 'reading | finished | paused | dropped | to_read';
