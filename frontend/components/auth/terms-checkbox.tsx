"use client"

import { Controller, type Control } from "react-hook-form"
import { Field, FieldError } from "@/components/ui/field"
import type { RegisterFormValues } from "@/lib/schemas/auth.schema"

export function TermsCheckbox({
  control,
}: {
  control: Control<RegisterFormValues>
}) {
  return (
    <Controller
      name="terms"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1">
          <label className="flex items-start gap-3 text-sm leading-5 text-muted-foreground">
            <input
              type="checkbox"
              name={field.name}
              ref={field.ref}
              checked={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? "terms-error" : undefined}
              className="mt-1 size-4 shrink-0 accent-primary"
            />
            <span>
              Saya menyetujui ketentuan layanan dan kebijakan privasi Matcha
              Yuk.
            </span>
          </label>
          {fieldState.invalid && (
            <FieldError id="terms-error" errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  )
}
