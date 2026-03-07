"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { PilotModal } from "./pilot-modal"
import { PassengerModal } from "./passenger-modal"
import { supabase } from "@/lib/supabaseClient"
import type { Flight, FlightTable } from "@/types/database"
import { Users, Plane, Pencil } from "lucide-react"

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

export function FlightCard({ flight, table, onUpdate }: Props) {
  const [pilotOpen, setPilotOpen] = useState(false)
  const [passengerOpen, setPassengerOpen] = useState(false)
  const [flightPassengerNames, setFlightPassengerNames] = useState<string[]>([])
  const [pilot1Name, setPilot1Name] = useState<string | null>(null)
  const [pilot2Name, setPilot2Name] = useState<string | null>(null)

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

  const fetchPilotNames = useCallback(async () => {
    const ids = [flight.pilot_1_id, flight.pilot_2_id].filter(Boolean) as string[]
    if (ids.length === 0) {
      setPilot1Name(null)
      setPilot2Name(null)
      return
    }
    try {
      const { data } = await supabase
        .from("pilots")
        .select("id, name")
        .in("id", ids)
      const map = new Map((data ?? []).map((p) => [p.id, p.name]))
      setPilot1Name(flight.pilot_1_id ? map.get(flight.pilot_1_id) ?? null : null)
      setPilot2Name(flight.pilot_2_id ? map.get(flight.pilot_2_id) ?? null : null)
    } catch {
      setPilot1Name(null)
      setPilot2Name(null)
    }
  }, [flight.pilot_1_id, flight.pilot_2_id])

  useEffect(() => {
    fetchFlightPassengers()
  }, [fetchFlightPassengers])

  useEffect(() => {
    fetchPilotNames()
  }, [fetchPilotNames])

  const dataFormatada = formatDate(flight.data)
  const hora = flight.hora || "—"
  const aeronave = flight.aeronave || "—"
  const destino = flight.destino || "—"
  const passageirosLegacy = flight.passageiros || ""
  const piloto1Display =
    (pilot1Name ?? flight.piloto1?.trim()) || "—"
  const piloto2Display =
    (pilot2Name ?? flight.piloto2?.trim()) || "—"

  const hasDbPassengers = flightPassengerNames.length > 0
  const hasLegacyPassengers = !!passageirosLegacy?.trim()
  const hasPassengers = hasDbPassengers || hasLegacyPassengers
  const hasPilot1 = !!pilot1Name || !!flight.piloto1?.trim()
  const hasPilot2 = !!pilot2Name || !!flight.piloto2?.trim()
  const hasPilotsComplete = hasPilot1 && hasPilot2

  const passengersHighlight = !hasPassengers
  const pilotsHighlight = !hasPilotsComplete

  const displayPassengers = hasDbPassengers
    ? flightPassengerNames
    : passageirosLegacy
      ? passageirosLegacy.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      : []

  const VISIBLE_COUNT = 3

  const sectionBase =
    "w-full rounded-lg p-3.5 transition-all duration-150 text-left cursor-pointer border border-transparent hover:border-gray-300"

  const passengersSectionBg = passengersHighlight
    ? "bg-[#FFF8CC] hover:bg-[#FFF4B8]"
    : "bg-gray-50/80 hover:bg-gray-100"

  const pilotsSectionBg = pilotsHighlight
    ? "bg-[#FFF8CC] hover:bg-[#FFF4B8]"
    : "bg-gray-50/80 hover:bg-gray-100"

  return (
    <>
      <Card className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
        {/* HEADER: date left, time right */}
        <div className="flex justify-between items-center px-4 pt-4 pb-1">
          <span className="text-sm font-medium text-gray-600">
            {dataFormatada}
          </span>
          <span className="text-sm font-medium text-gray-600">{hora}</span>
        </div>

        {/* ROTA - main title */}
        <div className="px-4 py-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {aeronave} → {destino}
          </h3>
        </div>

        {/* AERONAVE - secondary */}
        <div className="px-4 pb-4 text-xs text-gray-500">
          Aeronave: {aeronave}
        </div>

        {/* SECTIONS */}
        <div className="px-4 pb-4 space-y-3">
          {/* Passageiros */}
          <button
            type="button"
            onClick={() => setPassengerOpen(true)}
            className={`group ${sectionBase} ${passengersSectionBg} flex flex-col gap-2`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600 shrink-0" />
              <span className="text-sm font-medium text-gray-700">
                Passageiros
              </span>
              <Pencil className="h-3 w-3 text-gray-400 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {displayPassengers.length === 0 ? (
              <p className="text-sm text-gray-500">Clique para adicionar</p>
            ) : (
              <div className="space-y-1 pl-6">
                {displayPassengers.slice(0, VISIBLE_COUNT).map((name, i) => (
                  <p key={i} className="text-sm text-gray-800 truncate">
                    {name}
                  </p>
                ))}
                {displayPassengers.length > VISIBLE_COUNT && (
                  <p className="text-sm text-gray-500 font-medium">
                    +{displayPassengers.length - VISIBLE_COUNT}
                  </p>
                )}
              </div>
            )}
          </button>

          {/* Pilotos */}
          <button
            type="button"
            onClick={() => setPilotOpen(true)}
            className={`group ${sectionBase} ${pilotsSectionBg} flex flex-col gap-2`}
          >
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-gray-600 shrink-0" />
              <span className="text-sm font-medium text-gray-700">Pilotos</span>
              <Pencil className="h-3 w-3 text-gray-400 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1 pl-6 text-sm text-gray-800">
              <p className="truncate">Piloto 1: {piloto1Display}</p>
              <p className="truncate">Piloto 2: {piloto2Display}</p>
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
