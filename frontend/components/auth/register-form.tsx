"use client"

import { useRef, useState } from "react"
import { Eye, EyeOff, LoaderCircle, WifiOff } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Controller,
  type FieldPath,
  type SubmitHandler,
  useForm,
} from "react-hook-form"
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/schemas/auth.schema"
import { Field, FieldError, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { ErrorAlert, SuccessAlert } from "./auth-alert"
import { TermsCheckbox } from "./terms-checkbox"
import { signUp } from "@/lib/auth/auth-clients"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

const fieldClass =
  "h-12 w-full rounded-none border border-input bg-background px-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"

type FieldConfig = {
  name: Exclude<FieldPath<RegisterFormValues>, "terms">
  label: string
  placeholder: string
  description?: string
  type?: React.HTMLInputTypeAttribute
}
const fields: FieldConfig[] = [
  {
    name: "name",
    label: "Nama Pemilik",
    placeholder: "Masukkan nama pemilik",
    description: "Nama lengkap pemilik kedai.",
  },
  {
    name: "namaKedai",
    label: "Nama Kedai",
    placeholder: "Masukkan nama kedai",
    description: "Nama usaha atau kedai Anda.",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "example@gmail.com",
    type: "email",
  },
  {
    name: "phone",
    label: "Nomor WhatsApp",
    placeholder: "62123456789",
    type: "tel",
  },
  {
    name: "kota",
    label: "Kota",
    placeholder: "Masukan Nama Kota",
    type: "text",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Masukan password anda 8 karakter",
    type: "password",
  },
  {
    name: "confirmPassword",
    label: "Konfirmasi Password",
    placeholder: "Ulangi password",
    type: "password",
  },
]

export type MessageResponse = {
  message?: string;
};

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorConnect, setErrorconnect] = useState<string>('')
  const submitting = useRef(false)
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      namaKedai: "",
      phone: "",
      kota: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    if (submitting.current || successMessage) return
    submitting.current = true
    setSuccessMessage(null)
    form.clearErrors("root")

    try {
      const res = await signUp.email(
        {
          name: values.name,
          namaKedai: values.namaKedai,
          kota: values.kota,
          phone: values.phone,
          email: values.email,
          password: values.password,
        })

      if (res.error) {

        if (res.error.status === 0) {
          setErrorconnect('gagal terhubung ke server')
          return
        }

        form.setError("root", { message: res.error.message })
      }

      if (res.data) {
        const response = res.data as typeof res.data & MessageResponse;
        setSuccessMessage(response.message ?? null);
      }


    } catch {
      form.setError("root", { message: "Koneksi gagal. Coba lagi." })
      setErrorconnect( 'koneksi gaga coba lagi')
    } finally {
      submitting.current = false
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event)
      }}
      aria-busy={form.formState.isSubmitting}
      className="space-y-5"
    >
      <p className="w-fit bg-primary/10 px-3 py-2 text-xs font-bold tracking-wide text-primary uppercase">
        Uji coba gratis 14 hari tanpa kartu kredit
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Controller
            key={f.name}
            name={f.name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className={
                  f.name === "email" ? "min-w-0 sm:col-span-2" : "min-w-0"
                }
                data-invalid={fieldState.invalid}
              >
                <FieldLabel
                  htmlFor={field.name}
                  className="text-sm font-semibold text-card-foreground"
                >
                  {f.label}
                </FieldLabel>

                <div className="relative w-full">
                  <Input
                    {...field}
                    className={`${fieldClass} ${f.type === "password" ? "pr-12" : ""}`}
                    id={field.name}
                    type={
                      f.type === "password" && showPassword ? "text" : f.type
                    }
                    placeholder={f.placeholder}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    autoComplete={
                      f.type === "password"
                        ? "new-password"
                        : f.name === "email"
                          ? "email"
                          : f.name === "phone"
                            ? "tel"
                            : "off"
                    }
                  />
                  {f.name === "password" && (
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
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  )}
                </div>

                {fieldState.invalid && (
                  <FieldError
                    id={`${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        ))}
      </div>

      <TermsCheckbox control={form.control} />

      {form.formState.errors.root?.message && (
        <ErrorAlert message={form.formState.errors.root.message} />
      )}
      {successMessage && <SuccessAlert message={successMessage} />}

      {errorConnect && (
        <Alert variant="destructive">
          <WifiOff />
          <AlertTitle>Kesalahan Koneksi</AlertTitle>
          <AlertDescription>{errorConnect}</AlertDescription>
        </Alert>
      )}

      <button
        type="submit"
        disabled={form.formState.isSubmitting || Boolean(successMessage)}
        className="flex h-12 w-full items-center justify-center gap-2 bg-primary px-5 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {form.formState.isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Memproses pendaftaran...
          </>
        ) : successMessage ? (
          "Pendaftaran berhasil"
        ) : (
          <>
            Daftar kedai <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    </form>
  )
}
