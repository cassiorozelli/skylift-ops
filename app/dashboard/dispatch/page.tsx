import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DispatchBoard } from "@/components/dispatch-board"

export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <h1 className="text-xl font-semibold text-gray-900">
        Aircraft Dispatch Board
      </h1>

      <DispatchBoard />
    </div>
  )
}
