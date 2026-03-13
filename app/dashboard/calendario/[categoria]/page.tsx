"use client"

import { useParams } from "next/navigation"
import { FlightCalendarView } from "@/components/calendar/FlightCalendarView"
import { Loader2 } from "lucide-react"

export default function CalendarPage() {
  const params = useParams()
  const categoria = (params?.categoria as string) ?? ""

  if (!categoria) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!["mono", "jato", "helicoptero"].includes(categoria)) {
    return (
      <div className="p-6 text-gray-600">
        Categoria inválida. Use mono, jato ou helicoptero.
      </div>
    )
  }

  return (
    <FlightCalendarView categoria={categoria as "mono" | "jato" | "helicoptero"} />
  )
}
