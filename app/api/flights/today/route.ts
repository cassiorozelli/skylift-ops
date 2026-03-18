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

/** Normalize time to HH:mm */
function normalizeTime(hora: string | null): string {
  if (!hora) return "00:00"
  const parts = hora.trim().split(":")
  const h = (parts[0] ?? "0").padStart(2, "0")
  const m = (parts[1] ?? "0").padStart(2, "0")
  return `${h}:${m}`
}

/** Format pilot */
function formatPilot(
  piloto1: string | null | undefined,
  piloto2: string | null | undefined
): string {
  const p1 = (piloto1 ?? "").trim()
  const p2 = (piloto2 ?? "").trim()
  if (p1 && p2) return `${p1} / ${p2}`
  return p1 || p2 || ""
}

/** Map DB row to API response */
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
    aircraft: (f.prefixo ?? "").trim(),
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // ✅ DATA CORRETA NO FUSO DO BRASIL
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    })

    console.log("TODAY (BR):", today)

    const [monoRes, jatoRes, heliRes] = await Promise.all([
      supabase
        .from("mono_flights")
        .select(
          "id, data, hora, aeronave, prefixo, origem, destino_final, piloto1, piloto2, passageiros"
        )
        .eq("data", today)
        .eq("active", true),

      supabase
        .from("jato_flights")
        .select(
          "id, data, hora, aeronave, prefixo, origem, destino_final, piloto1, piloto2, passageiros"
        )
        .eq("data", today)
        .eq("active", true),

      supabase
        .from("helicoptero_flights")
        .select(
          "id, data, hora, aeronave, prefixo, origem, destino_final, piloto1, piloto2, passageiros"
        )
        .eq("data", today)
        .eq("active", true),
    ])

    // 🔍 DEBUG
    console.log("MONO:", monoRes.data?.length)
    console.log("JATO:", jatoRes.data?.length)
    console.log("HELI:", heliRes.data?.length)

    const monoFlights: TodayFlightItem[] = (monoRes.data ?? []).map((f) =>
      toItem(f as FlightRow, "mono", today)
    )

    const jatoFlights: TodayFlightItem[] = (jatoRes.data ?? []).map((f) =>
      toItem(f as FlightRow, "jato", today)
    )

    const helicopteroFlights: TodayFlightItem[] = (heliRes.data ?? []).map((f) =>
      toItem(f as FlightRow, "helicoptero", today)
    )

    const allFlights: TodayFlightItem[] = [
      ...monoFlights,
      ...jatoFlights,
      ...helicopteroFlights,
    ].sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json(allFlights)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}