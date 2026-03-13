import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-lg font-semibold text-gray-900">Página não encontrada</h2>
      <p className="text-sm text-gray-600">
        A página que você está procurando não existe.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Voltar ao dashboard
      </Link>
    </div>
  )
}
