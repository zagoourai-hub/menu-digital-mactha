"use client"

import { useActionState } from "react"
import { createEmployee } from "@/app/dashboard/staff/actions"

export function CreateEmployeeForm() {
  const [state, action, pending] = useActionState(createEmployee, {
    error: null,
    success: false,
  })
  return (
    <form
      action={action}
      className="max-w-xl space-y-4 border border-border bg-card p-5"
    >
      <fieldset disabled={pending} className="space-y-4">
        <label className="block text-sm font-semibold">
          Nama karyawan
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="off"
            className="mt-2 h-12 w-full border border-input bg-background px-4"
          />
        </label>
        <label className="block text-sm font-semibold">
          Email karyawan
          <input
            name="email"
            type="email"
            required
            autoComplete="off"
            className="mt-2 h-12 w-full border border-input bg-background px-4"
          />
        </label>
        <label className="block text-sm font-semibold">
          Kata sandi awal
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="mt-2 h-12 w-full border border-input bg-background px-4"
          />
        </label>
        <button
          type="submit"
          className="bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Buat akun karyawan"}
        </button>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-primary">
          Akun karyawan berhasil dibuat. Sampaikan email dan kata sandi awal
          kepada karyawan.
        </p>
      )}
    </form>
  )
}
