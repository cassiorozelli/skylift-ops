-- Admin users: only these emails can access /admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read (for admin check)
CREATE POLICY "Authenticated can read admin_users"
  ON admin_users FOR SELECT TO authenticated USING (true);

-- Admins (profiles.role or admin_users) can manage admin_users
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
CREATE POLICY "Admins can manage admin_users"
  ON admin_users FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (true);
