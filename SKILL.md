# NextAuth / Auth.js OAuth + Sessions for AI Coding Agents

**HACODE SOLUTIONS**  
**Product**: NextAuth / Auth.js OAuth + Sessions  
**Website**: https://hacode.solutions  
**License**: MIT

---

## Overview

This skill provides AI coding agents with expert guidance on implementing NextAuth / Auth.js OAuth authentication with session management in Next.js applications. Use this when building authentication systems, configuring OAuth providers, managing sessions, or securing routes.

---

## When to Use This Skill

Use this skill when the user asks to:

- **Set up authentication** in a Next.js application
- **Add OAuth providers** (GitHub, Google, Azure AD, custom OIDC)
- **Configure session management** (JWT or database sessions)
- **Protect routes** with middleware or API authentication
- **Implement role-based access control** (RBAC)
- **Debug authentication issues** (CSRF, cookies, redirects)
- **Migrate from NextAuth v4 to v5** (Auth.js)
- **Secure API endpoints** with session validation
- **Add sign-in/sign-out functionality**
- **Extend session data** with custom claims

---

## Core Concepts

### Auth.js (NextAuth v5)

The latest version of NextAuth, now branded as Auth.js, with improved TypeScript support, edge compatibility, and simplified configuration.

**Key Changes from v4**:
- No `pages/api/auth/[...nextauth].ts` — uses `app/api/auth/[...nextauth]/route.ts`
- Unified `auth()` function for server components and API routes
- Better middleware integration
- Simplified provider configuration

### Session Strategies

**JWT (Recommended for most apps)**:
- Stateless, no database required
- Edge runtime compatible
- Fast validation
- Cannot revoke server-side

**Database**:
- Stateful, requires database
- Server-side revocation
- Audit trails
- Slower validation

---

## Quick Start Guide

### 1. Installation

```bash
npm install next-auth@beta
npm install @auth/prisma-adapter @prisma/client  # Optional: for database sessions
```

### 2. Environment Variables

```env
# Required
AUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000  # Production: https://yourdomain.com

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

### 3. Create Auth Configuration

```typescript
// auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
```

### 4. API Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

### 5. Add SessionProvider

```typescript
// app/layout.tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

### 6. Middleware for Route Protection

```typescript
// middleware.ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

### 7. Sign In/Out Components

```typescript
// components/auth-button.tsx
"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <button onClick={() => signIn()}>Sign in</button>
  )
}
```

---

## Common Patterns

### Pattern 1: Protect Server Components

```typescript
// app/dashboard/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
    </div>
  )
}
```

### Pattern 2: Protect API Routes

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

### Pattern 3: Role-Based Access Control

```typescript
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ...
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "user"  // Default role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})

// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  if (pathname.startsWith("/admin")) {
    if (req.auth?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return NextResponse.next()
})

// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}
```

### Pattern 4: Custom Sign-In Page

```typescript
// app/login/page.tsx
"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => signIn("github")}>
        Sign in with GitHub
      </button>
      <button onClick={() => signIn("google")}>
        Sign in with Google
      </button>
    </div>
  )
}

// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
  // ...
})
```

### Pattern 5: Database Sessions with Prisma

```typescript
// auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ...
})

// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
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
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## OAuth Provider Configurations

### GitHub

```typescript
import GitHub from "next-auth/providers/github"

GitHub({
  clientId: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  authorization: {
    params: {
      scope: "read:user user:email repo",
    }
  },
})
```

**Setup**: GitHub Settings → Developer settings → OAuth Apps → New OAuth App  
**Callback URL**: `https://yourdomain.com/api/auth/callback/github`

### Google

```typescript
import Google from "next-auth/providers/google"

Google({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code",
    }
  },
})
```

**Setup**: Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID  
**Callback URL**: `https://yourdomain.com/api/auth/callback/google`

### Azure AD

```typescript
import AzureAD from "next-auth/providers/azure-ad"

AzureAD({
  clientId: process.env.AZURE_AD_CLIENT_ID,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
  tenantId: process.env.AZURE_AD_TENANT_ID,
})
```

**Setup**: Azure Portal → App registrations → New registration  
**Callback URL**: `https://yourdomain.com/api/auth/callback/azure-ad`

### Custom OIDC (Keycloak, Auth0, Okta)

```typescript
{
  id: "keycloak",
  name: "Keycloak",
  type: "oidc",
  clientId: process.env.KEYCLOAK_ID,
  clientSecret: process.env.KEYCLOAK_SECRET,
  issuer: process.env.KEYCLOAK_ISSUER,
}
```

---

## Troubleshooting

### CSRF Token Mismatch

**Error**: `[auth][error] CSRF token mismatch`

**Causes**:
- Incorrect `AUTH_URL` in production
- Missing `trustHost` configuration
- Proxy/load balancer issues

**Solution**:
```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  // ...
})
```

### Session Not Found

**Error**: `[auth][error] SessionRequired`

**Causes**:
- Missing `SessionProvider` in layout
- Cookie not being set
- Incorrect cookie domain

**Solution**:
1. Wrap app with `<SessionProvider>`
2. Check browser DevTools → Application → Cookies
3. Verify `AUTH_SECRET` is set
4. Check cookie `secure` flag matches HTTPS

### Middleware Redirect Loop

**Error**: Infinite redirects between sign-in and protected routes

**Cause**: Sign-in page protected by middleware

**Solution**:
```typescript
// middleware.ts
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
}
```

### TypeScript Errors

**Error**: `Property 'role' does not exist on type 'User'`

**Solution**: Extend types
```typescript
// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}
```

---

## Security Best Practices

### ✅ Always Do

1. **Generate strong AUTH_SECRET**: `openssl rand -base64 32`
2. **Use environment variables**: Never hardcode secrets
3. **Enable HTTPS in production**: Set `secure: true` on cookies
4. **Set appropriate cookie options**: `httpOnly`, `sameSite: "lax"`
5. **Validate redirect URLs**: Use `AUTH_REDIRECT_PROXY_URL` if needed
6. **Implement rate limiting**: Protect sign-in endpoints
7. **Use minimal OAuth scopes**: Only request what you need
8. **Monitor auth events**: Log sign-ins, failures, anomalies
9. **Set session expiration**: Configure `maxAge` appropriately
10. **Keep dependencies updated**: Regularly update `next-auth`

### ❌ Never Do

1. **Commit secrets to Git**: Use `.env.local` (gitignored)
2. **Store sensitive data in JWT**: Tokens are base64-encoded, not encrypted
3. **Disable CSRF protection**: Keep default settings
4. **Use HTTP in production**: Always use HTTPS
5. **Trust user input**: Validate all data
6. **Ignore security headers**: Use helmet.js or Next.js headers
7. **Skip session validation**: Always check `session` in protected routes
8. **Use weak secrets**: Minimum 32 bytes entropy
9. **Expose error details**: Generic error messages to users
10. **Allow unlimited sign-in attempts**: Implement rate limiting

---

## Migration from NextAuth v4

### Key Changes

1. **Package name**: `next-auth@beta` (v5 still in beta as of 2026)
2. **API routes**: `app/api/auth/[...nextauth]/route.ts` instead of `pages/api/auth/[...nextauth].ts`
3. **Unified auth function**: Single `auth()` for server components and API routes
4. **Edge compatibility**: Better edge runtime support
5. **TypeScript**: Improved type inference

### Migration Steps

1. Update package: `npm install next-auth@beta`
2. Move API route to App Router
3. Update imports: `import { auth } from "@/auth"`
4. Replace `getServerSession()` with `auth()`
5. Update middleware syntax
6. Test thoroughly

---

## Performance Optimization

1. **Use JWT sessions** for serverless/edge deployments
2. **Cache session lookups** in API routes (with short TTL)
3. **Lazy load providers** based on enabled features
4. **Use edge middleware** for fastest route protection
5. **Implement session refresh** only when needed
6. **Optimize database queries** if using database sessions

---

## Testing

### Unit Tests (Jest)

```typescript
// __tests__/auth.test.ts
import { signIn, signOut } from "@/auth"

jest.mock("next-auth")

describe("Authentication", () => {
  it("should sign in user", async () => {
    const mockSignIn = signIn as jest.Mock
    mockSignIn.mockResolvedValue({ url: "/dashboard" })

    await signIn("github")

    expect(mockSignIn).toHaveBeenCalledWith("github")
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test"

test("OAuth sign-in flow", async ({ page }) => {
  await page.goto("http://localhost:3000")
  await page.click('button:has-text("Sign in with GitHub")')
  
  // Complete OAuth flow
  await expect(page).toHaveURL(/github\.com/)
  
  // Fill credentials and authorize
  // ...
  
  // Should redirect back
  await expect(page.locator('text="Sign out"')).toBeVisible()
})
```

---

## Additional Resources

- **Auth.js Documentation**: https://authjs.dev
- **Next.js App Router**: https://nextjs.org/docs/app
- **OAuth 2.0 RFC**: https://datatracker.ietf.org/doc/html/rfc6749
- **OIDC Specification**: https://openid.net/specs/openid-connect-core-1_0.html
- **HACODE SOLUTIONS**: https://hacode.solutions

---

## AI Agent Implementation Workflow

When implementing NextAuth for a user:

1. **Assess requirements**:
   - Which OAuth providers?
   - JWT or database sessions?
   - Role-based access needed?
   - Edge deployment?

2. **Install dependencies**:
   ```bash
   npm install next-auth@beta
   # If database sessions:
   npm install @auth/prisma-adapter @prisma/client
   ```

3. **Configure environment variables**:
   - Generate `AUTH_SECRET`
   - Add provider credentials
   - Set `AUTH_URL`

4. **Create auth configuration** (`auth.ts`)

5. **Set up API route handler** (`app/api/auth/[...nextauth]/route.ts`)

6. **Add SessionProvider** to root layout

7. **Create middleware** for route protection (if needed)

8. **Add sign-in/sign-out UI components**

9. **Implement protected routes** (server components, API routes)

10. **Add TypeScript type extensions** (if custom session data)

11. **Test authentication flow** (sign-in, sign-out, protected routes)

12. **Document setup** (environment variables, provider setup steps)

---

## License

MIT License - Free to use and modify

---

**Skill Version**: 1.0.0  
**Last Updated**: 2026-09-19  
**Maintained by**: HACODE SOLUTIONS  
**Website**: https://hacode.solutions
