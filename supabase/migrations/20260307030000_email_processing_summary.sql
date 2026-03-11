-- Add processing summary columns to email_processing_status
-- Populated by process_flights_email RPC when it runs

ALTER TABLE email_processing_status
  ADD COLUMN IF NOT EXISTS last_added integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_updated integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_cancelled integer DEFAULT 0;
