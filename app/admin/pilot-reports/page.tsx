"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import type { Flight } from "@/types/database"

type PilotRow = {
  id: string
  name: string
}

type FlightRow = {
  data: string
  destino: string | null
  aeronave: string | null
  hora: string | null
  tempo_voo?: number | null
  tipo: string
}

function parseRoute(destino: string | null): string {
  if (!destino) return "—"
  const m = destino.match(/(.+?)\s+(?:x|→|para)\s+(.+)/i)
  return m ? `${m[1].trim()} → ${m[2].trim()}` : destino
}

function formatDate(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  } catch {
    return d
  }
}

function formatMinutes(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h}:${String(min).padStart(2, "0")}`
}

const TABLES = [
  { table: "mono_flights" as const, label: "mono" },
  { table: "jato_flights" as const, label: "jato" },
  { table: "helicoptero_flights" as const, label: "helicoptero" },
]

export default function PilotReportsPage() {
  const [pilots, setPilots] = useState<PilotRow[]>([])
  const [flights, setFlights] = useState<FlightRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPilot, setSelectedPilot] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [tipoFilter, setTipoFilter] = useState<"mono" | "jato" | "helicoptero" | "all">(
    "all"
  )

  useEffect(() => {
    supabase
      .from("pilots")
      .select("id, name")
      .order("name")
      .then(({ data }) => setPilots((data ?? []) as PilotRow[]))
  }, [])

  const runReport = async () => {
    if (!selectedPilot) return
    setLoading(true)
    const from = dateFrom || "1900-01-01"
    const to = dateTo || "2100-12-31"

    const tablesToQuery =
      tipoFilter === "all"
        ? TABLES
        : TABLES.filter((t) => t.label === tipoFilter)

    const allFlights: FlightRow[] = []

    for (const { table, label } of tablesToQuery) {
      const { data } = await supabase
        .from(table)
        .select("data, destino, aeronave, hora, tempo_voo")
        .or(`pilot_1_id.eq.${selectedPilot},pilot_2_id.eq.${selectedPilot}`)
        .gte("data", from)
        .lte("data", to)
        .order("data", { ascending: true })
        .order("hora", { ascending: true, nullsFirst: false })

      for (const f of data ?? []) {
        allFlights.push({
          data: (f as Flight).data,
          destino: (f as Flight).destino,
          aeronave: (f as Flight).aeronave,
          hora: (f as Flight).hora,
          tempo_voo: (f as Flight).tempo_voo,
          tipo: label,
        })
      }
    }

    allFlights.sort((a, b) => {
      const da = a.data ?? ""
      const db = b.data ?? ""
      if (da !== db) return da.localeCompare(db)
      return (a.hora ?? "").localeCompare(b.hora ?? "")
    })

    setFlights(allFlights)
    setLoading(false)
  }

  const totalMinutes = flights.reduce(
    (acc, f) => acc + (f.tempo_voo ?? 0),
    0
  )

  const pilotName = pilots.find((p) => p.id === selectedPilot)?.name ?? "—"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Pilot Reports</h1>
      <p className="text-gray-600">
        Calculate pilot daily allowance reports by date range and aircraft type.
      </p>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilot
          </label>
          <select
            value={selectedPilot}
            onChange={(e) => setSelectedPilot(e.target.value)}
            className="h-10 rounded-md border border-gray-200 px-3 text-sm min-w-[180px]"
          >
            <option value="">Select pilot</option>
            {pilots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={tipoFilter}
            onChange={(e) =>
              setTipoFilter(e.target.value as "mono" | "jato" | "helicoptero" | "all")
            }
            className="h-10 rounded-md border border-gray-200 px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="mono">Mono</option>
            <option value="jato">Jato</option>
            <option value="helicoptero">Helicoptero</option>
          </select>
        </div>
        <Button onClick={runReport} disabled={!selectedPilot}>
          Run
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : flights.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Aircraft
                  </th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">{formatDate(f.data)}</td>
                    <td className="px-4 py-3">{parseRoute(f.destino)}</td>
                    <td className="px-4 py-3">{f.aeronave ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-sm font-medium text-gray-700">
            <p>Pilot: {pilotName}</p>
            <p>Flights: {flights.length}</p>
            <p>
              Flight hours:{" "}
              {totalMinutes > 0
                ? formatMinutes(totalMinutes)
                : "— (no duration data)"}
            </p>
          </div>
        </div>
      ) : selectedPilot ? (
        <p className="text-gray-500 text-sm">No flights found.</p>
      ) : null}
    </div>
  )
}
