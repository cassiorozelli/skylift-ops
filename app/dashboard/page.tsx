"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlightsTab } from "@/components/dashboard/flights-tab"
import { HistoricalFlightsTab } from "@/components/dashboard/historical-flights-tab"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }
      } catch {
        router.push("/login")
        return
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          Flights Dashboard
        </h1>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        {/* TOP LEVEL: Active | Historical */}
        <TabsList className="w-full sm:w-auto grid grid-cols-2 h-auto p-1 gap-1 bg-muted/50 rounded-lg">
          <TabsTrigger
            value="active"
            className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md"
          >
            Active Flights
          </TabsTrigger>
          <TabsTrigger
            value="historical"
            className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md"
          >
            Historical Flights
          </TabsTrigger>
        </TabsList>

        {/* ACTIVE FLIGHTS - with sub-tabs */}
        <TabsContent value="active" className="mt-0 space-y-6">
          <Tabs defaultValue="mono" className="space-y-4">
            <TabsList className="w-full grid grid-cols-3 h-auto p-1 gap-1 bg-muted/50 rounded-lg">
              <TabsTrigger
                value="mono"
                className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md"
              >
                Monomotores
              </TabsTrigger>
              <TabsTrigger
                value="jato"
                className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md"
              >
                Jatos
              </TabsTrigger>
              <TabsTrigger
                value="helicoptero"
                className="py-3 px-4 text-sm font-medium data-[state=active]:bg-[#ffffff] data-[state=active]:shadow-sm rounded-md"
              >
                Helicópteros
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

        {/* HISTORICAL FLIGHTS */}
        <TabsContent value="historical" className="mt-0">
          <HistoricalFlightsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
