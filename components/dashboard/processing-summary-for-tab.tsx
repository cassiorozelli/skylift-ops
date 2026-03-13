"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { ProcessingSummaryCard } from "./processing-summary-card"
import type { EmailProcessingStatus } from "@/types/database"
import { Loader2 } from "lucide-react"

type Props = {
  tipoOperacao: string
}

export function ProcessingSummaryForTab({ tipoOperacao }: Props) {
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
        <span className="text-sm text-gray-500">Carregando resumo...</span>
      </div>
    )
  }

  const added = status?.last_added ?? 0
  const updated = status?.last_updated ?? 0
  const cancelled = status?.last_cancelled ?? 0

  return (
    <ProcessingSummaryCard added={added} updated={updated} cancelled={cancelled} />
  )
}
