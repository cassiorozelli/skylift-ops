"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { PilotModal } from "./pilot-modal"
import { PassengerModal } from "./passenger-modal"
import { supabase } from "@/lib/supabaseClient"
import type { Flight, FlightTable } from "@/types/database"
import { Users, Plane, Pencil, Clock } from "lucide-react"

type Props = {
  flight: Flight
  table: FlightTable
  onUpdate: () => void
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

/* =========================
   CONVERSÕES DE TEMPO
========================= */

function hhmmToMinutes(value: string): number | null {
  if (!value || typeof value !== "string") return null
  const clean = value.replace(/\s/g, "").replace(":", "").trim()
  if (!/^\d+$/.test(clean)) return null
  if (clean.length >= 3) {
    const hours = parseInt(clean.slice(0, clean.length - 2), 10)
    const minutes = parseInt(clean.slice(-2), 10)
    if (minutes >= 60) return null
    return hours * 60 + minutes
  }
  return parseInt(clean, 10)
}

function minutesToHHMM(minutes: number): string {

  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`
}

export function FlightCard({ flight, table, onUpdate }: Props) {

  const [pilotOpen, setPilotOpen] = useState(false)
  const [passengerOpen, setPassengerOpen] = useState(false)

  const [flightDuration, setFlightDuration] = useState<number | null>(null)
  const [durationInput, setDurationInput] = useState("")
  const [editingDuration, setEditingDuration] = useState(false)

  const [flightPassengerNames, setFlightPassengerNames] = useState<string[]>([])
  const [pilot1Name, setPilot1Name] = useState<string | null>(null)
  const [pilot2Name, setPilot2Name] = useState<string | null>(null)

  const aeronaveRaw = (flight.aeronave || "").trim()
  const flightExt = flight as { origem?: string; destino_final?: string; destino?: string }
  const hasExplicitRoute = !!(flightExt.origem && (flightExt.destino_final || flightExt.destino))

  const parseRoute = (s: string) => {
    const t = (s ?? "").trim()
    if (!t) return { origem: "", destino: "" }
    const m = t.match(/(.+?)\s+(?:x|→|para)\s+(.+)/i)
    return m ? { origem: m[1].trim(), destino: m[2].trim() } : { origem: "", destino: t }
  }

  const { origem: parsedOrigem, destino: parsedDestino } = parseRoute(flightExt.destino ?? "")
  const origemRaw = hasExplicitRoute ? (flightExt.origem || "").trim() : parsedOrigem
  const destinoRaw = hasExplicitRoute
    ? (flightExt.destino_final || flightExt.destino || "").trim()
    : parsedDestino

  const origem = origemRaw || "—"
  const destinoFinal = destinoRaw || "—"
  const aeronave = aeronaveRaw || "—"

  const canShowDuration = !!(aeronaveRaw && origemRaw && destinoRaw)

  /* =========================
     BUSCAR TEMPO DE VOO
  ========================= */

  const fetchFlightDuration = useCallback(async () => {
    if (!canShowDuration) return

    // Prioridade: tempo_voo do voo específico > flight_durations
    const manualDuration = flight.tempo_voo
    if (manualDuration != null && manualDuration > 0) {
      setFlightDuration(manualDuration)
      setDurationInput(minutesToHHMM(manualDuration))
      return
    }

    const { data } = await supabase
      .from("flight_durations")
      .select("tempo_medio_minutos")
      .eq("aeronave", aeronaveRaw)
      .eq("origem", origemRaw)
      .eq("destino", destinoRaw)
      .maybeSingle()

    if (data) {
      setFlightDuration(data.tempo_medio_minutos)
      setDurationInput(minutesToHHMM(data.tempo_medio_minutos))
    } else {
      setFlightDuration(null)
      setDurationInput("")
    }
  }, [aeronaveRaw, origemRaw, destinoRaw, canShowDuration, flight.tempo_voo])

  /* =========================
     SALVAR TEMPO
  ========================= */

  const saveFlightDuration = async () => {

    const minutes = hhmmToMinutes(durationInput)
  
    if (!minutes || minutes <= 0) return
  
    try {
      const { error: updateError } = await supabase
        .from(table)
        .update({ tempo_voo: minutes })
        .eq("id", flight.id)

      if (updateError) {
        console.error("Erro ao atualizar tempo_voo no voo:", updateError)
        return
      }

      // 2️⃣ atualizar flight_durations (usar origem/destino corretos da rota parseada)
      await supabase
        .from("flight_durations")
        .upsert(
          {
            aeronave: aeronaveRaw,
            origem: origemRaw,
            destino: destinoRaw,
            tempo_medio_minutos: minutes,
          },
          { onConflict: "aeronave,origem,destino" }
        )
  
      setFlightDuration(minutes)
      setDurationInput(minutesToHHMM(minutes))
      setEditingDuration(false)
  
      onUpdate()
  
    } catch (error) {
      console.error("Erro salvando duração", error)
    }
  }

  /* =========================
     PASSAGEIROS
  ========================= */

  const fetchFlightPassengers = useCallback(async () => {

    const { data: links, error } = await supabase
      .from("flight_passengers")
      .select("passenger_id")
      .eq("flight_id", flight.id)
      .eq("flight_table", table)

    if (error || !links?.length) {
      setFlightPassengerNames([])
      return
    }

    const ids = links.map((l) => l.passenger_id)

    const { data: passData } = await supabase
      .from("passengers")
      .select("id, name")
      .in("id", ids)

    const nameMap = new Map((passData ?? []).map((p) => [p.id, p.name]))

    const names = ids
      .map((id) => nameMap.get(id))
      .filter((n): n is string => !!n)

    setFlightPassengerNames(names)

  }, [flight.id, table])

  /* =========================
     PILOTOS
  ========================= */

  const fetchPilotNames = useCallback(async () => {

    const ids = [flight.pilot_1_id, flight.pilot_2_id].filter(Boolean) as string[]

    if (!ids.length) {
      setPilot1Name(null)
      setPilot2Name(null)
      return
    }

    const { data } = await supabase
      .from("pilots")
      .select("id, name")
      .in("id", ids)

    const map = new Map((data ?? []).map((p) => [p.id, p.name]))

    setPilot1Name(
      flight.pilot_1_id ? map.get(flight.pilot_1_id) ?? null : null
    )

    setPilot2Name(
      flight.pilot_2_id ? map.get(flight.pilot_2_id) ?? null : null
    )

  }, [flight.pilot_1_id, flight.pilot_2_id])

  useEffect(() => {
    fetchFlightPassengers()
  }, [fetchFlightPassengers])

  useEffect(() => {
    fetchPilotNames()
  }, [fetchPilotNames])

  useEffect(() => {
    fetchFlightDuration()
  }, [fetchFlightDuration])

  const dataFormatada = formatDate(flight.data)
  const hora = flight.hora || "—"

  const passageirosLegacy = flight.passageiros || ""

  const piloto1Display =
    (pilot1Name ?? flight.piloto1?.trim()) || "—"

  const piloto2Display =
    (pilot2Name ?? flight.piloto2?.trim()) || "—"

  const hasPassengers =
    flightPassengerNames.length > 0 ||
    !!passageirosLegacy.trim()

  const hasPilots =
    piloto1Display !== "—" &&
    piloto2Display !== "—"

  const passengersHighlight = !hasPassengers
  const pilotsHighlight = !hasPilots
  const durationHighlight = !flightDuration

  const sectionBase =
    "w-full rounded-lg p-3.5 transition-all duration-150 text-left cursor-pointer border border-transparent hover:border-gray-300"

  const passengersSectionBg = passengersHighlight
    ? "bg-[#FFF8CC] hover:bg-[#FFF4B8]"
    : "bg-gray-50/80 hover:bg-gray-100"

  const pilotsSectionBg = pilotsHighlight
    ? "bg-[#FFF8CC] hover:bg-[#FFF4B8]"
    : "bg-gray-50/80 hover:bg-gray-100"

  const durationSectionBg = durationHighlight
    ? "bg-[#FFF8CC] hover:bg-[#FFF4B8]"
    : "bg-gray-50/80 hover:bg-gray-100"

  const displayPassengers =
    flightPassengerNames.length
      ? flightPassengerNames
      : passageirosLegacy
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean)

  return (
    <>
      <Card className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">

        {/* HEADER */}

        <div className="flex justify-between items-center px-4 pt-4 pb-1">
          <span className="text-sm font-medium text-gray-600">
            {dataFormatada}
          </span>

          <span className="text-sm font-medium text-gray-600">
            {hora}
          </span>
        </div>

        {/* ROTA */}

        <div className="px-4 py-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {origem} → {destinoFinal}
          </h3>
        </div>

        {/* AERONAVE */}

        <div className="px-4 pb-4 text-xs text-gray-500">
          Aeronave: {aeronave}
        </div>

        {/* SECTIONS */}
        <div className="px-4 pb-4 space-y-3">

        {/* TEMPO DE VOO */}
        {canShowDuration && (
          <div
            className={`group ${sectionBase} ${durationSectionBg} flex flex-col gap-2`}
            onClick={() => !editingDuration && setEditingDuration(true)}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600 shrink-0" />
              <span className="text-sm font-medium text-gray-700">
                Tempo estimado de voo
              </span>
              {!editingDuration && (
                <Pencil className="h-3 w-3 text-gray-400 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            {editingDuration ? (
              <div
                className="flex items-center gap-2 pl-6"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={durationInput}
                  placeholder="Ex: 0130 ou 01:30"
                  onChange={(e) => setDurationInput(e.target.value)}
                  onBlur={() => saveFlightDuration()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      saveFlightDuration()
                    }
                    if (e.key === "Escape") {
                      setEditingDuration(false)
                      fetchFlightDuration()
                    }
                  }}
                  className="text-sm border border-gray-200 rounded px-2 py-1 bg-white min-w-0"
                  autoFocus
                />
              </div>
            ) : (
              <p className="text-sm text-gray-800 pl-6">
                {flightDuration
                  ? minutesToHHMM(flightDuration)
                  : "Clique para adicionar"}
              </p>
            )}
          </div>
        )}

          {/* PASSAGEIROS */}

          <button
            onClick={() => setPassengerOpen(true)}
            className={`group ${sectionBase} ${passengersSectionBg}`}
          >

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />

              <span className="text-sm font-medium text-gray-700">
                Passageiros
              </span>
            </div>

            {displayPassengers.length === 0 ? (
              <p className="text-sm text-gray-500 pl-6">
                Clique para adicionar
              </p>
            ) : (
              displayPassengers.map((name,i) => (
                <p key={i} className="text-sm pl-6">{name}</p>
              ))
            )}

          </button>

          {/* PILOTOS */}

          <button
            onClick={() => setPilotOpen(true)}
            className={`group ${sectionBase} ${pilotsSectionBg}`}
          >

            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-gray-600" />

              <span className="text-sm font-medium text-gray-700">
                Pilotos
              </span>
            </div>

            <div className="pl-6 text-sm">
              <p>Piloto 1: {piloto1Display}</p>
              <p>Piloto 2: {piloto2Display}</p>
            </div>

          </button>

        </div>

      </Card>

      <PilotModal
        flight={flight}
        table={table}
        open={pilotOpen}
        onOpenChange={setPilotOpen}
        onSuccess={() => {
          fetchPilotNames()
          onUpdate()
        }}
      />

      <PassengerModal
        flight={flight}
        table={table}
        open={passengerOpen}
        onOpenChange={setPassengerOpen}
        onSuccess={() => {
          fetchFlightPassengers()
          onUpdate()
        }}
      />

    </>
  )
}