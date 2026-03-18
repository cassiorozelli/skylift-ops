import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import type { Flight } from "@/types/database"

const BRAZIL_TZ = "America/Sao_Paulo"

type AircraftType = "mono" | "jato" | "helicoptero"

export type TodayFlightItem = {
  date: string
  time: string
  aircraft_type: AircraftType
  origin: string
  destination: string
  operator: string
  pilot: string
}

/** Parse "CGP x GIG", "CGP - GIG", "CGP → GIG" into { origin, destination }. Normalize separators to "x". */
function parseRoute(destino: string | null): { origin: string; destination: string } {
  const r = (destino ?? "").trim()
  if (!r) return { origin: "", destination: "" }
  const normalized = r.replace(/\s*→\s*/g, " x ").replace(/\s*-\s*/g, " x ")
  const match = normalized.match(/^(.+?)\s+x\s+(.+)$/i)
  if (match) {
    return {
      origin: (match[1] ?? "").trim(),
      destination: (match[2] ?? "").trim(),
    }
  }
  return { origin: "", destination: r }
}

/** Normalize time to HH:mm. */
function normalizeTime(hora: string | null): string {
  if (!hora) return "00:00"
  const parts = (hora.trim().split(":") as [string, string?])
  const h = (parts[0] ?? "0").padStart(2, "0")
  const m = (parts[1] ?? "0").padStart(2, "0")
  return `${h}:${m}`
}

/** Today's date in Brazil (YYYY-MM-DD). */
function getTodayBrazil(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: BRAZIL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

function formatPilot(piloto1: string | null | undefined, piloto2: string | null | undefined): string {
  const p1 = (piloto1 ?? "").trim()
  const p2 = (piloto2 ?? "").trim()
  if (p1 && p2) return `${p1} / ${p2}`
  return p1 || p2 || ""
}

function toItem(
  f: Flight,
  aircraftType: AircraftType,
  dateKey: string
): TodayFlightItem {
  const { origin, destination } = parseRoute(f.destino ?? null)
  return {
    date: dateKey ?? "",
    time: normalizeTime(f.hora ?? null),
    aircraft_type: aircraftType,
    origin: origin || "",
    destination: destination || "",
    operator: "",
    pilot: formatPilot(f.piloto1, f.piloto2),
  }
}

/**
 * GET /api/flights/today
 * Returns today's flights (Brazil timezone) from mono, jato, helicoptero.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const dateKey = getTodayBrazil()

    const [monoRes, jatoRes, heliRes] = await Promise.all([
      supabase
        .from("mono_flights")
        .select("id, data, hora, aeronave, destino, piloto1, piloto2, passageiros")
        .eq("data", dateKey)
        .eq("active", true),
      supabase
        .from("jato_flights")
        .select("id, data, hora, aeronave, destino, piloto1, piloto2, passageiros")
        .eq("data", dateKey)
        .eq("active", true),
      supabase
        .from("helicoptero_flights")
        .select("id, data, hora, aeronave, destino, piloto1, piloto2, passageiros")
        .eq("data", dateKey)
        .eq("active", true),
    ])

    const mono = ((monoRes.data ?? []) as Flight[]).map((f) =>
      toItem(f, "mono", dateKey)
    )
    const jato = ((jatoRes.data ?? []) as Flight[]).map((f) =>
      toItem(f, "jato", dateKey)
    )
    const helicoptero = ((heliRes.data ?? []) as Flight[]).map((f) =>
      toItem(f, "helicoptero", dateKey)
    )

    const all: TodayFlightItem[] = [...mono, ...jato, ...helicoptero].sort(
      (a, b) => a.time.localeCompare(b.time)
    )

    return NextResponse.json(all)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
