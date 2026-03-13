export const AIRCRAFT_COLORS: Record<string, string> = {
  "PR-FAD": "green",
  "PR-YRM": "blue",
  "PP-CGP": "purple",
  "PS-GJR": "orange",
  "PR-WZR": "teal",
  "PS-NVZ": "indigo",
}

const TAILWIND_COLORS: Record<string, { border: string; bg: string; badge: string }> = {
  green: { border: "border-l-green-500", bg: "bg-green-50/50", badge: "bg-green-100 text-green-800" },
  blue: { border: "border-l-blue-500", bg: "bg-blue-50/50", badge: "bg-blue-100 text-blue-800" },
  purple: { border: "border-l-purple-500", bg: "bg-purple-50/50", badge: "bg-purple-100 text-purple-800" },
  orange: { border: "border-l-orange-500", bg: "bg-orange-50/50", badge: "bg-orange-100 text-orange-800" },
  teal: { border: "border-l-teal-500", bg: "bg-teal-50/50", badge: "bg-teal-100 text-teal-800" },
  indigo: { border: "border-l-indigo-500", bg: "bg-indigo-50/50", badge: "bg-indigo-100 text-indigo-800" },
}

export function getAircraftColor(aeronave: string | null): { border: string; bg: string; badge: string } {
  const key = (aeronave ?? "").trim().toUpperCase()
  const colorKey = AIRCRAFT_COLORS[key] ?? "gray"
  return TAILWIND_COLORS[colorKey] ?? TAILWIND_COLORS.green
}

export function getAircraftColorKey(aeronave: string | null): string {
  const key = (aeronave ?? "").trim().toUpperCase()
  return AIRCRAFT_COLORS[key] ?? "green"
}
