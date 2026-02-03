-- Özel ay alanları: Hayatımın Film Müziği vb. (sağ sayfa için)
ALTER TABLE planner_page_settings
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]';

COMMENT ON COLUMN planner_page_settings.custom_fields IS 'Ay sayfası özel alanları: [{ "label": "Hayatımın Film Müziği", "content": "..." }]';
