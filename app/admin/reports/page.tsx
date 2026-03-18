"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  getRecipients,
  addRecipient,
  updateRecipient,
  deleteRecipient,
  isValidEmail,
} from "@/lib/dailyReportRecipients"
import type { DailyReportRecipient } from "@/types/database"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react"

export default function ReportsPage() {
  const [recipients, setRecipients] = useState<DailyReportRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchRecipients = useCallback(async () => {
    const data = await getRecipients(supabase)
    setRecipients(data)
  }, [])

  useEffect(() => {
    fetchRecipients().finally(() => setLoading(false))
  }, [fetchRecipients])

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setAddError(null)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase()
    setAddError(null)
    if (!email) {
      setAddError("Enter an email address.")
      return
    }
    if (!isValidEmail(email)) {
      setAddError("Invalid email address.")
      return
    }
    setSaving(true)
    const { data, error } = await addRecipient(supabase, email)
    setSaving(false)
    if (error) {
      setAddError(error.message)
      return
    }
    setNewEmail("")
    await fetchRecipients()
    showSuccess("Recipient added.")
  }

  const handleUpdate = async (
    id: string,
    field: keyof Pick<
      DailyReportRecipient,
      "send_mono" | "send_jato" | "send_helicoptero" | "send_all" | "active"
    >,
    value: boolean
  ) => {
    const prev = recipients.find((r) => r.id === id)
    if (!prev) return

    // Optimistic update
    setRecipients((list) =>
      list.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    )
    setUpdatingId(id)

    // If turning "All" on, clear Mono/Jato/Helicoptero so backend rule holds
    const updates: Partial<DailyReportRecipient> = { [field]: value }
    if (field === "send_all" && value === true) {
      updates.send_mono = false
      updates.send_jato = false
      updates.send_helicoptero = false
    }

    const { error } = await updateRecipient(supabase, id, updates)
    setUpdatingId(null)
    if (error) {
      setRecipients((list) =>
        list.map((r) => (r.id === id ? { ...r, ...prev } : r))
      )
      setAddError(error.message)
      setTimeout(() => setAddError(null), 4000)
      return
    }
    showSuccess("Updated.")
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const { error } = await deleteRecipient(supabase, id)
    setDeletingId(null)
    if (error) {
      setAddError(error.message)
      setTimeout(() => setAddError(null), 4000)
      return
    }
    await fetchRecipients()
    showSuccess("Recipient removed.")
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
        (Mono, Jato, Helicoptero, or All). When &quot;All&quot; is on, category
        toggles are ignored. Emails are sent by n8n on a daily schedule.
      </p>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="email"
          placeholder="email@company.com"
          value={newEmail}
          onChange={(e) => {
            setNewEmail(e.target.value)
            setAddError(null)
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="max-w-xs"
          aria-invalid={!!addError}
        />
        <Button onClick={handleAdd} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add
        </Button>
        {addError && (
          <p className="w-full text-sm text-red-600" role="alert">
            {addError}
          </p>
        )}
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
                    disabled={updatingId === r.id || r.send_all}
                    onCheckedChange={(v) => handleUpdate(r.id, "send_mono", v)}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.send_jato}
                    disabled={updatingId === r.id || r.send_all}
                    onCheckedChange={(v) => handleUpdate(r.id, "send_jato", v)}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.send_helicoptero}
                    disabled={updatingId === r.id || r.send_all}
                    onCheckedChange={(v) =>
                      handleUpdate(r.id, "send_helicoptero", v)
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.send_all}
                    disabled={updatingId === r.id}
                    onCheckedChange={(v) => handleUpdate(r.id, "send_all", v)}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={r.active}
                    disabled={updatingId === r.id}
                    onCheckedChange={(v) => handleUpdate(r.id, "active", v)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                  >
                    {deletingId === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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
