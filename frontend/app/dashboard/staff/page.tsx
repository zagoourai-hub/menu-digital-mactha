import type { Metadata } from "next"
import { requireAdmin } from "@/lib/auth/permissions"
import { CreateEmployeeForm } from "@/components/dashboard/create-employee-form"

export const metadata: Metadata = { title: "Karyawan | Matcha Yuk" }

export default async function StaffPage() {
  await requireAdmin()
  return (
    <>
      <section className="border border-border bg-card p-5 sm:p-6">
        <h1 className="font-serif text-3xl font-bold">Akun Karyawan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Karyawan dapat memproses pesanan dan mencatat keuangan. Pengelolaan
          produk dan koreksi keuangan hanya untuk pemilik kedai.
        </p>
      </section>
      <CreateEmployeeForm />
    </>
  )
}
