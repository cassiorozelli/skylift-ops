-- Run this in Supabase Dashboard → SQL Editor to create daily_report_recipients

-- 1) Create table
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

-- 2) Unique email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_report_recipients_email_key'
  ) THEN
    ALTER TABLE daily_report_recipients
      ADD CONSTRAINT daily_report_recipients_email_key UNIQUE (email);
  END IF;
END $$;

-- 3) RLS
ALTER TABLE daily_report_recipients ENABLE ROW LEVEL SECURITY;

-- 4) Drop existing policy if you need to recreate it
DROP POLICY IF EXISTS "Admins can manage daily_report_recipients" ON daily_report_recipients;

-- 5) Policy: allow if admin via profiles.role OR email in admin_users (no auth.users read)
CREATE POLICY "Admins can manage daily_report_recipients"
  ON daily_report_recipients FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM admin_users au WHERE au.email = (auth.jwt() ->> 'email'))
  )
  WITH CHECK (true);

-- If you get "permission denied" on profiles or admin_users, use this (any authenticated user):
-- DROP POLICY IF EXISTS "Admins can manage daily_report_recipients" ON daily_report_recipients;
-- CREATE POLICY "Authenticated can manage daily_report_recipients"
--   ON daily_report_recipients FOR ALL TO authenticated USING (true) WITH CHECK (true);
