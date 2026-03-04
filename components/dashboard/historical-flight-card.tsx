"use client"

import { Card } from "@/components/ui/card"
import type { HistoricalFlight } from "@/types/database"
import { XCircle } from "lucide-react"

type Props = {
  flight: HistoricalFlight
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function formatArchivedAt(archivedAt: string) {
  try {
    const d = new Date(archivedAt)
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return archivedAt
  }
}

export function HistoricalFlightCard({ flight }: Props) {
  const dataFormatada = formatDate(flight.data)
  const hora = flight.hora || "—"
  const aeronave = flight.aeronave || "—"
  const destino = flight.destino || "—"
  const passageiros = flight.passageiros || "—"

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-red-200 bg-gray-50/80 shadow-sm hover:shadow-md transition-all">
      {/* CANCELLED BADGE */}
      <div className="flex items-center justify-between bg-red-50 px-4 py-2.5 border-b border-red-100">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700">
          <XCircle className="h-4 w-4" />
          CANCELADO
        </span>
        <span className="text-xs text-red-600">
          Cancelado às {formatArchivedAt(flight.archived_at)}
        </span>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center bg-gray-100 px-4 py-3 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-700">{dataFormatada}</span>
        <span className="text-lg font-semibold text-gray-700">{hora}</span>
      </div>

      {/* HEADER - flight date & time */}
      <div className="flex justify-between items-center bg-gray-100 px-4 py-3 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-700">{dataFormatada}</span>
        <span className="text-lg font-semibold text-gray-700">{hora}</span>
      </div>

      {/* DESTINATION (main) */}
      <div className="px-4 py-3">
        <h3 className="text-xl font-semibold text-gray-800">{destino}</h3>
      </div>

      {/* PASSAGEIROS */}
      <div className="bg-gray-100/80 mx-4 mb-3 rounded-lg p-3">
        <p className="text-sm font-semibold text-gray-600 mb-1">👥 Passageiros</p>
        <p className="text-sm text-gray-700 break-words">{passageiros}</p>
      </div>

      {/* AIRCRAFT */}
      <div className="px-4 pb-4">
        <p className="text-sm text-gray-600">
          Aeronave: <span className="font-medium text-gray-700">{aeronave}</span>
        </p>
      </div>
    </Card>
  )
}
