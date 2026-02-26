"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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

  const piloto1 = flight.piloto1?.trim() || "—"
  const piloto2 = flight.piloto2?.trim() || "—"

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Data:</span>{" "}
              {formatDate(flight.data)}
            </div>
            <div>
              <span className="text-muted-foreground">Hora:</span>{" "}
              {flight.hora || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Aeronave:</span>{" "}
              {flight.aeronave || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Destino:</span>{" "}
              {flight.destino || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Passageiros:</span>{" "}
              {flight.passageiros || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Piloto 1:</span> {piloto1}
            </div>
            <div>
              <span className="text-muted-foreground">Piloto 2:</span> {piloto2}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar pilotos
          </Button>
        </CardFooter>
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
