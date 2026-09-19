import { DefaultSession } from "next-auth"

/**
 * TypeScript type extensions for NextAuth
 * 
 * Extend the built-in session and JWT types to include custom fields.
 * This provides type safety when accessing session.user.id and other custom properties.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    provider?: string
    accessToken?: string
  }
}
