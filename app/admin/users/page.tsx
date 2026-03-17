"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2 } from "lucide-react"

type AdminUser = {
  id: string
  email: string
  created_at?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .order("email")
    setUsers((data ?? []) as AdminUser[])
  }

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false))
  }, [])

  const addUser = async () => {
    const email = newEmail.trim().toLowerCase()
    if (!email) return
    setSaving(true)
    const { error } = await supabase.from("admin_users").insert({ email })
    if (!error) {
      setNewEmail("")
      fetchUsers()
    }
    setSaving(false)
  }

  const removeUser = async (id: string) => {
    if (!confirm("Remover este admin?")) return
    await supabase.from("admin_users").delete().eq("id", id)
    fetchUsers()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Users</h1>
      <p className="text-gray-600">
        Manage who can access the admin area. Only emails in this list can use
        /admin.
      </p>

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="admin@company.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addUser()}
          className="max-w-xs"
        />
        <Button onClick={addUser} disabled={saving}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white max-w-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeUser(u.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500 text-sm">
            No admin users. Add an email above.
          </div>
        )}
      </div>
    </div>
  )
}
