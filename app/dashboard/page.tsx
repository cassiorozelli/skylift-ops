"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlightsTab } from "@/components/dashboard/flights-tab"
import type { FlightTable } from "@/types/database"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Operações — Monomotores, Jatos e Helicópteros
        </p>
      </div>

      <Tabs defaultValue="mono" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="mono">Monomotores</TabsTrigger>
          <TabsTrigger value="jato">Jatos</TabsTrigger>
          <TabsTrigger value="helicoptero">Helicópteros</TabsTrigger>
        </TabsList>
        <TabsContent value="mono" className="space-y-4">
          <FlightsTab table="mono_flights" />
        </TabsContent>
        <TabsContent value="jato" className="space-y-4">
          <FlightsTab table="jato_flights" />
        </TabsContent>
        <TabsContent value="helicoptero" className="space-y-4">
          <FlightsTab table="helicoptero_flights" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
