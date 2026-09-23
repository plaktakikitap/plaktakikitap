-- Kitap yan cilt rengi (şu an okuyorum stack animasyonu)
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS spine_color TEXT;

COMMENT ON COLUMN books.spine_color IS 'Yan cilt rengi (hex); yoksa UI default #8B7355';
