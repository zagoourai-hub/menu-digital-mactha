"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function RefreshOrdersButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Memuat…" : "Perbarui daftar"}
    </button>
  )
}
