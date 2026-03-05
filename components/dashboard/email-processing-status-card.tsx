"use client"

import type { EmailProcessingStatus } from "@/types/database"

const CATEGORY_NAMES: Record<string, string> = {
  mono: "Monomotores",
  jato: "Jatos",
  helicoptero: "Helicópteros",
}

function formatLastEmailReceived(timestamp: string | null): string {
  if (!timestamp) return "—"
  try {
    const d = new Date(timestamp)
    const day = String(d.getDate()).padStart(2, "0")
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    const hour = String(d.getHours()).padStart(2, "0")
    const minute = String(d.getMinutes()).padStart(2, "0")
    return `${day} ${month} ${year} — ${hour}:${minute}`
  } catch {
    return "—"
  }
}

type Props = {
  tipo_operacao: string
  last_email_received: string | null
  last_email_subject?: string | null
  last_email_from?: string | null
}

export function EmailProcessingStatusCard({
  tipo_operacao,
  last_email_received,
  last_email_subject,
}: Props) {
  const categoryName = CATEGORY_NAMES[tipo_operacao] ?? tipo_operacao

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start gap-2">
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{categoryName}</p>
          <p className="text-sm text-gray-600">
            Last email processed: {formatLastEmailReceived(last_email_received)}
          </p>
          {last_email_subject && (
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {last_email_subject}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
