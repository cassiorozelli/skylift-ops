-- Skylift Ops - Seed de pilotos
-- Monomotores
INSERT INTO pilots (name, base) VALUES
  ('Roselli', 'monomotores'),
  ('Pinho', 'monomotores'),
  ('Anderson', 'monomotores'),
  ('Toscano', 'monomotores'),
  ('Fabiano', 'monomotores'),
  ('Igor', 'monomotores');

-- Helicópteros
INSERT INTO pilots (name, base) VALUES
  ('Luna', 'helicopteros'),
  ('Raineri', 'helicopteros'),
  ('Ubatuba', 'helicopteros'),
  ('Kevin', 'helicopteros'),
  ('Thiago', 'helicopteros'),
  ('Babaioff', 'helicopteros'),
  ('Miranda', 'helicopteros'),
  ('Claudinho', 'helicopteros'),
  ('GustavoEmilio', 'helicopteros');

-- pilot_categories: vincula pilotos às categorias (mono, helicoptero, jato)
INSERT INTO pilot_categories (pilot_id, category)
SELECT id, 'mono' FROM pilots WHERE base = 'monomotores'
ON CONFLICT (pilot_id, category) DO NOTHING;

INSERT INTO pilot_categories (pilot_id, category)
SELECT id, 'helicoptero' FROM pilots WHERE base = 'helicopteros'
ON CONFLICT (pilot_id, category) DO NOTHING;
