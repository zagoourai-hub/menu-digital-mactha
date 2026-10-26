import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "@/lib/auth/auth"

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: "http://localhost:3001",
  plugins: [inferAdditionalFields<typeof auth>()],
})
