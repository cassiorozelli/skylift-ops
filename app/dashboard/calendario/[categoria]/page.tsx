"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <FlightCalendarView categoria={categoria as "mono" | "jato" | "helicoptero"} />
    </div>
  )
}
