-- Legacy tables had RLS off; anon key could read/write/delete everything.
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_essays" ON essays;
DROP POLICY IF EXISTS "public_read_media_hub" ON media_hub;
DROP POLICY IF EXISTS "public_read_player_state" ON player_state;
DROP POLICY IF EXISTS "public_read_reading_log" ON reading_log;
DROP POLICY IF EXISTS "public_read_songs" ON songs;
DROP POLICY IF EXISTS "public_read_watch_log" ON watch_log;

CREATE POLICY "public_read_essays" ON essays FOR SELECT USING (true);
CREATE POLICY "public_read_media_hub" ON media_hub FOR SELECT USING (true);
CREATE POLICY "public_read_player_state" ON player_state FOR SELECT USING (true);
CREATE POLICY "public_read_reading_log" ON reading_log FOR SELECT USING (true);
CREATE POLICY "public_read_songs" ON songs FOR SELECT USING (true);
CREATE POLICY "public_read_watch_log" ON watch_log FOR SELECT USING (true);
