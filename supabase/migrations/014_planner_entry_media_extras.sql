-- planner_entry: summary_quote (takvimde görünecek), sticker_selection (JSON)
ALTER TABLE planner_entry
  ADD COLUMN IF NOT EXISTS summary_quote TEXT,
  ADD COLUMN IF NOT EXISTS sticker_selection TEXT;

-- planner_media: attachment_type (paperclip, paste, staple)
ALTER TABLE planner_media
  ADD COLUMN IF NOT EXISTS attachment_type TEXT
  CHECK (attachment_type IS NULL OR attachment_type IN ('paperclip', 'paste', 'staple'));
