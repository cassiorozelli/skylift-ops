"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import type { Flight, FlightTable, Pilot } from "@/types/database"
import { Loader2, UserMinus } from "lucide-react"

type Props = {
  flight: Flight
  table: FlightTable
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PilotModal({
  flight,
  table,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [filteredPilots, setFilteredPilots] = useState<Pilot[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingPilots, setLoadingPilots] = useState(true)
  const [saving, setSaving] = useState(false)

  const [tempPilot1Id, setTempPilot1Id] = useState<string | null>(null)
  const [tempPilot2Id, setTempPilot2Id] = useState<string | null>(null)

  const { toast } = useToast()

  const fetchPilots = useCallback(async () => {
    setLoadingPilots(true)
    const { data, error } = await supabase
      .from("pilots")
      .select("id, name, license_number, base")
      .order("name")

    if (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pilotos.",
        variant: "destructive",
      })
      setPilots([])
    } else {
      setPilots(data ?? [])
    }
    setLoadingPilots(false)
  }, [toast])

  const initializeModal = useCallback(() => {
    setTempPilot1Id(flight.pilot_1_id ?? null)
    setTempPilot2Id(flight.pilot_2_id ?? null)
  }, [flight.pilot_1_id, flight.pilot_2_id])

  useEffect(() => {
    if (open) {
      fetchPilots()
      initializeModal()
    }
  }, [open, fetchPilots, initializeModal])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPilots(pilots)
    } else {
      const q = searchQuery.toLowerCase()
      setFilteredPilots(
        pilots.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.license_number?.toLowerCase().includes(q) ?? false) ||
            (p.base?.toLowerCase().includes(q) ?? false)
        )
      )
    }
  }, [pilots, searchQuery])

  const clearPilot = (role: "pilot_1" | "pilot_2") => {
    if (role === "pilot_1") setTempPilot1Id(null)
    else setTempPilot2Id(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from(table)
        .update({
          pilot_1_id: tempPilot1Id || null,
          pilot_2_id: tempPilot2Id || null,
          piloto1: tempPilot1Id
            ? pilots.find((p) => p.id === tempPilot1Id)?.name ?? null
            : null,
          piloto2: tempPilot2Id
            ? pilots.find((p) => p.id === tempPilot2Id)?.name ?? null
            : null,
        })
        .eq("id", flight.id)

      if (error) throw error

      toast({
        title: "Pilotos atualizados",
        description: "Os dados foram salvos com sucesso.",
        variant: "success",
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar"
      toast({ title: "Erro", description: msg, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const pilot1 = pilots.find((p) => p.id === tempPilot1Id)
  const pilot2 = pilots.find((p) => p.id === tempPilot2Id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-4 sm:mx-0 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 bg-white max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Selecionar pilotos
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Selecione os pilotos para este voo
          </DialogDescription>
        </DialogHeader>

        {/* Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <span className="text-sm font-medium text-gray-700">
              Piloto 1
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-800 truncate max-w-[180px]">
                {pilot1?.name ?? "—"}
              </span>
              {pilot1 && (
                <button
                  type="button"
                  onClick={() => clearPilot("pilot_1")}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500"
                  aria-label="Limpar"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <span className="text-sm font-medium text-gray-700">
              Piloto 2
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-800 truncate max-w-[180px]">
                {pilot2?.name ?? "—"}
              </span>
              {pilot2 && (
                <button
                  type="button"
                  onClick={() => clearPilot("pilot_2")}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500"
                  aria-label="Limpar"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar pilotos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 rounded-lg border-gray-200"
        />

        {/* Pilot list */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 rounded-lg border border-gray-200 bg-gray-50/50 max-h-48">
            {loadingPilots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : filteredPilots.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Nenhum piloto encontrado
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredPilots.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50/80"
                  >
                    <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                      <input
                        type="checkbox"
                        checked={tempPilot1Id === p.id}
                        onChange={() =>
                          setTempPilot1Id((prev) => (prev === p.id ? null : p.id))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                        title="Piloto 1"
                      />
                      <input
                        type="checkbox"
                        checked={tempPilot2Id === p.id}
                        onChange={() =>
                          setTempPilot2Id((prev) => (prev === p.id ? null : p.id))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                        title="Piloto 2"
                      />
                      <span className="text-sm text-gray-800 truncate">
                        {p.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="h-10 rounded-lg border-gray-200"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            {saving && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
            )}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
