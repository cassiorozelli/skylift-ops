"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { HistoricalFlightCard } from "./historical-flight-card"
import type { HistoricalFlight, TipoDetectado } from "@/types/database"
import { Loader2 } from "lucide-react"

const MONTHS = [
  { value: "", label: "Todos" },
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
]

function getMonthRange(
  year: number,
  month: number
): { startDate: string; endDate: string } | { startDate: null; endDate: null } {
  if (month > 0) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 1)
    const startDate = start.toISOString().slice(0, 10)
    const endDate = end.toISOString().slice(0, 10)
    return { startDate, endDate }
  }
  if (year > 0) {
    const startDate = `${year}-01-01`
    const endDate = `${year + 1}-01-01`
    return { startDate, endDate }
  }
  return { startDate: null, endDate: null }
}

function getYears(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear()
  const years = [{ value: "", label: "Todos" }]
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push({ value: String(y), label: String(y) })
  }
  return years
}

const YEARS = getYears()

type HistoricalFlightsTabProps = {
  categoria?: TipoDetectado
}

export function HistoricalFlightsTab({ categoria = "mono" }: HistoricalFlightsTabProps) {
  const [monthFilter, setMonthFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")

  return (
    <div className="space-y-6">
      {/* FILTROS DE MÊS E ANO */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label
            htmlFor="month-filter"
            className="block text-sm font-medium text-gray-600"
          >
            Mês
          </label>
          <select
            id="month-filter"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-10 min-w-[160px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {MONTHS.map((m) => (
              <option key={m.value || "all"} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="year-filter"
            className="block text-sm font-medium text-gray-600"
          >
            Ano
          </label>
          <select
            id="year-filter"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-10 min-w-[120px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {YEARS.map((y) => (
              <option key={y.value || "all"} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <HistoricalFlightsContent
        tipoOperacao={categoria}
        monthFilter={monthFilter}
        yearFilter={yearFilter}
      />
    </div>
  )
}

function HistoricalFlightsContent({
  tipoOperacao,
  monthFilter,
  yearFilter,
}: {
  tipoOperacao: TipoDetectado
  monthFilter: string
  yearFilter: string
}) {
  const [flights, setFlights] = useState<HistoricalFlight[]>([])
  const [loading, setLoading] = useState(true)

  const loadFlights = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from("flights_history")
      .select("*")
      .eq("tipo_detectado", tipoOperacao)
      .order("archived_at", { ascending: false })
      .limit(200)

    if (monthFilter || yearFilter) {
      const year = yearFilter ? parseInt(yearFilter, 10) : new Date().getFullYear()
      const month = monthFilter ? parseInt(monthFilter, 10) : 0

      const { startDate, endDate } = getMonthRange(year, month)

      if (startDate && endDate) {
        query = query.gte("data", startDate).lt("data", endDate)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro carregando histórico:", error)
      setFlights([])
    } else {
      setFlights(data || [])
    }
    setLoading(false)
  }, [tipoOperacao, monthFilter, yearFilter])

  useEffect(() => {
    loadFlights()
  }, [loadFlights])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Carregando voos históricos...
        </span>
      </div>
    )
  }

  if (flights.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-8 sm:p-12 text-center text-gray-600 text-sm">
        Nenhum voo histórico encontrado.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {flights.map((flight) => (
        <HistoricalFlightCard
          key={flight.id ?? `${flight.flight_id}-${flight.archived_at}`}
          flight={flight}
        />
      ))}
    </div>
  )
}
