-- Idempotent: books.cover_url already exists on most envs.
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url text;
