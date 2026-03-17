-- Fix: política "Admins can manage" pode causar 500 ao referenciar auth.users
-- Simplificar: só profiles.role=admin pode gerenciar admin_users
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
CREATE POLICY "Admins can manage admin_users"
  ON admin_users FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (true);
