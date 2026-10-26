import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type MessageProps = { message: string; title?: string }

export function SuccessAlert({
  message,
  title = "Registrasi berhasil",
}: MessageProps) {
  return (
    <Alert role="status">
      <CheckCircle2Icon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function ErrorAlert({
  message,
  title = "Registrasi gagal",
}: MessageProps) {
  return (
    <Alert role="alert" variant="destructive">
      <AlertCircleIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
