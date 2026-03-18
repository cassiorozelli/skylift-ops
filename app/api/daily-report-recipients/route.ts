import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getActiveRecipients } from "@/lib/dailyReportRecipients"
import type { DailyReportRecipient } from "@/types/database"

export type DailyReportRecipientItem = {
  email: string
  categories: string[]
}

const CATEGORY_MONO = "mono"
const CATEGORY_JATO = "jato"
const CATEGORY_HELICOPTERO = "helicoptero"
const CATEGORY_ALL = "all"

/** Map one DB row to categories array. */
function rowToCategories(r: DailyReportRecipient): string[] {
  if (r.send_all) return [CATEGORY_ALL]
  const list: string[] = []
  if (r.send_mono) list.push(CATEGORY_MONO)
  if (r.send_jato) list.push(CATEGORY_JATO)
  if (r.send_helicoptero) list.push(CATEGORY_HELICOPTERO)
  return list
}

/** Merge categories: unique list; if "all" present, result is ["all"]. */
function mergeCategories(arrays: string[][]): string[] {
  const set = new Set<string>()
  for (const arr of arrays) {
    for (const c of arr) set.add(c)
  }
  const list = Array.from(set)
  return list.includes(CATEGORY_ALL) ? [CATEGORY_ALL] : list
}

/** Build final list: merge by email, drop empty categories, sort by email. */
function buildResponse(recipients: DailyReportRecipient[]): DailyReportRecipientItem[] {
  const byEmail = new Map<string, string[][]>()
  for (const r of recipients) {
    const categories = rowToCategories(r)
    const key = (r.email ?? "").trim().toLowerCase()
    if (!key) continue
    if (!byEmail.has(key)) byEmail.set(key, [])
    byEmail.get(key)!.push(categories)
  }

  const result: DailyReportRecipientItem[] = []
  Array.from(byEmail.entries()).forEach(([email, categoryArrays]) => {
    const categories = mergeCategories(categoryArrays)
    if (categories.length === 0) return
    result.push({ email, categories })
  })
  result.sort((a, b) => a.email.localeCompare(b.email))
  return result
}

/**
 * GET /api/daily-report-recipients
 * Returns active recipients for n8n (daily cron).
 * - One entry per email (merged if duplicates); categories unique; ["all"] overrides others.
 * - Excludes entries with empty categories. Sorted by email.
 * Secured by x-api-key header matching CRON_SECRET or N8N_CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.N8N_CRON_SECRET
  const apiKey = request.headers.get("x-api-key")

  if (secret && apiKey !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabaseServer()
    const recipients = await getActiveRecipients(supabase)
    const body = buildResponse(recipients)
    return NextResponse.json(body)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
