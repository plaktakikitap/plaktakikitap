-- attachment_style: standard_clip, colorful_clip, binder_clip, staple
-- Mevcut attachment_type değerlerini migration: paperclip->standard_clip, staple->staple, paste->colorful_clip
ALTER TABLE planner_media
  ADD COLUMN IF NOT EXISTS attachment_style TEXT
  CHECK (attachment_style IS NULL OR attachment_style IN ('standard_clip', 'colorful_clip', 'binder_clip', 'staple'));

-- Mevcut attachment_type verilerini attachment_style'a kopyala
UPDATE planner_media SET attachment_style =
  CASE attachment_type
    WHEN 'paperclip' THEN 'standard_clip'
    WHEN 'staple' THEN 'staple'
    WHEN 'paste' THEN 'colorful_clip'
    ELSE 'standard_clip'
  END
WHERE attachment_type IS NOT NULL;
