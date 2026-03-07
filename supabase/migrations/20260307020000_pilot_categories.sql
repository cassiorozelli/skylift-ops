-- Skylift Ops - Tabela pilot_categories para filtro por tipo de aeronave
-- Permite que um piloto pertença a múltiplas categorias: mono | helicoptero | jato

CREATE TABLE IF NOT EXISTS pilot_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('mono', 'helicoptero', 'jato')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pilot_id, category)
);

CREATE INDEX IF NOT EXISTS idx_pilot_categories_pilot ON pilot_categories(pilot_id);
CREATE INDEX IF NOT EXISTS idx_pilot_categories_category ON pilot_categories(category);

ALTER TABLE pilot_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ler pilot_categories" ON pilot_categories;
CREATE POLICY "Autenticados podem ler pilot_categories"
  ON pilot_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados podem inserir pilot_categories" ON pilot_categories;
CREATE POLICY "Autenticados podem inserir pilot_categories"
  ON pilot_categories FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Autenticados podem deletar pilot_categories" ON pilot_categories;
CREATE POLICY "Autenticados podem deletar pilot_categories"
  ON pilot_categories FOR DELETE TO authenticated USING (true);

-- Migrar pilotos existentes: base 'monomotores' -> mono, base 'helicopteros' -> helicoptero
INSERT INTO pilot_categories (pilot_id, category)
SELECT id, CASE
  WHEN base = 'monomotores' THEN 'mono'
  WHEN base = 'helicopteros' THEN 'helicoptero'
END
FROM pilots
WHERE base IN ('monomotores', 'helicopteros')
ON CONFLICT (pilot_id, category) DO NOTHING;
