-- Skylift Ops - Passageiros e vínculo com voos
-- Tabela passengers: passageiros cadastrados
CREATE TABLE IF NOT EXISTS passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cpf)
);

-- Tabela flight_passengers: vínculo voo x passageiro
-- flight_id = UUID da linha na tabela de voo (mono/jato/helicoptero)
-- flight_table = qual tabela de voo (mono_flights | jato_flights | helicoptero_flights)
CREATE TABLE IF NOT EXISTS flight_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL,
  flight_table TEXT NOT NULL CHECK (flight_table IN ('mono_flights', 'jato_flights', 'helicoptero_flights')),
  passenger_id UUID NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(flight_id, flight_table, passenger_id)
);

CREATE INDEX IF NOT EXISTS idx_flight_passengers_flight ON flight_passengers(flight_id, flight_table);
CREATE INDEX IF NOT EXISTS idx_flight_passengers_passenger ON flight_passengers(passenger_id);
CREATE INDEX IF NOT EXISTS idx_passengers_cpf ON passengers(cpf);
CREATE INDEX IF NOT EXISTS idx_passengers_name ON passengers(name);

-- RLS
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_passengers ENABLE ROW LEVEL SECURITY;

-- Políticas passengers: autenticados podem ler, inserir, atualizar
DROP POLICY IF EXISTS "Autenticados podem ler passengers" ON passengers;
CREATE POLICY "Autenticados podem ler passengers"
  ON passengers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados podem inserir passengers" ON passengers;
CREATE POLICY "Autenticados podem inserir passengers"
  ON passengers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Autenticados podem atualizar passengers" ON passengers;
CREATE POLICY "Autenticados podem atualizar passengers"
  ON passengers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Políticas flight_passengers
DROP POLICY IF EXISTS "Autenticados podem ler flight_passengers" ON flight_passengers;
CREATE POLICY "Autenticados podem ler flight_passengers"
  ON flight_passengers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados podem inserir flight_passengers" ON flight_passengers;
CREATE POLICY "Autenticados podem inserir flight_passengers"
  ON flight_passengers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Autenticados podem deletar flight_passengers" ON flight_passengers;
CREATE POLICY "Autenticados podem deletar flight_passengers"
  ON flight_passengers FOR DELETE TO authenticated USING (true);
