import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { sendRecipientsToN8N } from "@/lib/dailyReportRecipients"

/**
 * POST /api/n8n/sync-recipients
 * Pushes active recipients to n8n webhook (optional sync).
 * Requires x-api-key matching CRON_SECRET or N8N_CRON_SECRET.
 * Set N8N_WEBHOOK_URL in env to the webhook that receives the payload.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.N8N_CRON_SECRET
  const apiKey = request.headers.get("x-api-key")

  if (secret && apiKey !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_URL is not configured" },
      { status: 503 }
    )
  }

  try {
    const supabase = getSupabaseServer()
    const { ok, error } = await sendRecipientsToN8N(supabase, webhookUrl)
    if (!ok) {
      return NextResponse.json(
        { error: error?.message ?? "Webhook failed" },
        { status: 502 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
