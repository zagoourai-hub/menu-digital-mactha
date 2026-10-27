import { APIError, createAuthMiddleware } from "better-auth/api"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { authSignInSchema, authSignUpSchema } from "@/lib/schemas/auth.schema"
import { prisma } from "../prisma/prisma"
import { i18n, locales } from "@better-auth/i18n"
import { nextCookies } from "better-auth/next-js"

const validateAuthBody = createAuthMiddleware(async (ctx) => {
  const result =
    ctx.path === "/sign-in/email"
      ? authSignInSchema.safeParse(ctx.body)
      : ctx.path === "/sign-up/email"
        ? authSignUpSchema.safeParse(ctx.body)
        : null

  if (result && !result.success) {
    throw new APIError("BAD_REQUEST", {
      message:
        result.error.issues[0]?.message ?? "Data autentikasi tidak valid",
    })
  }
})

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
      namaKedai: { type: "string", required: false },
      kota: { type: "string", required: false },
      phone: { type: "string", required: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  plugins: [
    i18n({
      translations: {
        ...locales,
        id: {
          ...locales.id,
          INVALID_EMAIL_OR_PASSWORD: "Email Atau Kata Sandi Salah",
        },
      },
    }),
    admin(),
    nextCookies(),
  ],
  hooks: {
    before: validateAuthBody,
    after: createAuthMiddleware(async (ctx) => {
      const response = ctx.context.returned
      const message =
        ctx.path === "/sign-in/email"
          ? "Login berhasil"
          : ctx.path === "/sign-up/email"
            ? "Registrasi berhasil"
            : null

      if (
        !message ||
        !ctx.context.newSession ||
        !response ||
        typeof response !== "object"
      ) {
        return
      }

      return ctx.json({ ...response, message })
    }),
  },
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  advanced: {
    database: {
      joins: true,
    },
  },
  trustedOrigins: [
    "http://localhost:3001",
    ...(process.env.APP_URL ? [process.env.APP_URL] : []),
  ],
})
