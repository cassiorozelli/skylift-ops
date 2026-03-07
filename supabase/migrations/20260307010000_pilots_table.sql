-- Skylift Ops - Tabela pilots e colunas pilot_1_id, pilot_2_id
CREATE TABLE IF NOT EXISTS pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT,
  base TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar pilot_1_id e pilot_2_id às tabelas de voo
ALTER TABLE mono_flights ADD COLUMN IF NOT EXISTS pilot_1_id UUID REFERENCES pilots(id) ON DELETE SET NULL;
ALTER TABLE mono_flights ADD COLUMN IF NOT EXISTS pilot_2_id UUID REFERENCES pilots(id) ON DELETE SET NULL;

ALTER TABLE jato_flights ADD COLUMN IF NOT EXISTS pilot_1_id UUID REFERENCES pilots(id) ON DELETE SET NULL;
ALTER TABLE jato_flights ADD COLUMN IF NOT EXISTS pilot_2_id UUID REFERENCES pilots(id) ON DELETE SET NULL;

ALTER TABLE helicoptero_flights ADD COLUMN IF NOT EXISTS pilot_1_id UUID REFERENCES pilots(id) ON DELETE SET NULL;
ALTER TABLE helicoptero_flights ADD COLUMN IF NOT EXISTS pilot_2_id UUID REFERENCES pilots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pilots_name ON pilots(name);

ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler pilots" ON pilots;
CREATE POLICY "Autenticados podem ler pilots" ON pilots FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados podem inserir pilots" ON pilots;
CREATE POLICY "Autenticados podem inserir pilots" ON pilots FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Autenticados podem atualizar pilots" ON pilots;
CREATE POLICY "Autenticados podem atualizar pilots" ON pilots FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
