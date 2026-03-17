"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type FlightDuration = {
  id?: string
  aeronave: string
  origem: string
  destino: string
  tempo_medio_minutos: number
  voos_utilizados?: number
}

function parseRoute(destino: string | null): { origem: string; destino: string } {
  const r = (destino ?? "").trim()
  if (!r) return { origem: "", destino: "" }
  const m = r.match(/(.+?)\s+(?:x|→|para)\s+(.+)/i)
  if (m) return { origem: m[1].trim(), destino: m[2].trim() }
  return { origem: "", destino: r }
}

export default function FlightDurationsPage() {
  const [items, setItems] = useState<FlightDuration[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<FlightDuration | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    aeronave: "",
    origem: "",
    destino: "",
    tempo_medio_minutos: 20,
  })
  const [filterAeronave, setFilterAeronave] = useState("")
  const [filterOrigem, setFilterOrigem] = useState("")
  const [filterDestino, setFilterDestino] = useState("")
  const [onlyWithTempo, setOnlyWithTempo] = useState(false)
  const [inlineEdit, setInlineEdit] = useState<Record<string, string>>({})

  const itemKey = (item: FlightDuration) =>
    item.id ?? `${item.aeronave}|${item.origem}|${item.destino}`

  const fetchItems = async () => {
    const routeKey = (a: string, o: string, d: string) =>
      `${a}|${o}|${d}`

    const routes = new Map<string, { aeronave: string; origem: string; destino: string }>()

    const addFlight = (row: { aeronave?: string | null; destino?: string | null }) => {
      const aeronave = (row.aeronave ?? "").trim()
      if (!aeronave) return
      const destinoRaw = (row.destino ?? "").trim()
      if (!destinoRaw) return
      const parsed = parseRoute(destinoRaw)
      const origem = parsed.origem
      const destino = parsed.destino || destinoRaw
      const key = routeKey(aeronave, origem, destino)
      if (!routes.has(key)) routes.set(key, { aeronave, origem, destino })
    }

    const [monoRes, jatoRes, heliRes, histRes, durationsRes] = await Promise.all([
      supabase.from("mono_flights").select("aeronave, destino"),
      supabase.from("jato_flights").select("aeronave, destino"),
      supabase.from("helicoptero_flights").select("aeronave, destino"),
      supabase.from("flights_history").select("aeronave, destino"),
      supabase.from("flight_durations").select("*"),
    ])

    for (const row of monoRes.data ?? []) addFlight(row)
    for (const row of jatoRes.data ?? []) addFlight(row)
    for (const row of heliRes.data ?? []) addFlight(row)
    for (const row of histRes.data ?? []) addFlight(row)

    const durationsMap = new Map<string, FlightDuration>()
    for (const d of (durationsRes.data ?? []) as FlightDuration[]) {
      const key = routeKey(d.aeronave, d.origem, d.destino)
      durationsMap.set(key, d)
    }

    const merged: FlightDuration[] = []
    for (const [key, route] of routes) {
      const existing = durationsMap.get(key)
      merged.push({
        id: existing?.id,
        aeronave: route.aeronave,
        origem: route.origem,
        destino: route.destino,
        tempo_medio_minutos: existing?.tempo_medio_minutos ?? 0,
      })
    }
    for (const d of (durationsRes.data ?? []) as FlightDuration[]) {
      const key = routeKey(d.aeronave, d.origem, d.destino)
      if (!routes.has(key)) {
        merged.push({
          id: d.id,
          aeronave: d.aeronave,
          origem: d.origem,
          destino: d.destino,
          tempo_medio_minutos: d.tempo_medio_minutos ?? 0,
        })
      }
    }

    merged.sort((a, b) => {
      if (a.aeronave !== b.aeronave) return a.aeronave.localeCompare(b.aeronave)
      if (a.origem !== b.origem) return a.origem.localeCompare(b.origem)
      return a.destino.localeCompare(b.destino)
    })

    setItems(merged)
  }

  useEffect(() => {
    fetchItems().finally(() => setLoading(false))
  }, [])

  const formatMinutes = (m: number) => {
    const h = Math.floor(m / 60)
    const min = m % 60
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
  }

  const parseHHMM = (s: string): number => {
    const m = s.match(/^(\d{1,2}):?(\d{2})?$/)
    if (m) {
      const h = parseInt(m[1], 10)
      const min = parseInt(m[2] ?? "0", 10)
      return h * 60 + min
    }
    return parseInt(s, 10) || 0
  }

  const saveEdit = async () => {
    if (!editing) return
    const mins = typeof form.tempo_medio_minutos === "number"
      ? form.tempo_medio_minutos
      : parseHHMM(String(form.tempo_medio_minutos))
    await supabase
      .from("flight_durations")
      .update({
        aeronave: form.aeronave || editing.aeronave,
        origem: form.origem || editing.origem,
        destino: form.destino || editing.destino,
        tempo_medio_minutos: mins,
      })
      .eq("id", editing.id)
    setEditing(null)
    fetchItems()
  }

  const createNew = async () => {
    const mins = typeof form.tempo_medio_minutos === "number"
      ? form.tempo_medio_minutos
      : parseHHMM(String(form.tempo_medio_minutos))
    if (!form.aeronave?.trim() || !form.origem?.trim() || !form.destino?.trim() || mins <= 0)
      return
    await supabase.from("flight_durations").insert({
      aeronave: form.aeronave.trim(),
      origem: form.origem.trim(),
      destino: form.destino.trim(),
      tempo_medio_minutos: mins,
    })
    setCreating(false)
    setForm({ aeronave: "", origem: "", destino: "", tempo_medio_minutos: 20 })
    fetchItems()
  }

  const deleteItem = async (item: FlightDuration) => {
    if (!item.id) return
    if (!confirm("Remover este registro?")) return
    await supabase.from("flight_durations").delete().eq("id", item.id)
    fetchItems()
  }

  const uniqueAeronaves = useMemo(
    () => [...new Set(items.map((i) => i.aeronave).filter(Boolean))].sort(),
    [items]
  )
  const uniqueOrigens = useMemo(
    () => [...new Set(items.map((i) => i.origem).filter(Boolean))].sort(),
    [items]
  )
  const uniqueDestinos = useMemo(
    () => [...new Set(items.map((i) => i.destino).filter(Boolean))].sort(),
    [items]
  )

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterAeronave && item.aeronave !== filterAeronave) return false
      if (filterOrigem && item.origem !== filterOrigem) return false
      if (filterDestino && item.destino !== filterDestino) return false
      if (onlyWithTempo && (!item.tempo_medio_minutos || item.tempo_medio_minutos <= 0))
        return false
      return true
    })
  }, [items, filterAeronave, filterOrigem, filterDestino, onlyWithTempo])

  const saveInlineTime = async (item: FlightDuration) => {
    const key = itemKey(item)
    const raw = inlineEdit[key]
    if (raw === undefined) return
    const mins = parseHHMM(raw)
    if (mins <= 0) return
    if (item.id) {
      await supabase
        .from("flight_durations")
        .update({ tempo_medio_minutos: mins })
        .eq("id", item.id)
    } else {
      await supabase.from("flight_durations").upsert(
        {
          aeronave: item.aeronave,
          origem: item.origem,
          destino: item.destino,
          tempo_medio_minutos: mins,
        },
        { onConflict: "aeronave,origem,destino" }
      )
    }
    setInlineEdit((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    fetchItems()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Flight Durations
      </h1>
      <p className="text-gray-600">
        Manage average flight durations by aircraft and route.
      </p>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipamento
          </label>
          <select
            value={filterAeronave}
            onChange={(e) => setFilterAeronave(e.target.value)}
            className="h-10 rounded-md border border-gray-200 px-3 text-sm min-w-[140px]"
          >
            <option value="">Todos</option>
            {uniqueAeronaves.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origem
          </label>
          <select
            value={filterOrigem}
            onChange={(e) => setFilterOrigem(e.target.value)}
            className="h-10 rounded-md border border-gray-200 px-3 text-sm min-w-[140px]"
          >
            <option value="">Todas</option>
            {uniqueOrigens.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destino
          </label>
          <select
            value={filterDestino}
            onChange={(e) => setFilterDestino(e.target.value)}
            className="h-10 rounded-md border border-gray-200 px-3 text-sm min-w-[140px]"
          >
            <option value="">Todos</option>
            {uniqueDestinos.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyWithTempo}
            onChange={(e) => setOnlyWithTempo(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">
            Apenas com tempo de voo preenchido
          </span>
        </label>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Aircraft
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Route
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Tempo de voo
              </th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const key = itemKey(item)
              return (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{item.aeronave}</td>
                  <td className="px-4 py-3">
                    {item.origem ? `${item.origem} → ${item.destino}` : item.destino}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {inlineEdit[key] !== undefined ? (
                        <>
                          <Input
                            value={inlineEdit[key]}
                            onChange={(e) =>
                              setInlineEdit((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineTime(item)
                              if (e.key === "Escape")
                                setInlineEdit((prev) => {
                                  const next = { ...prev }
                                  delete next[key]
                                  return next
                                })
                            }}
                            placeholder="01:30"
                            className="h-8 w-24 text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => saveInlineTime(item)}
                          >
                            Salvar
                          </Button>
                        </>
                      ) : (
                        <>
                          <span>
                            {item.tempo_medio_minutos > 0
                              ? formatMinutes(item.tempo_medio_minutos)
                              : "—"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              setInlineEdit((prev) => ({
                                ...prev,
                                [key]: item.tempo_medio_minutos > 0
                                  ? formatMinutes(item.tempo_medio_minutos)
                                  : "",
                              }))
                            }
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            {item.tempo_medio_minutos > 0 ? "Editar" : "Adicionar"}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    {item.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditing(item)
                            setForm({
                              aeronave: item.aeronave,
                              origem: item.origem,
                              destino: item.destino,
                              tempo_medio_minutos: item.tempo_medio_minutos,
                            })
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500 text-sm">
            {items.length === 0
              ? "No flight durations. Add one."
              : "Nenhum registro corresponde aos filtros."}
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Aircraft</label>
              <Input
                value={form.aeronave}
                onChange={(e) =>
                  setForm((f) => ({ ...f, aeronave: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Origem</label>
              <Input
                value={form.origem}
                onChange={(e) =>
                  setForm((f) => ({ ...f, origem: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Destino</label>
              <Input
                value={form.destino}
                onChange={(e) =>
                  setForm((f) => ({ ...f, destino: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Avg time (HH:MM or minutes)
              </label>
              <Input
                value={formatMinutes(form.tempo_medio_minutos)}
                onChange={(e) => {
                  const mins = parseHHMM(e.target.value)
                  setForm((f) => ({ ...f, tempo_medio_minutos: mins }))
                }}
                placeholder="01:30"
                className="mt-1"
              />
            </div>
            <Button onClick={saveEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add flight duration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Aircraft</label>
              <Input
                value={form.aeronave}
                onChange={(e) =>
                  setForm((f) => ({ ...f, aeronave: e.target.value }))
                }
                placeholder="PR-WZR"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Origem</label>
              <Input
                value={form.origem}
                onChange={(e) =>
                  setForm((f) => ({ ...f, origem: e.target.value }))
                }
                placeholder="GIG"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Destino</label>
              <Input
                value={form.destino}
                onChange={(e) =>
                  setForm((f) => ({ ...f, destino: e.target.value }))
                }
                placeholder="POÇOS"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Avg time (HH:MM)
              </label>
              <Input
                value={formatMinutes(form.tempo_medio_minutos)}
                onChange={(e) => {
                  const mins = parseHHMM(e.target.value)
                  setForm((f) => ({ ...f, tempo_medio_minutos: mins }))
                }}
                placeholder="01:30"
                className="mt-1"
              />
            </div>
            <Button onClick={createNew}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
