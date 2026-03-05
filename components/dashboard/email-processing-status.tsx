"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { EmailProcessingStatusCard } from "./email-processing-status-card"
import type { EmailProcessingStatus } from "@/types/database"
import { Loader2 } from "lucide-react"

const EXPECTED_CATEGORIES = ["mono", "jato", "helicoptero"] as const

export function EmailProcessingStatus() {
  const [statuses, setStatuses] = useState<EmailProcessingStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("email_processing_status")
        .select("*")

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
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Carregando status...</span>
      </div>
    )
  }

  const statusByTipo = new Map(statuses.map((s) => [s.tipo_operacao, s]))

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900">
        Email Processing Status
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {EXPECTED_CATEGORIES.map((tipo) => {
          const status = statusByTipo.get(tipo)
          return (
            <EmailProcessingStatusCard
              key={tipo}
              tipo_operacao={tipo}
              last_email_received={status?.last_email_received ?? null}
              last_email_subject={status?.last_email_subject ?? null}
              last_email_from={status?.last_email_from ?? null}
            />
          )
        })}
      </div>
    </div>
  )
}
