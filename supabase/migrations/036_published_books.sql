-- Yayınlanmış kitaplar (çeviriler sayfası): dikey kartlar, Satın Al, Çok Yakında bandı

CREATE TABLE IF NOT EXISTS published_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  year INT,
  cover_image TEXT,
  amazon_url TEXT,
  is_released BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE published_books IS 'Çeviriler sayfasında gösterilen yayınlanmış kitaplar; is_released=false ise Çok Yakında bandı';
COMMENT ON COLUMN published_books.is_released IS 'false = yolda / coming soon';

CREATE INDEX idx_published_books_order ON published_books (order_index, year DESC NULLS LAST);
CREATE INDEX idx_published_books_released ON published_books (is_released);

ALTER TABLE published_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published_books_select" ON published_books FOR SELECT USING (true);
CREATE POLICY "published_books_admin" ON published_books FOR ALL
  USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'authenticated')
  WITH CHECK (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'authenticated');
