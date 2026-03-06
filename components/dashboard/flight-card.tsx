"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditPilotModal } from "./edit-pilot-modal"
import { PassengerModal } from "./passenger-modal"
import { supabase } from "@/lib/supabaseClient"
import type { Flight, FlightTable } from "@/types/database"
import { Pencil } from "lucide-react"

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
  const [editOpen, setEditOpen] = useState(false)
  const [passengerOpen, setPassengerOpen] = useState(false)
  const [flightPassengerNames, setFlightPassengerNames] = useState<string[]>([])

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

  useEffect(() => {
    fetchFlightPassengers()
  }, [fetchFlightPassengers])

  const dataFormatada = formatDate(flight.data)
  const hora = flight.hora || "—"
  const aeronave = flight.aeronave || "—"
  const destino = flight.destino || "—"
  const passageirosLegacy = flight.passageiros || ""
  const piloto1 = flight.piloto1?.trim() || "—"
  const piloto2 = flight.piloto2?.trim() || "—"

  const hasDbPassengers = flightPassengerNames.length > 0
  const hasLegacyPassengers = !!passageirosLegacy?.trim()
  const hasPassengers = hasDbPassengers || hasLegacyPassengers
  const hasPilot1 = !!flight.piloto1?.trim()
  const hasPilot2 = !!flight.piloto2?.trim()
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

        {/* TRIPULAÇÃO */}
        <div
          className={`mx-4 mb-4 rounded-lg p-3 transition-colors ${
            pilotsHighlight ? "bg-[#FFF8CC]" : "bg-gray-50"
          }`}
        >
          <p className="text-sm font-semibold text-gray-700 mb-2">
            🧑‍✈️ Tripulação
          </p>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm text-gray-800">
            <span className="break-words">P1: {piloto1}</span>
            <span className="break-words">P2: {piloto2}</span>
          </div>
        </div>

        {/* BOTÃO */}
        <div className="px-4 pb-4">
          <Button
            onClick={() => setEditOpen(true)}
            className="w-full md:w-auto h-11 min-h-[44px] gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Pencil className="h-4 w-4 shrink-0" />
            Editar pilotos
          </Button>
        </div>
      </Card>

      <EditPilotModal
        flight={flight}
        table={table}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onUpdate}
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
