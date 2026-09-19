import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { authConfig } from "./auth.config"

/**
 * NextAuth / Auth.js Configuration
 * 
 * This is the main auth configuration file.
 * It exports:
 * - handlers: GET and POST handlers for the API route
 * - signIn/signOut: Server actions for authentication
 * - auth: Function to get session in server components
 * 
 * @see https://authjs.dev
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.provider = account?.provider
      }

      // Store access token (optional - for API calls to provider)
      if (account?.access_token) {
        token.accessToken = account.access_token
      }

      return token
    },
    async session({ session, token }) {
      // Add custom data to session
      if (session.user) {
        session.user.id = token.id as string
      }

      // Optional: expose access token
      // session.accessToken = token.accessToken as string

      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
})
