"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import {
  FileText,
  Clock,
  UserCheck,
  Users,
  Settings,
  Loader2,
} from "lucide-react"

const SIDEBAR_ITEMS = [
  { href: "/admin", label: "Admin", icon: Settings },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/flight-durations", label: "Flight Durations", icon: Clock },
  { href: "/admin/pilot-reports", label: "Pilot Reports", icon: UserCheck },
  { href: "/admin/users", label: "Admin Users", icon: Users },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          if (authError.message?.includes("Refresh Token") || authError.message?.includes("refresh_token")) {
            await supabase.auth.signOut()
          }
          router.push("/login")
          setLoading(false)
          return
        }

        if (!user) {
          router.push("/login")
          setLoading(false)
          return
        }

        let canAccess = false

        // 1) Verificar profiles.role (prioridade - evita 500 em admin_users)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        if ((profile as { role?: string } | null)?.role === "admin") {
          canAccess = true
        }

        // 2) Se não for admin via profiles, tentar admin_users
        if (!canAccess) {
          try {
            const { data: adminRow, error: adminError } = await supabase
              .from("admin_users")
              .select("id")
              .eq("email", user.email ?? "")
              .maybeSingle()

            if (!adminError && adminRow) {
              canAccess = true
            }
          } catch {
            // admin_users pode retornar 500 - ignorar
          }
        }

        if (canAccess) {
          setIsAdmin(true)
        } else {
          router.push("/dashboard")
        }
      } catch (err) {
        console.error("Admin check error:", err)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-[240px] shrink-0 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <Link
            href="/dashboard"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            ← Back to app
          </Link>
          <h2 className="font-semibold text-gray-900 mt-2">Admin</h2>
        </div>
        <nav className="p-2 space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6 sm:p-8">{children}</main>
    </div>
  )
}
