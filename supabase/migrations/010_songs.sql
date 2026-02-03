CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration_sec INT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
