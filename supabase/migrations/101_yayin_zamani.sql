-- Zamanlanmış yayın. Gelecek yayin_zamani sitede görünmez; saat gelince sorgu açar.
-- Türkiye saati uygulama katmanında UTC+3 olarak saklanır.

ALTER TABLE karalamalar
  ADD COLUMN IF NOT EXISTS yayin_zamani timestamptz;

DROP POLICY IF EXISTS "Herkes yayindakileri okuyabilir" ON karalamalar;
CREATE POLICY "Herkes yayindakileri okuyabilir"
  ON karalamalar FOR SELECT
  TO anon
  USING (
    yayinda = true
    AND (yayin_zamani IS NULL OR yayin_zamani <= now())
  );

DROP POLICY IF EXISTS writings_public_select ON writings;
CREATE POLICY writings_public_select
  ON writings
  FOR SELECT
  TO anon, authenticated
  USING (
    durum = 'yayinda'
    AND published_at <= now()
  );
