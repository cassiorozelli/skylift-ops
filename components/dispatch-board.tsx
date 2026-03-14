"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { getAircraftColor } from "@/components/calendar/aircraftColors"
import { AIRCRAFT_COLORS } from "@/components/calendar/aircraftColors"
import { parseRoute } from "@/components/calendar/useFlightDurations"
import type { Flight } from "@/types/database"
import { Loader2, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

const PIXELS_PER_MINUTE = 2
const MIN_FLIGHT_WIDTH = 80
const NO_DURATION_OFFSET = 90
const MARGIN_BEFORE_MINUTES = 30
const MARGIN_AFTER_MINUTES = 180

type FlightWithRoute = Flight & { origem?: string | null }

function timeToMinutes(time: string | null): number {
  if (!time) return 0
  const parts = time.trim().split(/[:\s]/).map(Number)
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  return h * 60 + m
}

function getRouteDisplay(flight: FlightWithRoute): string {
  const ext = flight as { origem?: string; destino?: string }
  if (ext.origem && ext.destino) {
    return `${ext.origem} → ${ext.destino}`
  }
  const { origem, destino } = parseRoute(flight.destino ?? "")
  if (origem && destino) return `${origem} → ${destino}`
  return flight.destino ?? "—"
}

function getOrigemDestino(flight: FlightWithRoute): { origem: string; destino: string } {
  const ext = flight as { origem?: string; destino?: string }
  if (ext.origem && (ext.destino || flight.destino)) {
    return { origem: ext.origem, destino: (ext.destino ?? flight.destino) ?? "" }
  }
  return parseRoute(flight.destino ?? "")
}

function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DispatchBoard() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [flights, setFlights] = useState<Flight[]>([])
  const [durations, setDurations] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)

  const loadFlights = useCallback(async () => {
    const dateKey = toDateKey(selectedDate)
    setLoading(true)
    const [monoRes, jatoRes, heliRes] = await Promise.all([
      supabase
        .from("mono_flights")
        .select("*")
        .eq("active", true)
        .eq("data", dateKey),
      supabase
        .from("jato_flights")
        .select("*")
        .eq("active", true)
        .eq("data", dateKey),
      supabase
        .from("helicoptero_flights")
        .select("*")
        .eq("active", true)
        .eq("data", dateKey),
    ])

    const merged: Flight[] = [
      ...(monoRes.data ?? []),
      ...(jatoRes.data ?? []),
      ...(heliRes.data ?? []),
    ].sort((a, b) => {
      const da = a.data ?? ""
      const db = b.data ?? ""
      if (da !== db) return da.localeCompare(db)
      return timeToMinutes(a.hora) - timeToMinutes(b.hora)
    })

    setFlights(merged)
    setLoading(false)
  }, [selectedDate])

  useEffect(() => {
    loadFlights()
  }, [loadFlights])

  useEffect(() => {
    if (flights.length === 0) return

    async function fetchDurations() {
      const { data } = await supabase
        .from("flight_durations")
        .select("aeronave, origem, destino, tempo_medio_minutos")

      const map = new Map<string, number>()
      for (const row of data ?? []) {
        const key = `${(row.aeronave ?? "").trim()}|${(row.origem ?? "").trim()}|${(row.destino ?? "").trim()}`
        const mins = Number(row.tempo_medio_minutos)
        if (mins > 0) map.set(key, mins)
      }
      setDurations(map)
    }

    fetchDurations()
  }, [flights.length])

  const groupedByAircraft = useMemo(() => {
    const groups = new Map<string, Flight[]>()

    for (const ac of Object.keys(AIRCRAFT_COLORS)) {
      groups.set(ac, [])
    }

    for (const f of flights) {
      const ac = (f.aeronave ?? "").trim().toUpperCase()
      if (!ac) continue
      if (!groups.has(ac)) groups.set(ac, [])
      groups.get(ac)!.push(f)
    }

    const sortedAircraft = Array.from(groups.keys()).sort()
    return Object.fromEntries(sortedAircraft.map((ac) => [ac, groups.get(ac) ?? []]))
  }, [flights])

  const getDurationMinutes = (flight: FlightWithRoute): number => {
    const a = (flight.aeronave ?? "").trim()
    const { origem, destino } = getOrigemDestino(flight)
    const key = `${a}|${origem}|${destino}`
    return durations.get(key) ?? 0
  }

  const timelineRange = useMemo(() => {
    const times = flights
      .map((f) => f.hora)
      .filter(Boolean)
      .map(timeToMinutes)
    const hasFlights = times.length > 0
    let startMinutes: number
    let endMinutes: number
    if (hasFlights) {
      const firstFlight = Math.min(...times)
      const lastFlight = Math.max(...times)
      startMinutes = firstFlight - MARGIN_BEFORE_MINUTES
      endMinutes = lastFlight + MARGIN_AFTER_MINUTES
    } else {
      startMinutes = 6 * 60
      endMinutes = 22 * 60
    }
    startMinutes = Math.floor(startMinutes / 60) * 60
    endMinutes = Math.ceil(endMinutes / 60) * 60
    const startHour = Math.floor(startMinutes / 60)
    const endHour = Math.ceil(endMinutes / 60)
    const totalMinutes = endMinutes - startMinutes
    const timelineWidth = totalMinutes * PIXELS_PER_MINUTE
    const hours = Array.from(
      { length: endHour - startHour + 1 },
      (_, i) => startHour + i
    )
    return { startMinutes, endMinutes, startHour, endHour, totalMinutes, timelineWidth, hours }
  }, [flights])

  const { startMinutes, endMinutes, timelineWidth, hours } = timelineRange

  const nowIndicator = useMemo(() => {
    const isToday = toDateKey(selectedDate) === toDateKey(new Date())
    if (!isToday) return null
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    if (nowMinutes < startMinutes || nowMinutes > endMinutes) return null
    const nowLeft = (nowMinutes - startMinutes) * PIXELS_PER_MINUTE
    return { nowLeft }
  }, [selectedDate, startMinutes, endMinutes])

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            const d = new Date(selectedDate)
            d.setDate(d.getDate() - 1)
            setSelectedDate(d)
          }}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            const d = new Date(selectedDate)
            d.setDate(d.getDate() + 1)
            setSelectedDate(d)
          }}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4" />
          {selectedDate.toLocaleDateString("pt-BR")}
        </div>
        <button
          onClick={() => {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            setSelectedDate(d)
          }}
          className="px-3 py-1 text-sm rounded border"
        >
          Hoje
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <div className="relative" style={{ width: timelineWidth }}>
        {/* Hour header */}
        <div
          className="grid border-b border-gray-200 bg-gray-50/80"
          style={{ gridTemplateColumns: "160px 1fr" }}
        >
          <div className="px-4 py-3 text-sm font-semibold text-gray-600">
            Aeronave
          </div>
          <div className="relative" style={{ width: timelineWidth }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 border-l border-gray-200 px-1 pt-2 text-xs text-gray-500"
                style={{
                  left: (h * 60 - startMinutes) * PIXELS_PER_MINUTE,
                }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {/* Aircraft rows */}
        {Object.entries(groupedByAircraft).map(([aircraft, list]) => (
          <div
            key={aircraft}
            className="grid border-b border-gray-100 last:border-b-0"
            style={{ gridTemplateColumns: "160px 1fr" }}
          >
            <div className="px-4 py-3 font-semibold text-sm text-gray-900">
              {aircraft}
            </div>
            <div
              className="relative h-16 overflow-visible"
              style={{ width: timelineWidth }}
            >
              {list.length === 0 ? (
                <div className="flex h-full items-center px-4 text-sm text-gray-400">
                  No flights for this day
                </div>
              ) : (
                <>
                  {(() => {
                    const withDuration = list.filter((f) => getDurationMinutes(f) > 0)
                    const withoutDuration = list
                      .filter((f) => getDurationMinutes(f) === 0)
                      .sort((a, b) => timeToMinutes(a.hora) - timeToMinutes(b.hora))
                    const baseLeftNoDuration =
                      withoutDuration.length > 0
                        ? (timeToMinutes(withoutDuration[0].hora) - startMinutes) *
                          PIXELS_PER_MINUTE
                        : 0
                    const isToday =
                      toDateKey(selectedDate) === toDateKey(new Date())
                    const now = new Date()
                    const nowMinutes =
                      now.getHours() * 60 + now.getMinutes()

                    return (
                      <>
                        {withDuration.map((flight) => {
                          const flightMinutes = timeToMinutes(flight.hora)
                          const minutesFromStart = flightMinutes - startMinutes
                          if (minutesFromStart < 0) return null

                          const durationMins = getDurationMinutes(flight)
                          const widthPx = durationMins * PIXELS_PER_MINUTE
                          const left = minutesFromStart * PIXELS_PER_MINUTE
                          if (
                            left + widthPx > timelineWidth &&
                            left > timelineWidth
                          )
                            return null

                          const colors = getAircraftColor(flight.aeronave)
                          const rota = getRouteDisplay(flight)
                          const hora = flight.hora ?? "—"

                          const start = flightMinutes
                          const end = start + durationMins
                          const inFlight =
                            isToday &&
                            nowMinutes >= start &&
                            nowMinutes <= end
                          const rawProgress =
                            ((nowMinutes - start) / durationMins) * 100
                          const progress = Math.max(
                            0,
                            Math.min(100, rawProgress)
                          )

                          return (
                            <div
                              key={flight.id}
                              className={`absolute top-2 bottom-2 rounded border-l-4 px-2 py-1.5 shadow-sm ${colors.border} ${colors.bg}${inFlight ? " ring-2 ring-green-500" : ""}`}
                              style={{
                                left: `${left}px`,
                                width: `${widthPx}px`,
                                minWidth: MIN_FLIGHT_WIDTH,
                              }}
                            >
                              <div className="text-xs font-medium text-gray-700">
                                {hora}
                              </div>
                              <div className="text-xs font-semibold text-gray-900 truncate">
                                {rota}
                              </div>
                              {flight.passageiros && (
                                <div className="text-xs text-gray-500 truncate mt-0.5">
                                  {flight.passageiros}
                                </div>
                              )}
                              {inFlight && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20 rounded-b overflow-hidden">
                                  <div
                                    className="h-full bg-green-600 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {withoutDuration.map((flight, index) => {
                          const baseLeft = baseLeftNoDuration
                          const left = baseLeft + index * NO_DURATION_OFFSET
                          if (left + MIN_FLIGHT_WIDTH > timelineWidth) return null

                          const colors = getAircraftColor(flight.aeronave)
                          const rota = getRouteDisplay(flight)
                          const hora = flight.hora ?? "—"

                          return (
                            <div
                              key={flight.id}
                              className={`absolute top-1/2 -translate-y-1/2 rounded border-l-4 px-2 shadow-sm h-7 text-xs flex items-center gap-1.5 min-w-0 ${colors.border} ${colors.bg}`}
                              style={{
                                left: `${left}px`,
                                width: `${MIN_FLIGHT_WIDTH}px`,
                              }}
                            >
                              <span className="font-medium text-gray-700 shrink-0">
                                [{hora}]
                              </span>
                              <span className="font-semibold text-gray-900 truncate">
                                {rota}
                              </span>
                            </div>
                          )
                        })}
                      </>
                    )
                  })()}
                </>
              )}
            </div>
          </div>
        ))}
        {nowIndicator && (
          <div
            className="absolute top-0 bottom-0 left-[160px] pointer-events-none z-10"
            style={{ width: timelineWidth }}
          >
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-red-500"
              style={{ left: nowIndicator.nowLeft }}
            />
            <div
              className="absolute -top-5 text-xs text-red-600 font-semibold"
              style={{ left: nowIndicator.nowLeft }}
            >
              NOW
            </div>
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  )
}
