# NextAuth / Auth.js OAuth + Sessions for AI Coding Agents

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple)](https://authjs.dev/)

**Free DevSpec by [HACODE SOLUTIONS](https://hacode.solutions)**

A complete, production-ready DevSpec pack for implementing NextAuth / Auth.js OAuth authentication with session management in Next.js applications. Built specifically for AI coding agents with comprehensive documentation, prompts, and acceptance tests.

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/hacode-solutions/auth-nextauth-oauth.git
cd auth-nextauth-oauth
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OAuth credentials:

```env
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-secret-here

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test Authentication

1. Click "Sign In" button
2. Choose GitHub or Google
3. Complete OAuth flow
4. Access protected pages: `/dashboard`, `/profile`

---

## 📦 What's Included

### Core Documentation

- **`DEVSPEC.md`** - Complete development specification
  - OAuth provider configurations (GitHub, Google, Azure AD, custom OIDC)
  - JWT and database session strategies
  - Middleware patterns and route protection
  - Security checklist and best practices
  - AI agent prompts for common tasks
  - Acceptance test scenarios

- **`SKILL.md`** - AI agent skill guide
  - Quick start guide
  - Common implementation patterns
  - Troubleshooting guide
  - Security best practices
  - Migration guide from NextAuth v4

### Next.js Application

A minimal, production-ready Next.js 14 App Router application with:

- ✅ NextAuth / Auth.js v5 configured
- ✅ JWT session strategy (edge-compatible)
- ✅ GitHub and Google OAuth providers
- ✅ Middleware route protection
- ✅ TypeScript type extensions
- ✅ Protected pages (`/dashboard`, `/profile`)
- ✅ Custom sign-in page
- ✅ Sign-in/sign-out components

### File Structure

```
.
├── DEVSPEC.md                    # Complete DevSpec documentation
├── SKILL.md                      # AI agent skill guide
├── README.md                     # This file
├── LICENSE                       # MIT license
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.mjs               # Next.js config
├── middleware.ts                 # Route protection middleware
├── auth.ts                       # Auth.js configuration
├── auth.config.ts                # Edge-compatible auth config
├── types/
│   └── next-auth.d.ts           # TypeScript type extensions
├── app/
│   ├── layout.tsx               # Root layout with SessionProvider
│   ├── globals.css              # Global styles
│   ├── page.tsx                 # Home page
│   ├── login/
│   │   └── page.tsx            # Sign-in page
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard
│   ├── profile/
│   │   └── page.tsx            # Protected profile page
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts    # Auth.js API route
└── components/
    └── auth-buttons.tsx         # Sign-in/sign-out components
```

---

## 🔐 OAuth Provider Setup

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to `.env.local`:
   ```env
   GITHUB_ID=your-client-id
   GITHUB_SECRET=your-client-secret
   ```

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret
5. Add to `.env.local`:
   ```env
   GOOGLE_ID=your-client-id
   GOOGLE_SECRET=your-client-secret
   ```

### Additional Providers

See `DEVSPEC.md` for detailed configuration of:
- Azure AD
- Custom OIDC (Keycloak, Auth0, Okta)

---

## 🛠️ Usage

### Server Components

```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/api/auth/signin")
  }

  return <div>Hello, {session.user?.name}!</div>
}
```

### API Routes

```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ user: req.auth.user })
})
```

### Client Components

```typescript
"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return <button onClick={() => signOut()}>Sign out</button>
  }

  return <button onClick={() => signIn()}>Sign in</button>
}
```

---

## 🤖 AI Agent Prompts

Copy these prompts to quickly implement common authentication patterns:

### Basic Setup

```
Set up NextAuth / Auth.js in this Next.js 14+ App Router project with GitHub and Google OAuth providers. Use JWT sessions and protect /dashboard routes with middleware. Include TypeScript types.
```

### Add Custom Provider

```
Add a custom OIDC provider (Keycloak) to my NextAuth config:
- Issuer: https://auth.example.com/realms/myapp
- Client ID: myapp-client
- Scopes: openid email profile groups
Include environment variables and setup documentation.
```

### Implement Role-Based Access

```
Add role-based access control to my NextAuth setup:
- Extend JWT and session with "role" field
- Restrict /admin routes to admin role only
- Update TypeScript types
Default new users to "user" role.
```

More prompts available in `DEVSPEC.md`.

---

## 📚 Documentation

- **[DEVSPEC.md](./DEVSPEC.md)** - Complete development specification
- **[SKILL.md](./SKILL.md)** - AI agent skill guide
- **[Auth.js Documentation](https://authjs.dev)** - Official Auth.js docs
- **[Next.js Documentation](https://nextjs.org/docs)** - Next.js App Router docs

---

## 🔒 Security

This implementation follows security best practices:

- ✅ Strong `AUTH_SECRET` generation
- ✅ `httpOnly` session cookies
- ✅ CSRF protection (automatic)
- ✅ Secure cookies in production
- ✅ `sameSite` cookie attribute
- ✅ Token validation
- ✅ Environment variable validation

See `DEVSPEC.md` for complete security checklist.

---

## 🧪 Testing

### Build Test

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

### E2E Testing (Playwright)

See `DEVSPEC.md` for complete acceptance test scenarios.

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `AUTH_SECRET`
   - `GITHUB_ID` / `GITHUB_SECRET`
   - `GOOGLE_ID` / `GOOGLE_SECRET`
4. Update OAuth callback URLs to production domain
5. Deploy

### Other Platforms

Ensure you:
- Set `AUTH_URL` to your production URL
- Update OAuth provider callback URLs
- Set `AUTH_TRUST_HOST=true` if behind proxy
- Use HTTPS in production

---

## 🤝 Contributing

This is a free DevSpec pack maintained by HACODE SOLUTIONS. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - Free to use and modify

Copyright (c) 2026 HACODE SOLUTIONS

See [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **HACODE SOLUTIONS**: [https://hacode.solutions](https://hacode.solutions)
- **Auth.js**: [https://authjs.dev](https://authjs.dev)
- **Next.js**: [https://nextjs.org](https://nextjs.org)
- **GitHub Repository**: [https://github.com/hacode-solutions/auth-nextauth-oauth](https://github.com/hacode-solutions/auth-nextauth-oauth)

---

## 💬 Support

- 📖 Read the [DEVSPEC.md](./DEVSPEC.md) for detailed guidance
- 🤖 Use [SKILL.md](./SKILL.md) prompts with AI coding agents
- 🌐 Visit [HACODE SOLUTIONS](https://hacode.solutions) for more resources
- 📧 Contact: support@hacode.solutions

---

**Built with ❤️ by [HACODE SOLUTIONS](https://hacode.solutions)**
