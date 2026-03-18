-- Recipients for daily flight report emails
CREATE TABLE IF NOT EXISTS daily_report_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  send_mono BOOLEAN NOT NULL DEFAULT false,
  send_jato BOOLEAN NOT NULL DEFAULT false,
  send_helicoptero BOOLEAN NOT NULL DEFAULT false,
  send_all BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE daily_report_recipients ENABLE ROW LEVEL SECURITY;

-- Admins (profiles.role or admin_users by JWT email) can manage; avoid reading auth.users
CREATE POLICY "Admins can manage daily_report_recipients"
  ON daily_report_recipients FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = (auth.jwt() ->> 'email'))
  )
  WITH CHECK (true);
