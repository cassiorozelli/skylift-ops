"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { formatCpf, cleanCpf } from "@/lib/format-cpf"
import type { Flight, FlightTable } from "@/types/database"
import { Loader2, Upload, Download, X, UserPlus } from "lucide-react"
import * as XLSX from "xlsx"

export type Passenger = {
  id: string
  name: string
  cpf: string
}

/** Temp passenger (created in modal, not yet in DB). Id starts with "temp-" */
type TempPassenger = { id: string; name: string; cpf: string }

const isTempId = (id: string) => id.startsWith("temp-")

type Props = {
  flight: Flight
  table: FlightTable
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PassengerModal({
  flight,
  table,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [filteredPassengers, setFilteredPassengers] = useState<Passenger[]>([])
  const [temporarySelectedPassengers, setTemporarySelectedPassengers] = useState<
    Set<string>
  >(new Set())
  const [temporaryNewPassengers, setTemporaryNewPassengers] = useState<
    TempPassenger[]
  >([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingPassengers, setLoadingPassengers] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCpf, setNewCpf] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const allPassengersForDisplay: (Passenger | TempPassenger)[] = [
    ...passengers,
    ...temporaryNewPassengers,
  ].sort((a, b) => a.name.localeCompare(b.name))

  const fetchPassengers = useCallback(async () => {
    setLoadingPassengers(true)
    const { data, error } = await supabase
      .from("passengers")
      .select("id, name, cpf")
      .order("name")

    if (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os passageiros.",
        variant: "destructive",
      })
      setPassengers([])
    } else {
      setPassengers(data ?? [])
    }
    setLoadingPassengers(false)
  }, [toast])

  const fetchFlightPassengers = useCallback(async () => {
    const { data, error } = await supabase
      .from("flight_passengers")
      .select("passenger_id")
      .eq("flight_id", flight.id)
      .eq("flight_table", table)

    if (error) {
      console.error(error)
      return new Set<string>()
    }
    return new Set((data ?? []).map((r) => r.passenger_id))
  }, [flight.id, table])

  const initializeModal = useCallback(async () => {
    await fetchPassengers()
    const ids = await fetchFlightPassengers()
    setTemporarySelectedPassengers(ids)
    setTemporaryNewPassengers([])
  }, [fetchPassengers, fetchFlightPassengers])

  useEffect(() => {
    if (open) {
      initializeModal()
    }
  }, [open, initializeModal])

  useEffect(() => {
    const all = [...passengers, ...temporaryNewPassengers].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
    if (!searchQuery.trim()) {
      setFilteredPassengers(all)
    } else {
      const q = searchQuery.toLowerCase()
      setFilteredPassengers(
        all.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.cpf.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
        )
      )
    }
  }, [passengers, temporaryNewPassengers, searchQuery])

  const togglePassenger = (passengerId: string, checked: boolean) => {
    setTemporarySelectedPassengers((prev) => {
      const next = new Set(prev)
      if (checked) next.add(passengerId)
      else next.delete(passengerId)
      return next
    })
  }

  const removePassenger = (passengerId: string) => {
    togglePassenger(passengerId, false)
  }

  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    const cpf = cleanCpf(newCpf)
    if (!name || cpf.length !== 11) {
      toast({
        title: "Dados inválidos",
        description: "Nome e CPF (11 dígitos) são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const existingByCpf = passengers.find((p) => p.cpf === cpf)
    const existingTemp = temporaryNewPassengers.find((p) => p.cpf === cpf)
    if (existingByCpf) {
      setTemporarySelectedPassengers((prev) => new Set([...Array.from(prev), existingByCpf.id]))
      setNewName("")
      setNewCpf("")
    } else if (existingTemp) {
      setTemporarySelectedPassengers((prev) => new Set([...Array.from(prev), existingTemp.id]))
      setNewName("")
      setNewCpf("")
    } else {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const newP: TempPassenger = { id: tempId, name, cpf }
      setTemporaryNewPassengers((prev) => [...prev, newP])
      setTemporarySelectedPassengers((prev) => new Set([...Array.from(prev), tempId]))
      setNewName("")
      setNewCpf("")
    }
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const arrayBuf = await file.arrayBuffer()
      const wb = XLSX.read(arrayBuf, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<{ name?: string; cpf?: string }>(ws)
      const seenCpfs = new Set<string>()

      let nextNew = [...temporaryNewPassengers]
      let nextSel = new Set(temporarySelectedPassengers)

      for (const row of rows) {
        const name = String(row.name ?? "").trim()
        const cpf = cleanCpf(String(row.cpf ?? ""))
        if (!name || cpf.length !== 11 || seenCpfs.has(cpf)) continue
        seenCpfs.add(cpf)

        const existingDb = passengers.find((p) => p.cpf === cpf)
        const existingTemp = nextNew.find((p) => p.cpf === cpf)
        if (existingDb) {
          nextSel.add(existingDb.id)
        } else if (existingTemp) {
          nextSel.add(existingTemp.id)
        } else {
          const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
          nextNew.push({ id: tempId, name, cpf })
          nextSel.add(tempId)
        }
      }

      setTemporaryNewPassengers(nextNew)
      setTemporarySelectedPassengers(nextSel)

      toast({
        title: "Importação concluída",
        description: "Os passageiros foram adicionados. Clique em Salvar para confirmar.",
        variant: "success",
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro na importação"
      toast({ title: "Erro", description: msg, variant: "destructive" })
    }
    e.target.value = ""
  }

  const handleExportExcel = () => {
    const selected = allPassengersForDisplay.filter((p) =>
      temporarySelectedPassengers.has(p.id)
    )
    if (selected.length === 0) {
      toast({
        title: "Nenhum passageiro",
        description: "Selecione passageiros antes de exportar.",
        variant: "destructive",
      })
      return
    }
    const data = selected.map((p) => ({
      name: p.name,
      cpf: formatCpf(p.cpf),
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Manifesto")
    XLSX.writeFile(wb, "manifest_voo.xlsx")
    toast({
      title: "Exportado",
      description: `Manifesto com ${selected.length} passageiros.`,
      variant: "success",
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const idsToLink = Array.from(temporarySelectedPassengers)
      const newToInsert = temporaryNewPassengers.filter((p) =>
        temporarySelectedPassengers.has(p.id)
      )

      const insertedIds: Record<string, string> = {}
      for (const p of newToInsert) {
        const { data: existing } = await supabase
          .from("passengers")
          .select("id")
          .eq("cpf", p.cpf)
          .maybeSingle()

        if (existing) {
          insertedIds[p.id] = existing.id
        } else {
          const { data: inserted, error } = await supabase
            .from("passengers")
            .insert({ name: p.name, cpf: p.cpf })
            .select("id")
            .single()
          if (error) throw error
          insertedIds[p.id] = inserted!.id
        }
      }

      const finalPassengerIds = idsToLink.map((id) =>
        isTempId(id) ? insertedIds[id] : id
      ).filter(Boolean)

      const { error: delError } = await supabase
        .from("flight_passengers")
        .delete()
        .eq("flight_id", flight.id)
        .eq("flight_table", table)
      if (delError) throw delError

      for (const pid of finalPassengerIds) {
        const { error } = await supabase.from("flight_passengers").insert({
          flight_id: flight.id,
          flight_table: table,
          passenger_id: pid,
        })
        if (error) throw error
      }

      toast({
        title: "Alterações salvas",
        description: "Os passageiros foram atualizados.",
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

  const selectedPassengers = allPassengersForDisplay.filter((p) =>
    temporarySelectedPassengers.has(p.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-4 sm:mx-0 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 bg-white max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Adicionar passageiros
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Selecione e adicione passageiros cadastrados
          </DialogDescription>
        </DialogHeader>

        {/* Chips dos selecionados */}
        {selectedPassengers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedPassengers.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800"
              >
                {p.name}
                <button
                  type="button"
                  onClick={() => removePassenger(p.id)}
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                  aria-label="Remover"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Busca */}
        <Input
          placeholder="Buscar passageiros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 rounded-lg border-gray-200"
        />

        {/* Lista */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 rounded-lg border border-gray-200 bg-gray-50/50 max-h-48">
            {loadingPassengers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : filteredPassengers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Nenhum passageiro encontrado
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredPassengers.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50/80">
                    <input
                      type="checkbox"
                      checked={temporarySelectedPassengers.has(p.id)}
                      onChange={(e) => togglePassenger(p.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm text-gray-800 truncate">
                      {p.name}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                      CPF: {formatCpf(p.cpf)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Novo passageiro */}
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Novo passageiro
          </p>
          <form onSubmit={handleAddPassenger} className="flex flex-col gap-2">
            <div>
              <Label htmlFor="new-name" className="text-sm text-gray-700">
                Nome
              </Label>
              <Input
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome completo"
                className="h-10 mt-1 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="new-cpf" className="text-sm text-gray-700">
                CPF
              </Label>
              <Input
                id="new-cpf"
                value={newCpf}
                onChange={(e) => setNewCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="h-10 mt-1 rounded-lg"
              />
            </div>
            <Button
              type="submit"
              className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              Adicionar
            </Button>
          </form>
        </div>

        {/* Footer: Import Excel | Export Excel | Cancelar | Salvar */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 rounded-lg border-gray-200 shrink-0"
          >
            <Upload className="mr-2 h-4 w-4 shrink-0" />
            Import Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportExcel}
            className="h-10 rounded-lg border-gray-200 shrink-0"
          >
            <Download className="mr-2 h-4 w-4 shrink-0" />
            Export Excel
          </Button>
          <div className="flex-1 min-w-[1rem]" />
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="h-10 rounded-lg border-gray-200 shrink-0"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700 shrink-0"
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
