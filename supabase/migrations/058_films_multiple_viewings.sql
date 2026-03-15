-- Aynı filmin tekrar izlenmesi (re-log): her izlenme ayrı films satırı.
-- content_id artık tekil değil; id primary key.

ALTER TABLE films
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

UPDATE films SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE films ALTER COLUMN id SET NOT NULL;

ALTER TABLE films DROP CONSTRAINT IF EXISTS films_pkey;
ALTER TABLE films ADD PRIMARY KEY (id);

CREATE INDEX IF NOT EXISTS idx_films_content_id ON films (content_id);

COMMENT ON COLUMN films.id IS 'Her izlenme kaydının tekil id''si; aynı film (content_id) birden fazla satırda olabilir.';
