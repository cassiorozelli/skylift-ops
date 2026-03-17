-- ============================================================
-- PASSO 1: Criar tabela admin_users (se não existir)
-- Execute no Supabase SQL Editor
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read admin_users" ON admin_users;
CREATE POLICY "Authenticated can read admin_users"
  ON admin_users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
CREATE POLICY "Admins can manage admin_users"
  ON admin_users FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (true);

-- ============================================================
-- PASSO 2: Adicionar o admin roselli@aerorio.com.br
-- ============================================================
INSERT INTO admin_users (email)
VALUES ('roselli@aerorio.com.br')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- PASSO 3 (IMPORTANTE): Dar role=admin ao roselli no profiles
-- Isso permite que o menu Admin abra mesmo se admin_users der 500
-- ============================================================
INSERT INTO profiles (id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'roselli@aerorio.com.br'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
