import { handlers } from "@/auth"

/**
 * NextAuth API Route Handler
 * 
 * This exports the GET and POST handlers for NextAuth.
 * Handles all authentication requests:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/:provider
 * - /api/auth/session
 * - /api/auth/csrf
 * 
 * @see https://authjs.dev/getting-started/installation#configure
 */
export const { GET, POST } = handlers
