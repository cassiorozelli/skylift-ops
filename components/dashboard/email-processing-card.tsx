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
  tipoOperacao: "mono" | "jato" | "helicoptero"
}

export function EmailProcessingCard({ tipoOperacao }: Props) {
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
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          <span className="text-sm text-gray-500">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-gray-600">
          Nenhum e-mail processado ainda para esta categoria.
        </p>
      </div>
    )
  }

  const added = status.last_added ?? 0
  const updated = status.last_updated ?? 0
  const cancelled = status.last_cancelled ?? 0

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      {/* Título */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500"
          aria-hidden
        />
        <p className="text-sm font-semibold text-gray-900">
          Último e-mail processado
        </p>
      </div>

      {/* Informações do e-mail */}
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
          <span className="font-medium text-gray-600">Processado em:</span>{" "}
          {formatTimestampBrazil(status.last_processed_at)}
        </p>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-gray-200" />

      {/* Resumo do processamento */}
      <p className="text-sm font-semibold text-gray-900 mb-2">
        Resumo do processamento
      </p>
      <div className="space-y-1.5 text-sm text-gray-700 pl-0">
        <p>
          Voos adicionados:{" "}
          <span className="font-medium text-gray-900">{added}</span>
        </p>
        <p>
          Voos atualizados:{" "}
          <span className="font-medium text-gray-900">{updated}</span>
        </p>
        <p>
          Voos cancelados:{" "}
          <span className="font-medium text-gray-900">{cancelled}</span>
        </p>
      </div>
    </div>
  )
}
