-- Skylift Ops - Schema inicial
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Tabela mono_flights
CREATE TABLE IF NOT EXISTS mono_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id TEXT UNIQUE NOT NULL,
  data DATE NOT NULL,
  hora TEXT,
  aeronave TEXT,
  destino TEXT,
  passageiros TEXT,
  piloto1 TEXT,
  piloto2 TEXT,
  ordem_dia INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela jato_flights
CREATE TABLE IF NOT EXISTS jato_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id TEXT UNIQUE NOT NULL,
  data DATE NOT NULL,
  hora TEXT,
  aeronave TEXT,
  destino TEXT,
  passageiros TEXT,
  piloto1 TEXT,
  piloto2 TEXT,
  ordem_dia INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela helicoptero_flights
CREATE TABLE IF NOT EXISTS helicoptero_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id TEXT UNIQUE NOT NULL,
  data DATE NOT NULL,
  hora TEXT,
  aeronave TEXT,
  destino TEXT,
  passageiros TEXT,
  piloto1 TEXT,
  piloto2 TEXT,
  ordem_dia INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela profiles (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operacoes')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para criar profile automaticamente ao registrar usuário (opcional)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'operacoes')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Só crie o trigger se quiser auto-criar profiles com role 'operacoes'
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS)
-- Usuários autenticados podem ler e atualizar
-- N8N usará Service Role Key (bypass RLS) para INSERT/UPSERT

ALTER TABLE mono_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE jato_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE helicoptero_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para mono_flights
DROP POLICY IF EXISTS "Autenticados podem ler mono_flights" ON mono_flights;
CREATE POLICY "Autenticados podem ler mono_flights"
  ON mono_flights FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Autenticados podem atualizar mono_flights" ON mono_flights;
CREATE POLICY "Autenticados podem atualizar mono_flights"
  ON mono_flights FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para jato_flights
DROP POLICY IF EXISTS "Autenticados podem ler jato_flights" ON jato_flights;
CREATE POLICY "Autenticados podem ler jato_flights"
  ON jato_flights FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Autenticados podem atualizar jato_flights" ON jato_flights;
CREATE POLICY "Autenticados podem atualizar jato_flights"
  ON jato_flights FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para helicoptero_flights
DROP POLICY IF EXISTS "Autenticados podem ler helicoptero_flights" ON helicoptero_flights;
CREATE POLICY "Autenticados podem ler helicoptero_flights"
  ON helicoptero_flights FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Autenticados podem atualizar helicoptero_flights" ON helicoptero_flights;
CREATE POLICY "Autenticados podem atualizar helicoptero_flights"
  ON helicoptero_flights FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- INSERT/UPDATE: Service Role (N8N) bypassa RLS automaticamente

-- Políticas para profiles
DROP POLICY IF EXISTS "Usuários podem ler próprio profile" ON profiles;
CREATE POLICY "Usuários podem ler próprio profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
