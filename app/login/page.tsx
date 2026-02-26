"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plane } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      toast({
        title: "Login realizado!",
        description: "Redirecionando para o dashboard...",
        variant: "success",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao fazer login"
      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffff] px-4 py-8 sm:px-6">
      <div className="w-full max-w-[400px] space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary">
            <Plane className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Skylift Ops
          </h1>
          <p className="text-muted-foreground text-sm">
            Aerorio Táxi Aéreo — Sistema de Operações
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-base font-medium"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Use suas credenciais do sistema para acessar.
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Skylift Ops — Aerorio Táxi Aéreo
        </p>
      </div>
    </div>
  )
}
