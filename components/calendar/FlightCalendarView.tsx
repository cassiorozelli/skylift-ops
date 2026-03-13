"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { FlightEventCard, type CalendarFlight } from "./FlightEventCard"
import { FlightTimeline } from "./FlightTimeline"
import { useFlightDurations } from "./useFlightDurations"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Flight } from "@/types/database"

const TABLE_BY_CATEGORIA: Record<string, string> = {
  mono: "mono_flights",
  jato: "jato_flights",
  helicoptero: "helicoptero_flights",
}

const CATEGORIA_LABELS: Record<string, string> = {
  mono: "Monomotores",
  jato: "Jatos",
  helicoptero: "Helicópteros",
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase()
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseTimeToMinutes(timeStr: string): number {
  const raw = (timeStr ?? "00:00").trim().replace(/\s/g, "")
  if (!raw) return 0

  const match =
    raw.match(/^(\d{1,2})[:h]?(\d{2})?$/i) ??
    raw.match(/^(\d{2})(\d{2})$/)

  if (match) {
    const h = parseInt(match[1], 10)
    const m = parseInt(match[2] ?? "0", 10)
    return h * 60 + m
  }

  const parts = raw
    .replace(/\D/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length >= 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
  }

  if (parts.length === 1 && parts[0].length >= 3) {
    const p = parts[0]
    const h = parseInt(p.slice(0, -2), 10)
    const m = parseInt(p.slice(-2), 10)
    return h * 60 + m
  }

  return 0
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const startM = parseTimeToMinutes(timeStr ?? "00:00")
  const totalM = startM + minutes

  const nh = Math.floor(totalM / 60) % 24
  const nm = totalM % 60

  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`
}

function parseRouteOrigemDestino(
  flight: CalendarFlight
): { origem: string; destino: string } {
  const route = flight.trajeto ?? flight.destino ?? ""
  const s = (route ?? "").trim()

  if (!s) return { origem: "", destino: flight.destino ?? "" }

  const m = s.match(/(.+?)\s+(?:x|→|para)\s+(.+)/i)

  if (m) {
    return {
      origem: m[1].trim(),
      destino: m[2].trim(),
    }
  }

  return {
    origem: flight.origem ?? "",
    destino: flight.destino ?? s,
  }
}

/*
  DETECTOR DE CONFLITO CORRIGIDO
  Agora só calcula conflito se ambos os voos tiverem duração real
*/
function detectConflicts(flights: CalendarFlight[]): Set<string> {
  const conflicts = new Set<string>()

  for (let i = 0; i < flights.length; i++) {
    const a = flights[i]

    if (!a.aeronave?.trim()) continue
    if (!a.durationMinutes) continue

    const aStart = parseTimeToMinutes(a.hora ?? "00:00")
    const aEnd = aStart + a.durationMinutes

    const { destino: aDestino } = parseRouteOrigemDestino(a)

    for (let j = i + 1; j < flights.length; j++) {
      const b = flights[j]

      if (
        a.aeronave.trim().toUpperCase() !==
        b.aeronave?.trim().toUpperCase()
      ) continue

      if (!b.durationMinutes) continue

      const bStart = parseTimeToMinutes(b.hora ?? "00:00")
      const bEnd = bStart + b.durationMinutes

      const { origem: bOrigem } = parseRouteOrigemDestino(b)

      const sameLeg =
        aDestino?.trim().toUpperCase() ===
        bOrigem?.trim().toUpperCase()

      if (sameLeg) continue

      if (aStart < bEnd && aEnd > bStart) {
        conflicts.add(a.id)
        conflicts.add(b.id)
      }
    }
  }

  return conflicts
}

type Props = {
  categoria: "mono" | "jato" | "helicoptero"
}

export function FlightCalendarView({ categoria }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const [flights, setFlights] = useState<CalendarFlight[]>([])
  const [loading, setLoading] = useState(true)

  const { getDuration } = useFlightDurations()

  const table = TABLE_BY_CATEGORIA[categoria]

  const loadFlights = useCallback(async () => {
    if (!table) return

    setLoading(true)

    const dateKey = toDateKey(selectedDate)

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("active", true)
      .eq("data", dateKey)
      .order("hora", { ascending: true, nullsFirst: false })

    if (error) {
      console.error(error)
      setFlights([])
      setLoading(false)
      return
    }

    const raw = (data ?? []) as Flight[]

    const withDurations: CalendarFlight[] = await Promise.all(
      raw.map(async (f) => {

        const origem = (f as any)?.origem ?? ""
        const destino =
          (f as any)?.destino_final ??
          (f as any)?.destino ??
          ""

        const rota = origem
          ? `${origem} → ${destino}`
          : destino

        const manualDur = (f as any)?.tempo_voo
        const historicalDur = await getDuration(f.aeronave, rota)

        const dur =
          typeof manualDur === "number" && manualDur > 0
            ? manualDur
            : typeof historicalDur === "number" && historicalDur > 0
              ? historicalDur
              : undefined

        const durationMinutes = dur

        const eta =
          f.hora && durationMinutes
            ? addMinutesToTime(f.hora, durationMinutes)
            : undefined

        const trajeto =
          origem && destino
            ? `${origem} → ${destino}`
            : (f as any)?.trajeto ?? destino

        return {
          id: f.id,
          flight_id: f.flight_id,
          data: f.data,
          hora: f.hora,
          aeronave: f.aeronave,
          origem: origem || undefined,
          destino,
          passageiros: f.passageiros,
          trajeto: trajeto || undefined,
          eta,
          durationMinutes,
        }
      })
    )

    const conflictIds = detectConflicts(withDurations)

    const final = withDurations.map((f) => ({
      ...f,
      hasConflict: conflictIds.has(f.id),
    }))

    setFlights(final)
    setLoading(false)

  }, [table, selectedDate, getDuration])

  useEffect(() => {
    loadFlights()
  }, [loadFlights])

  const prevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }

  const nextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  const goToday = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    setSelectedDate(d)
  }

  const isToday =
    toDateKey(selectedDate) === toDateKey(new Date())

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between gap-2">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Voltar
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        {CATEGORIA_LABELS[categoria]} — {formatDisplayDate(selectedDate)}
      </h2>

      <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-2">

        <button onClick={prevDay} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>

        <button
          onClick={goToday}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            isToday ? "bg-primary text-white" : "hover:bg-gray-100"
          }`}
        >
          Hoje
        </button>

        <span className="text-sm font-medium text-gray-800 min-w-[120px] text-center">
          {formatDisplayDate(selectedDate)}
        </span>

        <button onClick={nextDay} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>

      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : flights.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-gray-600 text-sm">
          Nenhum voo para este dia.
        </div>
      ) : (
        <>
          <div className="block md:hidden space-y-3">
            {flights.map((flight) => (
              <FlightEventCard key={flight.id} flight={flight} />
            ))}
          </div>

          <div className="hidden md:block">
            <FlightTimeline flights={flights} />
          </div>
        </>
      )}
    </div>
  )
}