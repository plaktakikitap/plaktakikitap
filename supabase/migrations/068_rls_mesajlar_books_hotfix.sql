-- Hotfix: enable RLS on tables that had policies without ENABLE
ALTER TABLE IF EXISTS mesajlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS books ENABLE ROW LEVEL SECURITY;

-- Ensure books policies exist
DROP POLICY IF EXISTS "public_read_books" ON books;
CREATE POLICY "public_read_books"
  ON books FOR SELECT
  USING (visibility IN ('public', 'unlisted'));

DROP POLICY IF EXISTS "admin_all_books" ON books;
CREATE POLICY "admin_all_books"
  ON books FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
