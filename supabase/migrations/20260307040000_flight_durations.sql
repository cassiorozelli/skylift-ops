-- Tabela flight_durations para ETA no calendário operacional
CREATE TABLE IF NOT EXISTS flight_durations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aeronave TEXT NOT NULL,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  tempo_medio_minutos INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(aeronave, origem, destino)
);

CREATE INDEX IF NOT EXISTS idx_flight_durations_lookup
  ON flight_durations(aeronave, origem, destino);

ALTER TABLE flight_durations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler flight_durations" ON flight_durations;
CREATE POLICY "Autenticados podem ler flight_durations"
  ON flight_durations FOR SELECT TO authenticated USING (true);
