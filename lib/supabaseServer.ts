import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/** Server-only Supabase client with service role. Use in API routes for n8n or cron. */
export function getSupabaseServer() {
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for server operations"
    )
  }
  return createClient(url, serviceKey)
}
