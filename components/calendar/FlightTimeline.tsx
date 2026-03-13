"use client"

import { FlightEventCard, type CalendarFlight } from "./FlightEventCard"

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6)

function timeToMinutes(timeStr: string): number {
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

  if (parts.length >= 2)
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)

  if (parts.length === 1 && parts[0].length >= 3) {
    const p = parts[0]
    return parseInt(p.slice(0, -2), 10) * 60 + parseInt(p.slice(-2), 10)
  }

  return 0
}

function getFlightPosition(
  flight: CalendarFlight
): { top: number; height: number } {

  const startM = timeToMinutes(flight.hora ?? "00:00")

  const startHour = 6
  const totalMinutes = (22 - startHour) * 60

  const top =
    ((startM - startHour * 60) / totalMinutes) * 100

  // duração real
  const duration = flight.durationMinutes

  // se não houver duração → bloco mínimo visual
  const height = duration
    ? Math.max((duration / totalMinutes) * 100, 4)
    : 4

  return { top, height }
}

function doOverlap(
  a: { top: number; height: number },
  b: { top: number; height: number }
): boolean {
  const aEnd = a.top + a.height
  const bEnd = b.top + b.height
  return a.top < bEnd && aEnd > b.top
}

type FlightWithLayout = CalendarFlight & {
  columnIndex: number
  columnCount: number
  top: number
  height: number
}

function computeFlightLayouts(flights: CalendarFlight[]): FlightWithLayout[] {
  if (flights.length === 0) return []

  const withPos = flights.map((f) => ({
    flight: f,
    ...getFlightPosition(f),
  }))

  withPos.sort((a, b) => a.top - b.top)

  const clusters: { flight: CalendarFlight; top: number; height: number }[][] = []

  for (const { flight, top, height } of withPos) {
    const overlapping: number[] = []
    for (let i = 0; i < clusters.length; i++) {
      const hasOverlap = clusters[i].some(
        (c) => doOverlap({ top, height }, { top: c.top, height: c.height })
      )
      if (hasOverlap) overlapping.push(i)
    }

    if (overlapping.length === 0) {
      clusters.push([{ flight, top, height }])
    } else if (overlapping.length === 1) {
      clusters[overlapping[0]].push({ flight, top, height })
    } else {
      const merged = overlapping.flatMap((i) => clusters[i])
      merged.push({ flight, top, height })
      const sortedIdx = [...overlapping].sort((a, b) => b - a)
      for (const i of sortedIdx) {
        clusters.splice(i, 1)
      }
      clusters.push(merged)
    }
  }

  const result: FlightWithLayout[] = []

  for (const cluster of clusters) {
    cluster.sort((a, b) => a.top - b.top)

    const columns: { end: number }[] = []
    const assignments: { flight: CalendarFlight; top: number; height: number; col: number }[] = []

    for (const { flight, top, height } of cluster) {
      const end = top + height
      let col = 0
      while (col < columns.length && columns[col].end > top) {
        col++
      }
      if (col === columns.length) {
        columns.push({ end })
      } else {
        columns[col].end = end
      }
      assignments.push({ flight, top, height, col })
    }

    const columnCount = columns.length
    for (const { flight, top, height, col } of assignments) {
      result.push({
        ...flight,
        columnIndex: col,
        columnCount,
        top,
        height,
      })
    }
  }

  return result
}

type Props = {
  flights: CalendarFlight[]
  onFlightClick?: (flight: CalendarFlight) => void
}

export function FlightTimeline({
  flights,
  onFlightClick,
}: Props) {
  const layouts = computeFlightLayouts(flights)

  return (
    <div className="relative">
      <div className="flex gap-4">

        <div className="w-16 shrink-0 space-y-0">
          {HOURS.map((h) => (
            <div
              key={h}
              className="h-12 flex items-start justify-end pr-2 text-xs text-gray-500"
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        <div className="flex-1 relative min-h-[600px]">

          {HOURS.slice(0, -1).map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{
                top: `${((h - 6) / 16) * 100}%`,
                height: "6.25%",
              }}
            />
          ))}

          {layouts.map((layout) => {
            const left = (layout.columnIndex / layout.columnCount) * 100
            const width = 100 / layout.columnCount

            return (
              <div
                key={layout.id}
                className="absolute"
                style={{
                  top: `${layout.top}%`,
                  height: `${layout.height}%`,
                  left: `${left}%`,
                  width: `${width}%`,
                  paddingRight: "8px",
                }}
              >
                <FlightEventCard
                  flight={layout}
                  onClick={() => onFlightClick?.(layout)}
                />
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}