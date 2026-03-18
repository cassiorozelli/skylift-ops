import type { SupabaseClient } from "@supabase/supabase-js"
import type { DailyReportRecipient } from "@/types/database"

const TABLE = "daily_report_recipients"

export type RecipientInsert = Omit<DailyReportRecipient, "id" | "created_at">
export type RecipientUpdate = Partial<Omit<DailyReportRecipient, "id" | "email" | "created_at">>

/** Fetch all recipients, newest first. */
export async function getRecipients(
  supabase: SupabaseClient
): Promise<DailyReportRecipient[]> {
  const { data } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []) as DailyReportRecipient[]
}

/** Fetch only active recipients (for n8n / email sending). */
export async function getActiveRecipients(
  supabase: SupabaseClient
): Promise<DailyReportRecipient[]> {
  const { data } = await supabase
    .from(TABLE)
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
  return (data ?? []) as DailyReportRecipient[]
}

/** Add a recipient. Validates email. Returns error if duplicate or invalid. */
export async function addRecipient(
  supabase: SupabaseClient,
  email: string,
  options?: Partial<RecipientInsert>
): Promise<{ data: DailyReportRecipient | null; error: Error | null }> {
  const normalized = email.trim().toLowerCase()
  if (!isValidEmail(normalized)) {
    return { data: null, error: new Error("Invalid email address") }
  }
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      email: normalized,
      send_mono: options?.send_mono ?? false,
      send_jato: options?.send_jato ?? false,
      send_helicoptero: options?.send_helicoptero ?? false,
      send_all: options?.send_all ?? false,
      active: options?.active ?? true,
    })
    .select()
    .single()
  if (error)
    return {
      data: null,
      error: new Error(error.message ?? "Failed to add recipient"),
    }
  return { data: data as DailyReportRecipient, error: null }
}

/** Update a recipient by id. If send_all is set true, others can be ignored by consumer. */
export async function updateRecipient(
  supabase: SupabaseClient,
  id: string,
  fields: RecipientUpdate
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(TABLE).update(fields).eq("id", id)
  return {
    error: error ? new Error(error.message ?? "Update failed") : null,
  }
}

/** Delete a recipient by id. */
export async function deleteRecipient(
  supabase: SupabaseClient,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  return {
    error: error ? new Error(error.message ?? "Delete failed") : null,
  }
}

/** Simple email validation. */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/** Send active recipients to n8n webhook (e.g. for sync on change). n8n can also fetch via GET /api/daily-report-recipients. */
export async function sendRecipientsToN8N(
  supabase: SupabaseClient,
  webhookUrl: string
): Promise<{ ok: boolean; error: Error | null }> {
  try {
    const recipients = await getActiveRecipients(supabase)
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipients),
    })
    if (!res.ok) {
      return { ok: false, error: new Error(`Webhook responded ${res.status}`) }
    }
    return { ok: true, error: null }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e : new Error(String(e)),
    }
  }
}
