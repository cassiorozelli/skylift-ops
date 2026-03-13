"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { EmailProcessingStatus } from "@/types/database"
import { Loader2 } from "lucide-react"

function formatTimestampBrazil(timestamp: string | null): string {
  if (!timestamp) return "—"
  try {
    return new Date(timestamp).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  // Hide block if no record exists
  if (!status) {
    return null
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500"
          aria-hidden
        />
        <p className="text-sm font-semibold text-gray-900">
          Último email processado
        </p>
      </div>
      <div className="space-y-1.5 text-sm text-gray-700 pl-5">
        <p>
          <span className="font-medium text-gray-600">Assunto:</span>{" "}
          <span className="text-gray-900">
            {status.last_email_subject || "—"}
          </span>
        </p>
        <p>
          <span className="font-medium text-gray-600">Enviado por:</span>{" "}
          {status.last_email_from ? (
            <a
              href={`mailto:${status.last_email_from}`}
              className="text-blue-600 hover:underline"
            >
              {status.last_email_from}
            </a>
          ) : (
            "—"
          )}
        </p>
        <p>
          <span className="font-medium text-gray-600">Recebido:</span>{" "}
          {formatTimestampBrazil(status.last_email_received)}
        </p>
        <p>
          <span className="font-medium text-gray-600">Processado:</span>{" "}
          {formatTimestampBrazil(status.last_processed_at)}
        </p>
      </div>
    </div>
  )
}
