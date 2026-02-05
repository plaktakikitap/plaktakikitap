-- Seed: 2026 Ocak ve Şubat spread'leri için dummy data
-- /planner görüntüleme (flip + modal + previews) ve /admin/planner canvas/day entry için

-- 1) planner_day: Ocak 2026 (1-31) ve Şubat 2026 (1-28)
INSERT INTO planner_day (id, date, month, year)
SELECT gen_random_uuid(), d::date, EXTRACT(MONTH FROM d::date)::int, 2026
FROM generate_series('2026-01-01'::date, '2026-01-31'::date, '1 day'::interval) d
ON CONFLICT (date) DO NOTHING;

INSERT INTO planner_day (id, date, month, year)
SELECT gen_random_uuid(), d::date, EXTRACT(MONTH FROM d::date)::int, 2026
FROM generate_series('2026-02-01'::date, '2026-02-28'::date, '1 day'::interval) d
ON CONFLICT (date) DO NOTHING;

-- 2) planner_entry: bazı günlere örnek kayıt (takvimde nokta + modal içerik)
INSERT INTO planner_entry (day_id, title, content, summary_quote, tags)
SELECT pd.id, 'Gün notu', 'Bugün için kısa bir not. Seed verisi.', 'Bugün için kısa bir not.', ARRAY['seed', '2026']
FROM planner_day pd
WHERE pd.date IN (
  '2026-01-05', '2026-01-12', '2026-01-18', '2026-01-25',
  '2026-02-03', '2026-02-14', '2026-02-20'
)
AND NOT EXISTS (SELECT 1 FROM planner_entry e WHERE e.day_id = pd.id);

-- 3) planner_spreads: 2026 Ocak ve Şubat
INSERT INTO planner_spreads (id, year, month)
VALUES
  (gen_random_uuid(), 2026, 1),
  (gen_random_uuid(), 2026, 2)
ON CONFLICT (year, month) DO NOTHING;

-- 4) planner_elements: Ocak/Şubat spread'leri (önce mevcut seed elementleri sil, sonra ekle)
DELETE FROM planner_elements WHERE spread_id IN (SELECT id FROM planner_spreads WHERE year = 2026 AND month IN (1, 2));

-- Ocak 2026 spread
INSERT INTO planner_elements (spread_id, page_side, type, src, text, x, y, w, h, rotation, z_index, meta)
SELECT s.id, 'left', 'paperclip', NULL, NULL, 0.08, 0.22, 0.06, 0.04, 5, 50, '{}'
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 1
UNION ALL
SELECT s.id, 'left', 'coffee_stain', NULL, NULL, 0.88, 0.82, 0.12, 0.12, -3, 5, '{"size": 56}'::jsonb
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 1
UNION ALL
SELECT s.id, 'right', 'sticky_note', NULL, 'Notlar', 0.78, 0.25, 0.18, 0.12, -4, 30, '{"color": "#fef08a"}'::jsonb
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 1
UNION ALL
SELECT s.id, 'right', 'washi_tape', NULL, NULL, 0.92, 0.12, 0.15, 0.04, -10, 25, '{"variant": "pink"}'::jsonb
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 1
UNION ALL
SELECT s.id, 'right', 'coffee_stain', NULL, NULL, 0.12, 0.18, 0.1, 0.1, 2, 5, '{"size": 48}'::jsonb
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 1;

-- Şubat 2026 spread
INSERT INTO planner_elements (spread_id, page_side, type, src, text, x, y, w, h, rotation, z_index, meta)
SELECT s.id, 'left', 'paperclip', NULL, NULL, 0.08, 0.22, 0.06, 0.04, 5, 50, '{}'
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 2
UNION ALL
SELECT s.id, 'left', 'coffee_stain', NULL, NULL, 0.88, 0.82, 0.12, 0.12, -3, 5, '{"size": 56}'::jsonb
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 2
UNION ALL
SELECT s.id, 'right', 'sticky_note', NULL, 'Şubat notları', 0.72, 0.28, 0.2, 0.12, 2, 30, '{"color": "#d4e6f1"}'::jsonb
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 2
UNION ALL
SELECT s.id, 'right', 'washi_tape', NULL, NULL, 0.9, 0.08, 0.15, 0.04, -8, 25, '{"variant": "blue"}'::jsonb
FROM planner_spreads s WHERE s.year = 2026 AND s.month = 2;

-- 5) planner_day_entries: günlük kayıt (date bazlı, admin day entry editor)
INSERT INTO planner_day_entries (date, title, content, photos, tags)
VALUES
  ('2026-01-05', 'İlk gün notu', 'Ocak 5 için gün notu. Seed.', '{}', ARRAY['ocak', 'seed']),
  ('2026-01-12', 'Ocak 12', 'Bu güne ait kısa içerik.', '{}', ARRAY['seed']),
  ('2026-02-14', 'Şubat 14', 'Örnek gün kaydı.', '{}', ARRAY['şubat', 'seed'])
ON CONFLICT (date) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags;
