"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function UsuariosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if ((profile as { role?: string } | null)?.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading || !isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="h-11 min-h-[44px] -ml-2">
        <Link href="/dashboard" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Link>
      </Button>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            A gestão de usuários é feita diretamente no painel do Supabase.
            Acesse{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline font-medium"
            >
              Supabase Dashboard
            </a>{" "}
            → Authentication → Users para criar e gerenciar contas.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Após criar um usuário no Auth, adicione-o na tabela{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono text-xs">
              profiles
            </code>{" "}
            com o campo{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono text-xs">
              role
            </code>{" "}
            como &quot;admin&quot; ou &quot;operacoes&quot;.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
