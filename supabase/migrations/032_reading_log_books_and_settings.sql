-- Reading Log: standalone books table + settings for yearly goal
-- Rules:
--   Yıllık hedef: settings key reading_goal_{year}, value_json { "year", "goal" }
--   Completed count: books where status='finished' and end_date in current year
--   Şu an okuyorum: status='reading' order by last_progress_update_at desc limit 1
--   readingCount: count of status='reading'

-- 1) Settings table (key-value for reading_goal_{year}, etc.)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_json JSONB NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE settings IS 'Key-value store; reading_goal_{year} holds { "year": N, "goal": N }';

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "admin_all_settings"
  ON settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Migrate reading_goal into settings
INSERT INTO settings (key, value_json)
  SELECT 'reading_goal_' || year, jsonb_build_object('year', year, 'goal', goal)
  FROM reading_goal
  ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json;

-- 2) New standalone books table (replaces content_items + books for reading log)
CREATE TABLE IF NOT EXISTS books_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  page_count INT NOT NULL CHECK (page_count >= 1),
  status TEXT NOT NULL DEFAULT 'reading' CHECK (status IN ('reading', 'finished', 'paused', 'dropped')),
  rating NUMERIC(3,2) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  tags TEXT[] NOT NULL DEFAULT '{}',
  review TEXT,
  cover_url TEXT,
  spine_url TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  last_progress_update_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress_percent INT CHECK (progress_percent IS NULL OR (progress_percent >= 0 AND progress_percent <= 100)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN books_new.status IS 'reading | finished | paused | dropped';
COMMENT ON COLUMN books_new.progress_percent IS 'For currently reading: 0-100';
COMMENT ON COLUMN books_new.last_progress_update_at IS 'Used to pick "Şu an okuyorum" (most recent reading)';

-- Optional: keep visibility for public/unlisted filtering (copy from content_items)
ALTER TABLE books_new ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private'));

-- 3) Migrate data from content_items + books into books_new
INSERT INTO books_new (
  id,
  title,
  author,
  page_count,
  status,
  rating,
  tags,
  review,
  cover_url,
  spine_url,
  start_date,
  end_date,
  last_progress_update_at,
  progress_percent,
  created_at,
  visibility
)
SELECT
  b.content_id,
  COALESCE(ci.title, ''),
  COALESCE(b.author, ''),
  GREATEST(1, COALESCE(b.page_count, b.pages, 1)),
  COALESCE(b.status, 'reading'),
  b.rating,
  COALESCE(b.tags, '{}'),
  b.review,
  b.cover_url,
  COALESCE(NULLIF(TRIM(b.spine_url), ''), ''),
  (b.start_date AT TIME ZONE 'UTC')::DATE,
  (b.end_date AT TIME ZONE 'UTC')::DATE,
  now(),
  NULL,
  COALESCE(ci.created_at, now()),
  COALESCE(ci.visibility, 'public')
FROM books b
JOIN content_items ci ON ci.id = b.content_id
WHERE ci.type = 'book'
ON CONFLICT (id) DO NOTHING;

-- 4) Drop old books and replace with new
DROP POLICY IF EXISTS "public_read_books" ON books;
DROP POLICY IF EXISTS "admin_all_books" ON books;
DROP TABLE IF EXISTS books;

ALTER TABLE books_new RENAME TO books;

CREATE POLICY "public_read_books"
  ON books FOR SELECT
  USING (visibility IN ('public', 'unlisted'));

CREATE POLICY "admin_all_books"
  ON books FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5) Remove book rows from content_items (optional cleanup to avoid orphans)
DELETE FROM content_items WHERE type = 'book';
