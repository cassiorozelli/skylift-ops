"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { EmailProcessingStatus } from "@/types/database"
import { Loader2 } from "lucide-react"

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
  tipoOperacao: string
}

export function EmailProcessingStatusForTab({ tipoOperacao }: Props) {
  const [status, setStatus] = useState<EmailProcessingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("email_processing_status")
        .select("*")
        .eq("tipo_operacao", tipoOperacao)
        .maybeSingle()

      if (error) {
        console.error(error)
        setStatus(null)
      } else {
        setStatus(data)
      }
      setLoading(false)
    }

    fetchStatus()
  }, [tipoOperacao])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Carregando status...</span>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Email Status
      </p>
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-green-500"
          aria-hidden
        />
        <p className="text-sm text-gray-700">
          Last email processed: {formatLastEmailReceived(status?.last_email_received ?? null)}
        </p>
      </div>
      {status?.last_email_subject && (
        <p className="mt-1.5 truncate text-xs text-gray-500 pl-4">
          {status.last_email_subject}
        </p>
      )}
    </div>
  )
}
