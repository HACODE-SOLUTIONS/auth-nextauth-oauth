import { SignInButton } from "@/components/auth-buttons"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LoginPage() {
  const session = await auth()

  // Redirect if already signed in
  if (session) {
    redirect("/dashboard")
  }

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
          </div>
        </nav>
      </header>

      <div className="container">
        <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h1>Sign In</h1>
          <p style={{ marginBottom: "2rem" }}>
            Choose a provider to sign in with
          </p>

          <div className="auth-buttons">
            <SignInButton provider="github" />
            <SignInButton provider="google" />
          </div>

          <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#999" }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
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
