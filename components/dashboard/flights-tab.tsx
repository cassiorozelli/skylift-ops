"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { FlightCard } from "./flight-card"
import type { Flight, FlightTable } from "@/types/database"
import { Loader2, Calendar, Mail } from "lucide-react"

const TABLE_TO_TIPO: Record<FlightTable, string> = {
  mono_flights: "mono",
  jato_flights: "jato",
  helicoptero_flights: "helicoptero",
}

type Props = {
  table: FlightTable
}

export function FlightsTab({ table }: Props) {
  const tipoOperacao = TABLE_TO_TIPO[table]
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFlights = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("active", true)
      .order("data", { ascending: true })
      .order("hora", { ascending: true, nullsFirst: false })

    if (error) {
      console.error(error)
      setFlights([])
    } else {
      setFlights(data ?? [])
    }
    setLoading(false)
  }, [table])

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

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Link
          href="/dashboard/email-status"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Mail className="h-4 w-4" />
          E-mail Status
        </Link>
        <Link
          href={`/dashboard/calendario/${tipoOperacao}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Calendar className="h-4 w-4" />
          Calendário
        </Link>
      </div>

      {/* Active flights list */}
      {flights.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center text-muted-foreground text-sm">
          Nenhum voo encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              table={table}
              onUpdate={fetchFlights}
            />
          ))}
        </div>
      )}
    </div>
  )
}
