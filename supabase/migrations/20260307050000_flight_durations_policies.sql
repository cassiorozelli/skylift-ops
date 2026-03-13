-- Políticas para permitir que usuários autenticados insiram e atualizem flight_durations
-- (necessário para o FlightCard salvar o tempo estimado de voo)

DROP POLICY IF EXISTS "Autenticados podem inserir flight_durations" ON flight_durations;
CREATE POLICY "Autenticados podem inserir flight_durations"
  ON flight_durations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Autenticados podem atualizar flight_durations" ON flight_durations;
CREATE POLICY "Autenticados podem atualizar flight_durations"
  ON flight_durations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
