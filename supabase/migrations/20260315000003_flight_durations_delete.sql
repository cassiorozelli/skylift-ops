-- Allow authenticated users to delete flight_durations (for admin CRUD)
DROP POLICY IF EXISTS "Autenticados podem deletar flight_durations" ON flight_durations;
CREATE POLICY "Autenticados podem deletar flight_durations"
  ON flight_durations FOR DELETE TO authenticated USING (true);
