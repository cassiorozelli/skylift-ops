-- RPC for /api/flights/today: returns database current date (CURRENT_DATE) as YYYY-MM-DD.
-- Ensures API and DB use the same date, avoiding timezone mismatch.
CREATE OR REPLACE FUNCTION public.get_today()
RETURNS DATE
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT CURRENT_DATE;
$$;
