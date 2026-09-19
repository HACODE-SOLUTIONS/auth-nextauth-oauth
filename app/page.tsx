import Link from "next/link"
import { auth } from "@/auth"
import { SignInButton, SignOutButton } from "@/components/auth-buttons"

export default async function HomePage() {
  const session = await auth()

  return (
    <>
      <header>
        <nav>
          <div>
            <Link href="/" style={{ fontSize: "1.25rem", fontWeight: "600" }}>
              NextAuth Demo
            </Link>
          </div>
          <div className="nav-links">
            <Link href="/">Home</Link>
            {session ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/profile">Profile</Link>
              </>
            ) : null}
          </div>
        </nav>
      </header>

      <div className="container">
        <div className="card">
          <h1>NextAuth / Auth.js OAuth Demo</h1>
          <p>
            A minimal Next.js App Router example with NextAuth / Auth.js OAuth
            authentication.
          </p>
          <p>
            Built by <a href="https://hacode.solutions" target="_blank" rel="noopener noreferrer" style={{ color: "#0070f3" }}>HACODE SOLUTIONS</a>
          </p>

          {session ? (
            <div style={{ marginTop: "2rem" }}>
              <p style={{ marginBottom: "1rem" }}>
                ✅ You are signed in as <strong>{session.user?.email}</strong>
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link href="/dashboard" className="button button-primary">
                  Go to Dashboard
                </Link>
                <SignOutButton />
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "2rem" }}>
              <p style={{ marginBottom: "1rem" }}>
                Sign in to access protected pages
              </p>
              <Link href="/login" className="button button-primary">
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>🔐 Multiple OAuth Providers</h3>
            <p>
              Supports GitHub, Google, Azure AD, and custom OIDC providers
              out of the box.
            </p>
          </div>
          <div className="feature-card">
            <h3>🚀 JWT Sessions</h3>
            <p>
              Stateless JWT sessions for fast, edge-compatible authentication
              without database dependencies.
            </p>
          </div>
          <div className="feature-card">
            <h3>🛡️ Middleware Protection</h3>
            <p>
              Route-level authentication guards using Next.js middleware for
              instant protection.
            </p>
          </div>
          <div className="feature-card">
            <h3>📘 TypeScript Support</h3>
            <p>
              Full type safety with extended session types and proper type
              inference throughout.
            </p>
          </div>
          <div className="feature-card">
            <h3>🔒 Security First</h3>
            <p>
              CSRF protection, secure cookies, token validation, and security
              best practices built-in.
            </p>
          </div>
          <div className="feature-card">
            <h3>📖 Complete DevSpec</h3>
            <p>
              Comprehensive documentation, prompts, and acceptance tests for AI
              coding agents.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginTop: "2rem" }}>
          <h2>Resources</h2>
          <ul style={{ paddingLeft: "1.5rem", lineHeight: "2" }}>
            <li>
              <a href="https://hacode.solutions" target="_blank" rel="noopener noreferrer" style={{ color: "#0070f3" }}>
                HACODE SOLUTIONS Website
              </a>
            </li>
            <li>
              <Link href="/DEVSPEC.md" style={{ color: "#0070f3" }}>
                View DEVSPEC.md
              </Link>
            </li>
            <li>
              <Link href="/SKILL.md" style={{ color: "#0070f3" }}>
                View SKILL.md
              </Link>
            </li>
            <li>
              <a href="https://authjs.dev" target="_blank" rel="noopener noreferrer" style={{ color: "#0070f3" }}>
                Auth.js Documentation
              </a>
            </li>
            <li>
              <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" style={{ color: "#0070f3" }}>
                Next.js Documentation
              </a>
            </li>
          </ul>
        </div>

        <footer>
          <p>
            Free DevSpec by{" "}
            <a href="https://hacode.solutions" target="_blank" rel="noopener noreferrer">
              HACODE SOLUTIONS
            </a>{" "}
            • MIT License
          </p>
        </footer>
      </div>
    </>
  )
}
