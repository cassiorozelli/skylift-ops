import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import type { Flight } from "@/types/database"

const BRAZIL_TZ = "America/Sao_Paulo"

type AircraftType = "mono" | "jato" | "helicoptero"

/** Flight row with optional DB fields origem / destino_final / prefixo */
type FlightRow = Flight & {
  origem?: string | null
  destino_final?: string | null
  prefixo?: string | null
}

export type TodayFlightItem = {
  date: string
  time: string
  aircraft_type: AircraftType
  origin: string
  destination: string
  operator: string
  pilot: string
  passengers: string
  aircraft: string
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
  f: FlightRow,
  aircraftType: AircraftType,
  dateKey: string
): TodayFlightItem {
  return {
    date: (dateKey ?? "").trim() || "",
    time: normalizeTime(f.hora ?? null),
    aircraft_type: aircraftType,
    origin: (f.origem ?? "").trim(),
    destination: (f.destino_final ?? "").trim(),
    operator: "",
    pilot: formatPilot(f.piloto1, f.piloto2),
    passengers: (f.passageiros ?? "").trim(),
    aircraft: (f.prefixo ?? "").trim(),
  }
}

/**
 * GET /api/flights/today
 * Returns today's flights (Brazil timezone) from mono, jato, helicoptero.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // TEMPORARY: no date filter — fetch all active flights to verify Supabase fetch
    const [monoRes, jatoRes, heliRes] = await Promise.all([
      supabase
        .from("mono_flights")
        .select("id, data, hora, aeronave, prefixo, origem, destino_final, piloto1, piloto2, passageiros")
        .eq("active", true),
      supabase
        .from("jato_flights")
        .select("id, data, hora, aeronave, prefixo, origem, destino_final, piloto1, piloto2, passageiros")
        .eq("active", true),
      supabase
        .from("helicoptero_flights")
        .select("id, data, hora, aeronave, prefixo, origem, destino_final, piloto1, piloto2, passageiros")
        .eq("active", true),
    ])

    const mono = ((monoRes.data ?? []) as FlightRow[]).map((f) =>
      toItem(f, "mono", f.data ?? "")
    )
    const jato = ((jatoRes.data ?? []) as FlightRow[]).map((f) =>
      toItem(f, "jato", f.data ?? "")
    )
    const helicoptero = ((heliRes.data ?? []) as FlightRow[]).map((f) =>
      toItem(f, "helicoptero", f.data ?? "")
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
