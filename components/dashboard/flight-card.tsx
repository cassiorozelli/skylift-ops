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

  const fields = [
    { label: "Data", value: formatDate(flight.data) },
    { label: "Hora", value: flight.hora || "—" },
    { label: "Aeronave", value: flight.aeronave || "—" },
    { label: "Destino", value: flight.destino || "—" },
    { label: "Passageiros", value: flight.passageiros || "—" },
    { label: "Piloto 1", value: piloto1 },
    { label: "Piloto 2", value: piloto2 },
  ]

  return (
    <>
      <Card className="w-full overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {fields.map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <span className="block text-muted-foreground text-xs font-medium mb-0.5">
                  {label}
                </span>
                <span className="text-foreground break-words">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border p-4 sm:p-5 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="h-11 min-h-[44px] w-full sm:w-auto sm:min-w-0 gap-2 font-medium"
          >
            <Pencil className="h-4 w-4 shrink-0" />
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
