"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { HistoricalFlightCard } from "./historical-flight-card"
import type { HistoricalFlight, TipoDetectado } from "@/types/database"
import { Loader2 } from "lucide-react"

const TIPO_OPTIONS: { value: "" | TipoDetectado; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "helicoptero", label: "Helicóptero" },
  { value: "mono", label: "Monomotor" },
  { value: "jato", label: "Jato" },
]

export function HistoricalFlightsTab() {
  const [flights, setFlights] = useState<HistoricalFlight[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoFilter, setTipoFilter] = useState<"" | TipoDetectado>("")

  const fetchFlights = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from("flights_history")
      .select("*")
      .order("archived_at", { ascending: false })

    if (tipoFilter) {
      query = query.eq("tipo_detectado", tipoFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      setFlights([])
    } else {
      setFlights(data ?? [])
    }
    setLoading(false)
  }, [tipoFilter])

  useEffect(() => {
    fetchFlights()
  }, [fetchFlights])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (flights.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-8 sm:p-12 text-center text-gray-600 text-sm">
        Nenhum voo cancelado encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* FILTER */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-600 self-center">
          Filtrar por tipo:
        </span>
        {TIPO_OPTIONS.map((opt) => (
          <button
            key={opt.value || "all"}
            onClick={() => setTipoFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tipoFilter === opt.value
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {flights.map((flight) => (
          <HistoricalFlightCard
            key={`${flight.flight_id}-${flight.archived_at}`}
            flight={flight}
          />
        ))}
      </div>
    </div>
  )
}
