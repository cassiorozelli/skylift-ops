-- Add voos_utilizados to flight_durations (optional, for admin reference)
ALTER TABLE flight_durations
  ADD COLUMN IF NOT EXISTS voos_utilizados INTEGER DEFAULT 0;
