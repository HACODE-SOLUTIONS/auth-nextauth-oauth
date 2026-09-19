# DevSpec: NextAuth / Auth.js OAuth + Sessions for AI Coding Agents

**Product**: NextAuth / Auth.js OAuth + Sessions for AI Coding Agents  
**Organization**: HACODE SOLUTIONS  
**Website**: https://hacode.solutions  
**License**: MIT  
**Version**: 1.0.0

---

## Overview

This DevSpec provides comprehensive guidance for AI coding agents implementing NextAuth / Auth.js OAuth authentication with session management in Next.js applications. It covers provider configuration, session strategies, middleware patterns, security best practices, and acceptance testing.

### Key Features

- **Multi-Provider OAuth**: GitHub, Google, Azure AD, Keycloak, custom OIDC
- **Flexible Sessions**: JWT and database session strategies
- **Middleware Protection**: Route-level authentication guards
- **Type Safety**: Full TypeScript support with session type extensions
- **Security First**: CSRF protection, secure cookies, token validation

---

## Architecture

### Core Components

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts          # Auth.js API routes
├── (protected)/
│   ├── dashboard/
│   │   └── page.tsx              # Protected page example
│   └── profile/
│       └── page.tsx              # User profile page
└── layout.tsx                     # Root layout with SessionProvider

middleware.ts                      # Route protection middleware
auth.ts                           # Auth.js configuration
auth.config.ts                    # Shared auth config (edge-compatible)
```

### Session Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Middleware  │────▶│   Route     │
│             │     │  (auth check)│     │  Handler    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       │                    ▼                     │
       │            ┌──────────────┐              │
       │            │   Session    │              │
       │            │   Store      │              │
       │            │ (JWT or DB)  │              │
       │            └──────────────┘              │
       │                    │                     │
       ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────┐
│             Auth.js (NextAuth v5)                   │
│  Providers │ Callbacks │ Events │ JWT │ Adapter    │
└─────────────────────────────────────────────────────┘
```

---

## OAuth Providers

### 1. GitHub Provider

**Use Case**: Developer tools, CI/CD platforms, coding agents

```typescript
import GitHub from "next-auth/providers/github"

export default {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email repo" // Adjust scopes
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        }
      }
    })
  ]
}
```

**Required Environment Variables**:
- `GITHUB_ID`: OAuth App Client ID from GitHub Developer Settings
- `GITHUB_SECRET`: OAuth App Client Secret

**Setup Steps**:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `https://yourapp.com/api/auth/callback/github`
4. Copy Client ID and generate Client Secret

### 2. Google Provider

**Use Case**: Consumer apps, workspace integrations, email-based authentication

```typescript
import Google from "next-auth/providers/google"

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    })
  ]
}
```

**Required Environment Variables**:
- `GOOGLE_ID`: OAuth 2.0 Client ID from Google Cloud Console
- `GOOGLE_SECRET`: OAuth 2.0 Client Secret

**Setup Steps**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `https://yourapp.com/api/auth/callback/google`
4. Copy Client ID and Client Secret

### 3. Azure AD Provider

**Use Case**: Enterprise SSO, Microsoft 365 integration, corporate environments

```typescript
import AzureAD from "next-auth/providers/azure-ad"

export default {
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email User.Read"
        }
      }
    })
  ]
}
```

**Required Environment Variables**:
- `AZURE_AD_CLIENT_ID`: Application (client) ID
- `AZURE_AD_CLIENT_SECRET`: Client secret value
- `AZURE_AD_TENANT_ID`: Directory (tenant) ID (or "common" for multi-tenant)

**Setup Steps**:
1. Azure Portal → App registrations → New registration
2. Add redirect URI: `https://yourapp.com/api/auth/callback/azure-ad`
3. Certificates & secrets → New client secret
4. API permissions → Add Microsoft Graph permissions

### 4. Custom OIDC Provider

**Use Case**: Keycloak, Auth0, Okta, custom identity providers

```typescript
export default {
  providers: [
    {
      id: "custom-oidc",
      name: "Custom OIDC",
      type: "oidc",
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      issuer: process.env.OIDC_ISSUER, // e.g., https://keycloak.example.com/realms/myrealm
      authorization: {
        params: {
          scope: "openid email profile"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        }
      }
    }
  ]
}
```

**Required Environment Variables**:
- `OIDC_CLIENT_ID`: Client ID from your OIDC provider
- `OIDC_CLIENT_SECRET`: Client secret
- `OIDC_ISSUER`: Provider's issuer URL (must have .well-known/openid-configuration)

---

## Session Strategy

### JWT Strategy (Default)

**Best for**: Stateless applications, serverless deployments, edge compatibility

```typescript
// auth.ts
export default {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.provider = account?.provider
      }
      
      // Add custom claims
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      
      return token
    },
    async session({ session, token }) {
      // Pass token data to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  }
}
```

**Pros**:
- No database required
- Works on Edge Runtime
- Fast session validation
- Horizontally scalable

**Cons**:
- Cannot invalidate sessions server-side
- Token size limits (~4KB cookie limit)
- Requires careful secret management

### Database Strategy

**Best for**: Applications needing session revocation, audit trails, active session management

```typescript
// auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export default {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  callbacks: {
    async session({ session, user }) {
      // User from database
      session.user.id = user.id
      session.user.role = user.role
      return session
    }
  }
}
```

**Required Schema** (Prisma example):

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("user")
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**Pros**:
- Server-side session revocation
- Session activity tracking
- Audit trails
- No token size limits

**Cons**:
- Database dependency
- Not edge-compatible
- Slower than JWT
- Requires database scaling

---

## Middleware

### Basic Route Protection

```typescript
// middleware.ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

### Advanced Middleware with Role-Based Access

```typescript
// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const token = req.auth

  // Public routes
  const publicRoutes = ["/", "/about", "/contact"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Require authentication
  if (!token) {
    const signInUrl = new URL("/api/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") && token.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

### API Route Protection

```typescript
// app/api/protected/route.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    message: "Protected data",
    user: req.auth.user
  })
})
```

### Edge-Compatible Middleware

```typescript
// auth.config.ts (edge-compatible config)
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
  providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
```

---

## Security Checklist

### ✅ Environment Variables

- [ ] All OAuth secrets stored in `.env.local` (never committed)
- [ ] `AUTH_SECRET` generated with `openssl rand -base64 32`
- [ ] Different secrets for dev/staging/production
- [ ] Environment variables validated at build time
- [ ] No hardcoded credentials in code

### ✅ Cookie Configuration

```typescript
// auth.ts
export default {
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}
```

- [ ] `httpOnly: true` (prevent XSS)
- [ ] `secure: true` in production (HTTPS only)
- [ ] `sameSite: "lax"` or `"strict"` (CSRF protection)
- [ ] Appropriate cookie domain for subdomains

### ✅ JWT Security

- [ ] Strong `AUTH_SECRET` (32+ bytes entropy)
- [ ] Token expiration configured (`maxAge`)
- [ ] Sensitive data encrypted in JWT (if needed)
- [ ] JWT algorithm validation (default: HS256)
- [ ] No sensitive data in JWT claims

### ✅ OAuth Configuration

- [ ] Redirect URIs whitelisted in OAuth providers
- [ ] Minimal required scopes requested
- [ ] PKCE enabled for public clients
- [ ] State parameter validated (automatic in Auth.js)
- [ ] Nonce parameter for OIDC (automatic in Auth.js)

### ✅ HTTPS & CORS

- [ ] Production app served over HTTPS
- [ ] Valid SSL certificates
- [ ] CORS configured for API routes (if needed)
- [ ] Trusted origins configured in `AUTH_TRUST_HOST`

### ✅ Session Management

- [ ] Session timeout configured appropriately
- [ ] Session refresh strategy implemented
- [ ] Logout invalidates session
- [ ] Concurrent session limits (if needed)

### ✅ Rate Limiting

```typescript
// Example with Vercel KV
import { Ratelimit } from "@upstash/ratelimit"
import { kv } from "@vercel/kv"

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
})

export const GET = auth(async (req) => {
  const { success } = await ratelimit.limit(req.auth?.user?.id || req.ip)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  // ... protected logic
})
```

- [ ] Rate limiting on auth endpoints
- [ ] Brute force protection on sign-in
- [ ] Per-user or per-IP rate limits

### ✅ Monitoring & Logging

```typescript
// auth.ts
export default {
  events: {
    async signIn({ user, account, profile }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`)
      // Send to monitoring service
    },
    async signOut({ session }) {
      console.log(`User signed out: ${session?.user?.email}`)
    },
  },
}
```

- [ ] Authentication events logged
- [ ] Failed login attempts tracked
- [ ] Session creation/destruction monitored
- [ ] Suspicious activity alerts configured

---

## AI Agent Prompts

### Prompt 1: Initial Setup

```
Set up NextAuth / Auth.js in a Next.js 14+ App Router project with the following:

1. Install dependencies: `next-auth@beta` (v5)
2. Generate AUTH_SECRET and add to .env.local
3. Create auth.ts with GitHub and Google providers
4. Set up API route handler at app/api/auth/[...nextauth]/route.ts
5. Add SessionProvider to root layout
6. Create middleware.ts to protect /dashboard routes
7. Add sign-in and sign-out buttons using useSession

Use JWT session strategy and TypeScript.
```

### Prompt 2: Add Database Sessions

```
Convert my NextAuth JWT sessions to database sessions using Prisma:

1. Install @auth/prisma-adapter and @prisma/client
2. Create Prisma schema with User, Account, Session, VerificationToken models
3. Update auth.ts to use PrismaAdapter
4. Change session strategy to "database"
5. Run prisma migrate dev
6. Update session callback to include user.id from database

Ensure existing JWT sessions are invalidated gracefully.
```

### Prompt 3: Implement Role-Based Access

```
Add role-based access control to my NextAuth setup:

1. Extend User model/JWT token with "role" field (user/admin)
2. Update JWT callback to include role in token
3. Update session callback to expose role in session
4. Create middleware to restrict /admin routes to admins only
5. Add role check helper function for server components
6. Update TypeScript types to include role in Session

Default new users to "user" role.
```

### Prompt 4: Add Custom OIDC Provider

```
Add a custom OIDC provider (Keycloak) to my NextAuth config:

Provider details:
- Issuer URL: https://auth.example.com/realms/myapp
- Client ID: myapp-client
- Scopes: openid email profile groups

1. Add provider configuration to auth.ts
2. Add environment variables to .env.local and .env.example
3. Map "groups" claim to user role
4. Test authentication flow
5. Document setup steps in README

Ensure provider works alongside existing GitHub/Google providers.
```

### Prompt 5: Secure API Routes

```
Secure my Next.js API routes with NextAuth:

1. Create auth wrapper for API route handlers
2. Add helper to extract user from request
3. Implement role-based API access (user/admin)
4. Add rate limiting using Upstash Redis
5. Return proper error responses (401/403)
6. Add TypeScript types for authenticated requests

Example routes: /api/users (admin only), /api/profile (authenticated)
```

---

## Acceptance Tests

### Test 1: OAuth Sign-In Flow

**Objective**: Verify user can sign in with GitHub OAuth

```typescript
// tests/auth/signin.spec.ts
import { test, expect } from "@playwright/test"

test("GitHub OAuth sign-in", async ({ page, context }) => {
  // Navigate to app
  await page.goto("http://localhost:3000")
  
  // Click sign-in button
  await page.click('button:has-text("Sign in with GitHub")')
  
  // Should redirect to GitHub
  await expect(page).toHaveURL(/github\.com/)
  
  // Fill GitHub credentials (use test account)
  await page.fill('input[name="login"]', process.env.TEST_GITHUB_USERNAME!)
  await page.fill('input[name="password"]', process.env.TEST_GITHUB_PASSWORD!)
  await page.click('input[type="submit"]')
  
  // Should redirect back to app
  await page.waitForURL("http://localhost:3000/**")
  
  // Should show authenticated state
  await expect(page.locator('text="Sign out"')).toBeVisible()
  await expect(page.locator(`text="${process.env.TEST_GITHUB_USERNAME}"`)).toBeVisible()
})
```

**Expected Result**: User successfully authenticated, redirected to dashboard, session created

**Failure Scenarios**:
- OAuth redirect URI mismatch → Fix in GitHub OAuth app settings
- Missing environment variables → Check .env.local
- CORS error → Verify AUTH_URL matches application URL

### Test 2: Session Persistence

**Objective**: Verify session persists across page reloads and browser restarts

```typescript
// tests/auth/session.spec.ts
import { test, expect } from "@playwright/test"

test("Session persists after reload", async ({ page, context }) => {
  // Sign in first
  await page.goto("http://localhost:3000")
  await page.click('button:has-text("Sign in")')
  // ... complete OAuth flow ...
  
  // Verify signed in
  await expect(page.locator('text="Sign out"')).toBeVisible()
  const username = await page.locator('[data-testid="username"]').textContent()
  
  // Reload page
  await page.reload()
  
  // Should still be signed in
  await expect(page.locator('text="Sign out"')).toBeVisible()
  await expect(page.locator('[data-testid="username"]')).toHaveText(username!)
})

test("Session persists after browser restart", async ({ browser, context }) => {
  // Create context with persistent storage
  const context1 = await browser.newContext({ storageState: undefined })
  const page1 = await context1.newPage()
  
  // Sign in
  await page1.goto("http://localhost:3000")
  // ... complete OAuth flow ...
  
  // Save cookies
  const cookies = await context1.cookies()
  await context1.close()
  
  // Create new context with saved cookies
  const context2 = await browser.newContext()
  await context2.addCookies(cookies)
  const page2 = await context2.newPage()
  
  // Should be signed in
  await page2.goto("http://localhost:3000")
  await expect(page2.locator('text="Sign out"')).toBeVisible()
  
  await context2.close()
})
```

**Expected Result**: Session cookie persists, user remains authenticated

**Failure Scenarios**:
- Cookie expires immediately → Check `session.maxAge` configuration
- Session lost on reload → Verify cookie `sameSite` and `secure` settings
- 401 errors → Check session token validation

### Test 3: Middleware Route Protection

**Objective**: Verify middleware blocks unauthenticated access to protected routes

```typescript
// tests/auth/middleware.spec.ts
import { test, expect } from "@playwright/test"

test("Protected route redirects to sign-in", async ({ page }) => {
  // Try to access protected route
  await page.goto("http://localhost:3000/dashboard")
  
  // Should redirect to sign-in
  await expect(page).toHaveURL(/\/api\/auth\/signin/)
  
  // Should include callback URL
  expect(page.url()).toContain("callbackUrl=%2Fdashboard")
})

test("Authenticated user can access protected route", async ({ page }) => {
  // Sign in first
  await page.goto("http://localhost:3000")
  await page.click('button:has-text("Sign in")')
  // ... complete OAuth flow ...
  
  // Navigate to protected route
  await page.goto("http://localhost:3000/dashboard")
  
  // Should show dashboard
  await expect(page).toHaveURL("http://localhost:3000/dashboard")
  await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
})

test("Admin route blocks non-admin users", async ({ page }) => {
  // Sign in as regular user
  await page.goto("http://localhost:3000")
  // ... sign in with non-admin account ...
  
  // Try to access admin route
  await page.goto("http://localhost:3000/admin")
  
  // Should redirect to unauthorized or home
  await expect(page).not.toHaveURL("http://localhost:3000/admin")
  await expect(page.locator('text="Unauthorized"')).toBeVisible()
})
```

**Expected Result**: Middleware correctly enforces authentication and authorization

**Failure Scenarios**:
- Protected routes accessible without auth → Check middleware matcher config
- Redirect loop → Verify sign-in page is excluded from middleware
- Admin check fails → Ensure role is included in session

### Test 4: Sign-Out Flow

**Objective**: Verify user can sign out and session is invalidated

```typescript
// tests/auth/signout.spec.ts
import { test, expect } from "@playwright/test"

test("User can sign out", async ({ page }) => {
  // Sign in first
  await page.goto("http://localhost:3000")
  await page.click('button:has-text("Sign in")')
  // ... complete OAuth flow ...
  
  // Verify signed in
  await expect(page.locator('text="Sign out"')).toBeVisible()
  
  // Click sign out
  await page.click('button:has-text("Sign out")')
  
  // Should show signed-out state
  await expect(page.locator('text="Sign in"')).toBeVisible()
  await expect(page.locator('text="Sign out"')).not.toBeVisible()
  
  // Protected route should be inaccessible
  await page.goto("http://localhost:3000/dashboard")
  await expect(page).toHaveURL(/\/api\/auth\/signin/)
})

test("Session cookie removed on sign-out", async ({ page, context }) => {
  // Sign in
  await page.goto("http://localhost:3000")
  // ... complete OAuth flow ...
  
  // Get cookies before sign-out
  const cookiesBefore = await context.cookies()
  const sessionCookie = cookiesBefore.find(c => 
    c.name.includes("next-auth.session-token")
  )
  expect(sessionCookie).toBeDefined()
  
  // Sign out
  await page.click('button:has-text("Sign out")')
  
  // Check cookies after sign-out
  const cookiesAfter = await context.cookies()
  const sessionCookieAfter = cookiesAfter.find(c => 
    c.name.includes("next-auth.session-token")
  )
  expect(sessionCookieAfter).toBeUndefined()
})
```

**Expected Result**: User signed out, session cookie removed, protected routes inaccessible

**Failure Scenarios**:
- Session persists after sign-out → Check signOut implementation
- Cookie not removed → Verify cookie clearing logic
- Can still access protected routes → Clear client-side session state

### Test 5: API Route Authentication

**Objective**: Verify API routes properly enforce authentication

```typescript
// tests/auth/api.spec.ts
import { test, expect } from "@playwright/test"

test("Unauthenticated API request returns 401", async ({ request }) => {
  const response = await request.get("http://localhost:3000/api/protected")
  
  expect(response.status()).toBe(401)
  
  const body = await response.json()
  expect(body.error).toBeTruthy()
})

test("Authenticated API request succeeds", async ({ page, request, context }) => {
  // Sign in first
  await page.goto("http://localhost:3000")
  // ... complete OAuth flow ...
  
  // Get session cookie
  const cookies = await context.cookies()
  
  // Make authenticated API request
  const response = await request.get("http://localhost:3000/api/protected", {
    headers: {
      cookie: cookies.map(c => `${c.name}=${c.value}`).join("; ")
    }
  })
  
  expect(response.status()).toBe(200)
  
  const body = await response.json()
  expect(body.user).toBeDefined()
  expect(body.user.email).toBeTruthy()
})

test("Admin API endpoint rejects non-admin", async ({ page, request, context }) => {
  // Sign in as regular user
  await page.goto("http://localhost:3000")
  // ... sign in with non-admin account ...
  
  const cookies = await context.cookies()
  
  // Attempt admin API call
  const response = await request.get("http://localhost:3000/api/admin/users", {
    headers: {
      cookie: cookies.map(c => `${c.name}=${c.value}`).join("; ")
    }
  })
  
  expect(response.status()).toBe(403)
})
```

**Expected Result**: API routes enforce authentication, return correct status codes

**Failure Scenarios**:
- 500 error instead of 401 → Check auth extraction logic
- Authenticated requests fail → Verify session token parsing
- Role check not working → Ensure role included in token/session

---

## TypeScript Types

### Extend Session Type

```typescript
// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
    accessToken?: string
  }

  interface User extends DefaultUser {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    accessToken?: string
  }
}
```

---

## Common Pitfalls

### 1. Middleware Infinite Loop

**Problem**: Middleware redirects to sign-in, which triggers middleware again

**Solution**: Exclude auth routes from middleware matcher

```typescript
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

### 2. Session Not Updating in Client

**Problem**: Session changes in callback not reflected in `useSession()`

**Solution**: Call `update()` from useSession or use `refetch`

```typescript
const { data: session, update } = useSession()

// After updating server-side
await update()
```

### 3. CSRF Token Mismatch

**Problem**: "CSRF token mismatch" error on sign-in

**Solution**: Ensure `AUTH_TRUST_HOST=true` in production or set `trustHost: true`

```typescript
// auth.ts
export default {
  trustHost: true,
  // ...
}
```

### 4. Edge Runtime Compatibility

**Problem**: Database adapter doesn't work with middleware

**Solution**: Use separate edge-compatible config in `auth.config.ts`

```typescript
// auth.config.ts (no database imports)
export const authConfig = {
  // edge-compatible config
}

// auth.ts (can import database)
import { authConfig } from "./auth.config"
export default NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
})
```

---

## Performance Optimization

### 1. Session Caching

```typescript
// Cache session in API routes to avoid repeated JWT decryption
import { unstable_cache } from "next/cache"

export const GET = auth(async (req) => {
  const cachedSession = await unstable_cache(
    async () => req.auth,
    ["session", req.auth?.user?.id],
    { revalidate: 60 } // Cache for 1 minute
  )()
  
  // Use cachedSession
})
```

### 2. Lazy Provider Loading

```typescript
// Only load provider libraries when needed
const providers = []

if (process.env.GITHUB_ID) {
  const GitHub = (await import("next-auth/providers/github")).default
  providers.push(GitHub({ ... }))
}

if (process.env.GOOGLE_ID) {
  const Google = (await import("next-auth/providers/google")).default
  providers.push(Google({ ... }))
}
```

---

## Troubleshooting

### Debug Mode

```typescript
// auth.ts
export default {
  debug: process.env.NODE_ENV === "development",
  // ...
}
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `[auth][error] Configuration` | Missing or invalid config | Check AUTH_SECRET and provider credentials |
| `[auth][error] AccessDenied` | OAuth authorization failed | Verify redirect URIs and scopes |
| `[auth][error] OAuthSignin` | OAuth provider error | Check provider status and credentials |
| `[auth][error] SessionRequired` | No session found | Verify session strategy and cookie config |
| `[auth][error] CallbackRouteError` | Callback handler error | Check callback implementation and logs |

---

## Additional Resources

- **Auth.js Documentation**: https://authjs.dev
- **Next.js Documentation**: https://nextjs.org/docs
- **OAuth 2.0 Spec**: https://oauth.net/2/
- **OIDC Spec**: https://openid.net/connect/
- **HACODE SOLUTIONS**: https://hacode.solutions

---

## License

MIT License - Free to use and modify

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-09-19  
**Maintained by**: HACODE SOLUTIONS
