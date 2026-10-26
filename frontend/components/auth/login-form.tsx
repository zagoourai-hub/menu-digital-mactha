"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, LoaderCircle, Mail, ShieldCheck } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, type FieldPath, useForm } from "react-hook-form"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth.schema"
import { signIn } from "@/lib/auth/auth-clients"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { SuccessAlert } from "./auth-alert"

const fieldClass =
  "h-12 w-full border border-input bg-background px-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"

export type MessageResponse = {
  message?: string
}

type FieldConfig = {
  name: Exclude<FieldPath<LoginFormValues>, "rememberDevice">
  label: string
  placeholder: string
  description?: string
  type?: React.HTMLInputTypeAttribute
}

const field: FieldConfig[] = [
  {
    name: "identifier",
    placeholder: "masukan email anda",
    type: "email",
    label: "Email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Masukan Password Anda",
    type: "password",
  },
]

export function LoginForm() {
  const router = useRouter()
  const [isRedirect, setIsRedirect] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [succes, setSucces] = useState<string>("")
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", rememberDevice: false },
  })

  async function onSubmit(data: LoginFormValues) {
    const res = await signIn.email({
      ...data,
      email: data.identifier,
      password: data.password,
      rememberMe: data.rememberDevice,
    })

    if (res.error) {
      form.setError("root", { message: res.error.message })
      return
    }

    if (res.data) {
      const messages = res.data as typeof res.data & MessageResponse
      setSucces(messages.message ?? "Login berhasil")
      setIsRedirect(true)
      setTimeout(() => router.replace("/dashboard"), 1500)
    }
  }

  if (isRedirect)
    return (
      <div className="mx-auto flex min-h-64 max-w-md flex-col items-center justify-center gap-4 text-center">
        <LoaderCircle
          className="size-9 animate-spin text-primary"
          aria-hidden="true"
        />
        <SuccessAlert message={succes} title="Login berhasil" />
        <p className="text-sm text-muted-foreground">
          Mengarahkan ke Dashboard...
        </p>
      </div>
    )

  return (
    <>
      <button
        type="button"
        disabled
        className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 border border-border bg-muted font-semibold text-muted-foreground"
        title="Login Google belum diaktifkan"
      >
        <span className="text-lg font-bold text-primary">G</span>
        Lanjutkan dengan Google <span className="text-xs">(segera hadir)</span>
      </button>

      <div className="my-5 flex items-center gap-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        atau email kedai
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {field.map((item) => (
          <Controller
            key={item.name}
            name={item.name}
            control={form.control}
            render={({ field: input, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel
                    htmlFor={input.name}
                    className="text-sm font-semibold text-card-foreground"
                  >
                    {item.label}
                  </FieldLabel>
                  {item.name === "password" && (
                    <Link
                      href="/#hubungi-kami"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Lupa sandi?
                    </Link>
                  )}
                </div>
                <div className="relative w-full">
                  {item.name === "identifier" && (
                    <Mail
                      className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <Input
                    {...input}
                    id={input.name}
                    type={
                      item.type === "password" && showPassword
                        ? "text"
                        : item.type
                    }
                    placeholder={item.placeholder}
                    autoComplete={
                      item.name === "password" ? "current-password" : "email"
                    }
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${input.name}-error` : undefined
                    }
                    className={`${fieldClass} ${item.name === "identifier" ? "pl-11" : "pr-12"}`}
                  />
                  {item.name === "password" && (
                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Sembunyikan kata sandi"
                          : "Tampilkan kata sandi"
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError
                    id={`${input.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        ))}

        <Controller
          name="rememberDevice"
          control={form.control}
          render={({ field: input }) => (
            <label className="flex items-center gap-2 text-sm text-card-foreground">
              <input
                ref={input.ref}
                name={input.name}
                type="checkbox"
                checked={input.value}
                onChange={input.onChange}
                onBlur={input.onBlur}
                className="size-4 accent-primary"
              />
              Ingat sesi perangkat ini
            </label>
          )}
        />

        {form.formState.errors.root?.message && (
          <p
            role="alert"
            className="bg-destructive/10 p-3 text-sm text-destructive"
          >
            {form.formState.errors.root.message}
          </p>
        )}
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 bg-primary px-5 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.formState.isSubmitting
            ? "Memproses login..."
            : "Masuk ke Dashboard"}
          {!form.formState.isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="mt-5 flex items-center gap-2 bg-muted p-3 text-xs leading-5 text-muted-foreground">
        <ShieldCheck
          className="size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        Gunakan email dan kata sandi akun kedai Anda untuk masuk.
      </p>
    </>
  )
}
