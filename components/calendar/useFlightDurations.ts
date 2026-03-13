"use client"

import { useCallback, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

const DEFAULT_DURATION_MINUTES = 20

const cache = new Map<string, number>()
let tableChecked = false
let tableExists = true

function cacheKey(aeronave: string, routeKey: string): string {
  return `${aeronave}|${routeKey}`
}

export function parseRoute(route: string | null): { origem: string; destino: string } {
  const r = (route ?? "").trim()
  if (!r) return { origem: "", destino: "" }
  const match = r.match(/(.+?)\s+(?:x|→|para)\s+(.+)/i)
  if (match) return { origem: match[1].trim(), destino: match[2].trim() }
  return { origem: "", destino: r }
}

export function useFlightDurations() {
  const loadingRef = useRef<Set<string>>(new Set())

  const getDuration = useCallback(
    async (aeronave: string | null, destino: string | null): Promise<number | null> => {
      if (!tableExists) return null

      const a = (aeronave ?? "").trim()
      const { origem, destino: dest } = parseRoute(destino ?? "")
      const key = cacheKey(a, `${origem}|${dest}`)

      const cached = cache.get(key)
      if (cached !== undefined) return cached

      if (loadingRef.current.has(key)) return null

      loadingRef.current.add(key)
      try {
        const { data, error } = await supabase
          .from("flight_durations")
          .select("tempo_medio_minutos")
          .eq("aeronave", a)
          .eq("origem", origem || "")
          .eq("destino", dest || "")
          .limit(1)
          .maybeSingle()

        if (error) {
          if (!tableChecked) {
            tableChecked = true
            tableExists = false
          }
          return null
        }
        if (!data?.tempo_medio_minutos) return null
        tableChecked = true
        const minutes = Number(data.tempo_medio_minutos)
        if (minutes <= 0) return null
        cache.set(key, minutes)
        return minutes
      } catch {
        if (!tableChecked) {
          tableChecked = true
          tableExists = false
        }
        return null
      } finally {
        loadingRef.current.delete(key)
      }
    },
    []
  )

  return { getDuration }
}
