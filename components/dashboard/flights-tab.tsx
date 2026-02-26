"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { FlightCard } from "./flight-card"
import type { Flight, FlightTable } from "@/types/database"
import { Loader2 } from "lucide-react"

type Props = {
  table: FlightTable
}

export function FlightsTab({ table }: Props) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFlights = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select("*")
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (flights.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        Nenhum voo encontrado.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          table={table}
          onUpdate={fetchFlights}
        />
      ))}
    </div>
  )
}
