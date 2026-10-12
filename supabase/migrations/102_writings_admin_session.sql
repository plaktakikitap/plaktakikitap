-- Yazı yönetimi, karalamalarla aynı: giriş yapmış kullanıcı yazabilir.
-- Anon yine yalnızca vakti gelmiş yayındaki satırları okur.

DROP POLICY IF EXISTS writings_admin_authenticated ON writings;
CREATE POLICY writings_admin_authenticated
  ON writings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
