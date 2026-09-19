import type { NextAuthConfig } from "next-auth"

/**
 * Edge-compatible auth configuration
 * This file can be imported in middleware (Edge Runtime)
 * No database or heavy imports allowed here
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnProfile = nextUrl.pathname.startsWith("/profile")
      const isOnLogin = nextUrl.pathname.startsWith("/login")

      // Protect dashboard and profile routes
      if (isOnDashboard || isOnProfile) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }

      // Redirect authenticated users away from login page
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },
  providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
