"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          if (error.message?.includes("Refresh Token") || error.message?.includes("refresh_token")) {
            await supabase.auth.signOut()
          }
          router.replace("/login")
          return
        }
        if (user) {
          router.replace("/flights/active/mono")
        } else {
          router.replace("/login")
        }
      } catch {
        router.replace("/login")
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ffffff]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
