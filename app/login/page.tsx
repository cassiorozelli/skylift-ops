"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/20 text-primary mb-4">
            <Plane className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Skylift Ops</h1>
          <p className="text-muted-foreground text-sm">
            Aerorio Táxi Aéreo — Sistema de Operações
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
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
