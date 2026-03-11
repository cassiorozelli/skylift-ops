"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Plane, LogOut, Users, Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [ready, setReady] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [hasUser, setHasUser] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error("Auth error:", error)
          setHasUser(false)
          router.push("/login")
          setAuthChecked(true)
          return
        }
        if (!user) {
          setHasUser(false)
          router.push("/login")
          setAuthChecked(true)
          return
        }

        setHasUser(true)
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        const role = (data as { role?: string } | null)?.role
        setIsAdmin(role === "admin")
      } catch (err) {
        console.error(err)
        setHasUser(false)
        router.push("/login")
      } finally {
        setAuthChecked(true)
        setReady(true)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (!authChecked || hasUser === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {hasUser === false ? "Redirecionando para login..." : "Carregando..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <header className="sticky top-0 z-40 border-b border-border bg-[#ffffff]">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors"
          >
            <Plane className="h-5 w-5 text-primary" />
            Skylift Ops
          </Link>
          <div className="flex items-center gap-2">
            {ready && isAdmin && (
              <Button variant="outline" size="sm" asChild className="h-10 min-w-[44px] sm:min-w-0">
                <Link href="/dashboard/usuarios" className="gap-2 px-4">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Gerenciar Usuários</span>
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sair"
              className="h-10 w-10 min-h-[44px] min-w-[44px]"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
