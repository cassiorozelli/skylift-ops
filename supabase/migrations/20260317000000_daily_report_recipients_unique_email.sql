-- Ensure email is unique for daily_report_recipients (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_report_recipients_email_key'
  ) THEN
    ALTER TABLE daily_report_recipients
      ADD CONSTRAINT daily_report_recipients_email_key UNIQUE (email);
  END IF;
END $$;
