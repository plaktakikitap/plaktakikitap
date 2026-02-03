ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_social_links"
  ON social_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin_all_social_links"
  ON social_links FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
