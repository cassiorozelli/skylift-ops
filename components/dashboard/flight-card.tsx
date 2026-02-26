"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditPilotModal } from "./edit-pilot-modal"
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

  const dataFormatada = formatDate(flight.data)
  const hora = flight.hora || "—"
  const aeronave = flight.aeronave || "—"
  const destino = flight.destino || "—"
  const passageiros = flight.passageiros || "—"
  const piloto1 = flight.piloto1?.trim() || "—"
  const piloto2 = flight.piloto2?.trim() || "—"

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
        <div className="bg-gray-50 mx-4 mb-3 rounded-lg p-3">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            👥 Passageiros
          </p>
          <p className="text-sm text-gray-800 break-words">{passageiros}</p>
        </div>

        {/* TRIPULAÇÃO */}
        <div className="bg-gray-50 mx-4 mb-4 rounded-lg p-3">
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
    </>
  )
}
