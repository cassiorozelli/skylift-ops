"use client"

type Props = {
  added: number
  updated: number
  cancelled: number
}

export function ProcessingSummaryCard({ added, updated, cancelled }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm font-semibold text-gray-900 mb-3">
        Email Processing Summary
      </p>
      <div className="space-y-1.5 text-sm text-gray-700 pl-0">
        <p>
          Added Flights: <span className="font-medium text-gray-900">{added}</span>
        </p>
        <p>
          Updated Flights:{" "}
          <span className="font-medium text-gray-900">{updated}</span>
        </p>
        <p>
          Cancelled Flights:{" "}
          <span className="font-medium text-gray-900">{cancelled}</span>
        </p>
      </div>
    </div>
  )
}
