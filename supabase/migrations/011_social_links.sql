CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,  -- 'instagram', 'spotify', 'linkedin' vb.
  url TEXT NOT NULL,
  icon_name TEXT,         -- Lucide ikon ismi için
  is_active BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0
);
