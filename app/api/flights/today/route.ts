import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import type { Flight } from "@/types/database"

type AircraftType = "mono" | "jato" | "helicoptero"

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

function normalizeTime(hora: string | null): string {
  if (!hora) return "00:00"
  const parts = hora.trim().split(":")
  const h = (parts[0] ?? "0").padStart(2, "0")
  const m = (parts[1] ?? "0").padStart(2, "0")
  return `${h}:${m}`
}

function formatPilot(
  piloto1: string | null | undefined,
  piloto2: string | null | undefined
): string {
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
    date: dateKey,
    time: normalizeTime(f.hora ?? null),
    aircraft_type: aircraftType,
    origin: (f.origem ?? "").trim(),
    destination: (f.destino_final ?? "").trim(),
    operator: "",
    pilot: formatPilot(f.piloto1, f.piloto2),
    passengers: (f.passageiros ?? "").trim(),
    aircraft: (f.aeronave ?? f.prefixo ?? "").trim(),
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // 🔥 pega a data direto do banco
    const { data: today, error } = await supabase.rpc("get_today")
    if (error) throw error

    const todayStr = String(today)

    // 🔥 intervalo do dia (resolve timestamp vs date)
    const start = todayStr + "T00:00:00"
    const end = todayStr + "T23:59:59"

    console.log("TODAY:", todayStr)
    console.log("START:", start)
    console.log("END:", end)

    const [monoRes, jatoRes, heliRes] = await Promise.all([
      supabase
        .from("mono_flights")
        .select("*")
        .gte("data", start)
        .lte("data", end)
        .eq("active", true),

      supabase
        .from("jato_flights")
        .select("*")
        .gte("data", start)
        .lte("data", end)
        .eq("active", true),

      supabase
        .from("helicoptero_flights")
        .select("*")
        .gte("data", start)
        .lte("data", end)
        .eq("active", true),
    ])

    console.log("MONO COUNT:", monoRes.data?.length)
    console.log("JATO COUNT:", jatoRes.data?.length)
    console.log("HELI COUNT:", heliRes.data?.length)

    if (monoRes.error) console.error("MONO ERROR:", monoRes.error)
    if (jatoRes.error) console.error("JATO ERROR:", jatoRes.error)
    if (heliRes.error) console.error("HELI ERROR:", heliRes.error)

    const monoFlights = (monoRes.data ?? []).map((f) =>
      toItem(f as FlightRow, "mono", todayStr)
    )

    const jatoFlights = (jatoRes.data ?? []).map((f) =>
      toItem(f as FlightRow, "jato", todayStr)
    )

    const helicopteroFlights = (heliRes.data ?? []).map((f) =>
      toItem(f as FlightRow, "helicoptero", todayStr)
    )

    const allFlights = [
      ...monoFlights,
      ...jatoFlights,
      ...helicopteroFlights,
    ].sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json(allFlights)
  } catch (e) {
    console.error("ERROR:", e)
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}