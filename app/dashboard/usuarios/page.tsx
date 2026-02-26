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
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A gestão de usuários é feita diretamente no painel do Supabase.
            Acesse{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Supabase Dashboard
            </a>{" "}
            → Authentication → Users para criar e gerenciar contas.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Após criar um usuário no Auth, adicione-o na tabela{" "}
            <code className="rounded bg-muted px-1 py-0.5">profiles</code> com
            o campo <code className="rounded bg-muted px-1 py-0.5">role</code>{" "}
            como &quot;admin&quot; ou &quot;operacoes&quot;.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
