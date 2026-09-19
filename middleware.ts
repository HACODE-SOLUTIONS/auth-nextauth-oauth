import { auth } from "@/auth"

/**
 * NextAuth Middleware
 * 
 * Protects routes by checking authentication status.
 * Uses the authorized callback from auth.config.ts
 * 
 * Matcher excludes:
 * - API routes (except auth)
 * - Static files (_next/static)
 * - Image optimization files (_next/image)
 * - Favicon
 * - Public assets
 */
export default auth

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (*.png, *.jpg, *.svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
}
