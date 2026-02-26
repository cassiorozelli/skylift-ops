"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlightsTab } from "@/components/dashboard/flights-tab"
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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Operações — Monomotores, Jatos e Helicópteros
        </p>
      </div>

      <Tabs defaultValue="mono" className="space-y-6">
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
    </div>
  )
}
