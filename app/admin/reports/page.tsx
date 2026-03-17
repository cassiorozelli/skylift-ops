"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2 } from "lucide-react"

type Recipient = {
  id: string
  email: string
  send_mono: boolean
  send_jato: boolean
  send_helicoptero: boolean
  send_all: boolean
  active: boolean
}

export default function ReportsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchRecipients = async () => {
    const { data } = await supabase
      .from("daily_report_recipients")
      .select("*")
      .order("created_at", { ascending: false })
    setRecipients((data ?? []) as Recipient[])
  }

  useEffect(() => {
    fetchRecipients().finally(() => setLoading(false))
  }, [])

  const addRecipient = async () => {
    const email = newEmail.trim().toLowerCase()
    if (!email) return
    setSaving(true)
    const { error } = await supabase.from("daily_report_recipients").insert({
      email,
      send_mono: false,
      send_jato: false,
      send_helicoptero: false,
      send_all: false,
      active: true,
    })
    if (!error) {
      setNewEmail("")
      fetchRecipients()
    }
    setSaving(false)
  }

  const updateRecipient = async (
    id: string,
    field: keyof Recipient,
    value: boolean
  ) => {
    await supabase
      .from("daily_report_recipients")
      .update({ [field]: value })
      .eq("id", id)
    fetchRecipients()
  }

  const removeRecipient = async (id: string) => {
    await supabase.from("daily_report_recipients").delete().eq("id", id)
    fetchRecipients()
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
      <h1 className="text-2xl font-semibold text-gray-900">
        Daily Report Recipients
      </h1>
      <p className="text-gray-600">
        Configure who receives daily flight schedule emails and which categories
        (Mono, Jato, Helicoptero, or All).
      </p>

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="email@company.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRecipient()}
          className="max-w-xs"
        />
        <Button onClick={addRecipient} disabled={saving}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Mono
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Jato
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Helicoptero
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                All
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Active
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {recipients.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{r.email}</td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.send_mono}
                    onCheckedChange={(v) =>
                      updateRecipient(r.id, "send_mono", v)
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.send_jato}
                    onCheckedChange={(v) =>
                      updateRecipient(r.id, "send_jato", v)
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.send_helicoptero}
                    onCheckedChange={(v) =>
                      updateRecipient(r.id, "send_helicoptero", v)
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.send_all}
                    onCheckedChange={(v) =>
                      updateRecipient(r.id, "send_all", v)
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.active}
                    onCheckedChange={(v) =>
                      updateRecipient(r.id, "active", v)
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeRecipient(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recipients.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500 text-sm">
            No recipients. Add an email above.
          </div>
        )}
      </div>
    </div>
  )
}
