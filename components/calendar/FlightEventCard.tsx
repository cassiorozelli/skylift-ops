"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAircraftColor } from "./aircraftColors"
import { AlertTriangle } from "lucide-react"

export type CalendarFlight = {
  id: string
  flight_id: string
  data: string
  hora: string | null
  aeronave: string | null
  origem?: string | null
  destino: string | null
  passageiros: string | null
  trajeto?: string | null
  eta?: string
  durationMinutes?: number
  hasConflict?: boolean
}

type Props = {
  flight: CalendarFlight
  onClick?: () => void
}

export function FlightEventCard({ flight, onClick }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const aeronave = flight.aeronave || "—"
  const rotaDisplay = flight.trajeto ?? flight.destino ?? "—"
  const hora = flight.hora || "—"
  const eta = flight.eta ? flight.eta : "TBD"
  const passageiros = flight.passageiros || "—"
  const colors = getAircraftColor(flight.aeronave)
  const isConflict = flight.hasConflict ?? false

  const handleClick = () => {
    onClick?.()
    setDetailsOpen(true)
  }

  return (
    <>
      <Card
        className={`
          min-h-[90px] cursor-pointer transition-all border-l-4
          ${isConflict ? "border-l-red-500 bg-red-50/80" : `${colors.border} ${colors.bg}`}
          hover:shadow-md
        `}
        onClick={handleClick}
      >
        <div className="p-3">
          {isConflict && (
            <div className="flex items-center gap-1.5 mb-2 text-red-700 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Conflito de aeronave
            </div>
          )}
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${colors.badge}`}>
              {aeronave}
            </span>
            <span className="text-sm font-medium text-gray-700">{hora}</span>
          </div>
          <p className="text-sm text-gray-800 font-medium truncate">
            {rotaDisplay}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            ETA {eta}
          </p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">
            {passageiros}
          </p>
        </div>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do voo</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-gray-600">Aeronave:</span> {aeronave}</p>
            <p><span className="font-medium text-gray-600">Trajeto:</span> {rotaDisplay}</p>
            <p><span className="font-medium text-gray-600">Hora:</span> {hora}</p>
            <p><span className="font-medium text-gray-600">ETA:</span> {eta}</p>
            <p><span className="font-medium text-gray-600">Passageiros:</span> {passageiros}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
