"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import type { Flight, FlightTable } from "@/types/database"
import { Loader2 } from "lucide-react"

type Props = {
  flight: Flight
  table: FlightTable
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPilotModal({
  flight,
  table,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [piloto1, setPiloto1] = useState(flight.piloto1 ?? "")
  const [piloto2, setPiloto2] = useState(flight.piloto2 ?? "")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from(table)
        .update({
          piloto1: piloto1.trim() || null,
          piloto2: piloto2.trim() || null,
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar"
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-4 sm:mx-0 p-4 sm:p-6 rounded-lg shadow-lg border border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Editar pilotos
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="piloto1" className="text-foreground font-medium">
              Piloto 1
            </Label>
            <Input
              id="piloto1"
              value={piloto1}
              onChange={(e) => setPiloto1(e.target.value)}
              placeholder="Nome do piloto"
              disabled={loading}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="piloto2" className="text-foreground font-medium">
              Piloto 2
            </Label>
            <Input
              id="piloto2"
              value={piloto2}
              onChange={(e) => setPiloto2(e.target.value)}
              placeholder="Nome do piloto (opcional)"
              disabled={loading}
              className="h-11"
            />
          </div>
          <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto h-11 min-h-[44px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-11 min-h-[44px]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
