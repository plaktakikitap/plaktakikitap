-- Portföy işleri: afiş, sosyal medya, fotoğraf, video
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client TEXT,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT portfolio_items_title_not_empty CHECK (char_length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS portfolio_items_category_idx ON portfolio_items (category);
CREATE INDEX IF NOT EXISTS portfolio_items_created_at_idx ON portfolio_items (created_at DESC);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_portfolio_items" ON portfolio_items;
CREATE POLICY "public_read_portfolio_items"
  ON portfolio_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin_all_portfolio_items" ON portfolio_items;
CREATE POLICY "admin_all_portfolio_items"
  ON portfolio_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE portfolio_items IS 'Tasarım / medya portföy öğeleri';
COMMENT ON COLUMN portfolio_items.client IS 'Müşteri veya kurum, örn. Taksim Camii Külliyesi, Alakart Travel';
COMMENT ON COLUMN portfolio_items.category IS 'afiş, sosyal medya, fotoğraf, video';
