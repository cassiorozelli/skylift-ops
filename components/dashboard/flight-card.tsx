"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { PilotModal } from "./pilot-modal"
import { PassengerModal } from "./passenger-modal"
import { supabase } from "@/lib/supabaseClient"
import type { Flight, FlightTable } from "@/types/database"

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

  return (
    <>
      <Card className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-t-xl border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">
            {dataFormatada}
          </span>
          <span className="text-lg font-semibold text-gray-900">{hora}</span>
        </div>

        {/* ROTA */}
        <div className="px-4 py-3">
          <h3 className="text-xl font-semibold text-gray-900">
            {aeronave} → {destino}
          </h3>
        </div>

        {/* AERONAVE */}
        <div className="px-4 pb-3 text-sm text-gray-600">
          Aeronave:{" "}
          <span className="font-medium text-gray-800">{aeronave}</span>
        </div>

        {/* PASSAGEIROS */}
        <button
          type="button"
          onClick={() => setPassengerOpen(true)}
          className={`w-full mx-4 mb-3 rounded-lg p-3 transition-colors text-left ${
            passengersHighlight ? "bg-[#FFF8CC]" : "bg-gray-50"
          } hover:bg-gray-100 border border-transparent hover:border-gray-200`}
        >
          <p className="text-sm font-semibold text-gray-700 mb-1">
            👥 Passageiros
          </p>
          {displayPassengers.length === 0 ? (
            <p className="text-sm text-gray-800">Clique para adicionar</p>
          ) : (
            <div className="space-y-0.5">
              {displayPassengers.slice(0, VISIBLE_COUNT).map((name, i) => (
                <p key={i} className="text-sm text-gray-800 truncate">
                  {name}
                </p>
              ))}
              {displayPassengers.length > VISIBLE_COUNT && (
                <p className="text-sm text-gray-600 font-medium">
                  +{displayPassengers.length - VISIBLE_COUNT}
                </p>
              )}
            </div>
          )}
        </button>

        {/* TRIPULAÇÃO - clicável para abrir modal */}
        <button
          type="button"
          onClick={() => setPilotOpen(true)}
          className={`w-full mx-4 mb-4 rounded-lg p-3 transition-colors text-left ${
            pilotsHighlight ? "bg-[#FFF8CC]" : "bg-gray-50"
          } hover:bg-gray-100 border border-transparent hover:border-gray-200`}
        >
          <p className="text-sm font-semibold text-gray-700 mb-2">
            👨‍✈️ Pilotos
          </p>
          <div className="space-y-0.5 text-sm text-gray-800">
            <p className="truncate">Piloto 1: {piloto1Display}</p>
            <p className="truncate">Piloto 2: {piloto2Display}</p>
          </div>
        </button>
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
