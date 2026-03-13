"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlightsTab } from "@/components/dashboard/flights-tab"
import { HistoricalFlightsTab } from "@/components/dashboard/historical-flights-tab"

const TIPO_VALIDOS = ["active", "historical"] as const
const CATEGORIA_VALIDAS = ["mono", "jato", "helicoptero"] as const

type Tipo = (typeof TIPO_VALIDOS)[number]
type Categoria = (typeof CATEGORIA_VALIDAS)[number]

export default function FlightsPage() {
  const params = useParams()
  const router = useRouter()
  const tipo = (params?.tipo as string) ?? "active"
  const categoria = (params?.categoria as string) ?? "mono"

  const tipoValido = TIPO_VALIDOS.includes(tipo as Tipo) ? (tipo as Tipo) : "active"
  const categoriaValida = CATEGORIA_VALIDAS.includes(categoria as Categoria)
    ? (categoria as Categoria)
    : "mono"

  useEffect(() => {
    if (!TIPO_VALIDOS.includes(tipo as Tipo) || !CATEGORIA_VALIDAS.includes(categoria as Categoria)) {
      router.replace("/flights/active/mono")
    }
  }, [tipo, categoria, router])

  if (!TIPO_VALIDOS.includes(tipo as Tipo) || !CATEGORIA_VALIDAS.includes(categoria as Categoria)) {
    return null
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          Flights Dashboard
        </h1>
      </div>

      <Tabs value={tipoValido} className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 h-auto p-1 gap-1 bg-muted/50 rounded-lg">
          <TabsTrigger
            value="active"
            asChild
            className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md"
          >
            <Link href={`/flights/active/${categoriaValida}`}>Active Flights</Link>
          </TabsTrigger>
          <TabsTrigger
            value="historical"
            asChild
            className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md"
          >
            <Link href={`/flights/historical/${categoriaValida}`}>
              Historical Flights
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0 space-y-6">
          <Tabs value={categoriaValida} className="space-y-4">
            <TabsList className="w-full grid grid-cols-3 h-auto p-1 gap-1 bg-muted/50 rounded-lg">
              <TabsTrigger value="mono" asChild className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md">
                <Link href="/flights/active/mono">Monomotores</Link>
              </TabsTrigger>
              <TabsTrigger value="jato" asChild className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md">
                <Link href="/flights/active/jato">Jatos</Link>
              </TabsTrigger>
              <TabsTrigger value="helicoptero" asChild className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md">
                <Link href="/flights/active/helicoptero">Helicópteros</Link>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="mono" className="mt-0">
              <FlightsTab table="mono_flights" />
            </TabsContent>
            <TabsContent value="jato" className="mt-0">
              <FlightsTab table="jato_flights" />
            </TabsContent>
            <TabsContent value="helicoptero" className="mt-0">
              <FlightsTab table="helicoptero_flights" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="historical" className="mt-0 space-y-6">
          <Tabs value={categoriaValida} className="space-y-4">
            <TabsList className="w-full grid grid-cols-3 h-auto p-1 gap-1 bg-muted/50 rounded-lg">
              <TabsTrigger value="mono" asChild className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md">
                <Link href="/flights/historical/mono">Monomotores</Link>
              </TabsTrigger>
              <TabsTrigger value="jato" asChild className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md">
                <Link href="/flights/historical/jato">Jatos</Link>
              </TabsTrigger>
              <TabsTrigger value="helicoptero" asChild className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md">
                <Link href="/flights/historical/helicoptero">Helicópteros</Link>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="mono" className="mt-0">
              <HistoricalFlightsTab categoria={categoriaValida} />
            </TabsContent>
            <TabsContent value="jato" className="mt-0">
              <HistoricalFlightsTab categoria={categoriaValida} />
            </TabsContent>
            <TabsContent value="helicoptero" className="mt-0">
              <HistoricalFlightsTab categoria={categoriaValida} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
