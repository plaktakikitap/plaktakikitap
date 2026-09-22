-- quotes tablosu yoksa oluştur (denormalize 1000kitap import alanları)
CREATE TABLE IF NOT EXISTS quotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  book text,
  author text,
  page_num integer,
  cover_url text,
  source_date timestamp,
  created_at timestamp DEFAULT now()
);

-- Varsa eksik sütunları ekle
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS quote text,
  ADD COLUMN IF NOT EXISTS book text,
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS page_num integer,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS source_date timestamp;

-- Eski şemadaki text / page_number ile hizala
UPDATE quotes
SET quote = text
WHERE quote IS NULL AND text IS NOT NULL;

UPDATE quotes
SET page_num = page_number
WHERE page_num IS NULL AND page_number IS NOT NULL;
