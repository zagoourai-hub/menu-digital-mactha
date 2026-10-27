"use server"

import { APIError } from "better-auth/api"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { requireAdmin } from "@/lib/auth/permissions"
import { employeeSchema } from "@/lib/schemas/auth.schema"

export async function createEmployee(
  _previous: { error: string | null; success: boolean },
  formData: FormData
) {
  await requireAdmin()
  const result = employeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!result.success)
    return { error: result.error.issues[0].message, success: false }
  try {
    await auth.api.createUser({
      headers: await headers(),
      body: { ...result.data, role: "user" },
    })
  } catch (error) {
    if (!(error instanceof APIError)) throw error
    return {
      error: error.body?.code?.startsWith("USER_ALREADY_EXISTS")
        ? "Email sudah digunakan."
        : "Akun karyawan belum dapat dibuat.",
      success: false,
    }
  }
  return { error: null, success: true }
}
