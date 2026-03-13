"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { EmailProcessingStatus } from "@/types/database"
import { Loader2 } from "lucide-react"
import Link from "next/link"

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

const TIPO_LABELS: Record<string, string> = {
  mono: "Monomotores",
  jato: "Jatos",
  helicoptero: "Helicópteros",
}

export default function EmailStatusPage() {
  const [statuses, setStatuses] = useState<EmailProcessingStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("email_processing_status")
        .select("*")
        .order("last_processed_at", { ascending: false, nullsFirst: false })

      if (error) {
        console.error(error)
        setStatuses([])
      } else {
        setStatuses(data ?? [])
      }
      setLoading(false)
    }

    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          Último e-mail processado
        </h1>
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Voltar ao dashboard
        </Link>
      </div>

      {statuses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center">
          <p className="text-sm text-gray-600">
            Nenhum e-mail processado ainda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {statuses.map((status) => (
            <div
              key={status.tipo_operacao}
              className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />
                <p className="text-sm font-semibold text-gray-900">
                  {TIPO_LABELS[status.tipo_operacao] ?? status.tipo_operacao}
                </p>
              </div>

              <div className="space-y-1.5 text-sm text-gray-700 pl-5">
                <p>
                  <span className="font-medium text-gray-600">Assunto:</span>{" "}
                  {status.last_email_subject || "—"}
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
                  <span className="font-medium text-gray-600">
                    Processado em:
                  </span>{" "}
                  {formatTimestampBrazil(status.last_processed_at)}
                </p>
              </div>

              <div className="my-4 border-t border-gray-200" />

              <p className="text-sm font-semibold text-gray-900 mb-2">
                Resumo do processamento
              </p>
              <div className="space-y-1.5 text-sm text-gray-700 pl-0">
                <p>
                  Voos adicionados:{" "}
                  <span className="font-medium text-gray-900">
                    {status.last_added ?? 0}
                  </span>
                </p>
                <p>
                  Voos atualizados:{" "}
                  <span className="font-medium text-gray-900">
                    {status.last_updated ?? 0}
                  </span>
                </p>
                <p>
                  Voos cancelados:{" "}
                  <span className="font-medium text-gray-900">
                    {status.last_cancelled ?? 0}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
