"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { SuccessAlert } from "@/components/auth/auth-alert"

export function CrudSuccessPopup({
  title,
  message,
}: {
  title: string
  message: string
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 5000)
    return () => window.clearTimeout(timeout)
  }, [])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-100 flex items-start justify-center p-4 pt-6 sm:pt-8">
      <div className="animate-[crud-success-pop_300ms_ease-out_both] pointer-events-auto relative w-full max-w-sm shadow-lg motion-reduce:animate-none [&_[data-slot=alert]]:pr-12">
        <SuccessAlert title={title} message={message} />
        <button
          type="button"
          aria-label="Tutup notifikasi"
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
