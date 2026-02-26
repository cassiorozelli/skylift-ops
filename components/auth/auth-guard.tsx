"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  return <>{children}</>
}
