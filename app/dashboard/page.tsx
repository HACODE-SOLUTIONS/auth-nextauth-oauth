import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/auth-buttons"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
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
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
          </div>
        </nav>
      </header>

      <div className="container">
        <div className="card">
          <h1>Dashboard</h1>
          <p>Welcome to your protected dashboard, {session.user?.name}!</p>
        </div>

        <div className="card">
          <h2>Session Information</h2>
          <div style={{ marginTop: "1rem" }}>
            <p>
              <strong>User ID:</strong> {session.user?.id}
            </p>
            <p>
              <strong>Name:</strong> {session.user?.name || "Not provided"}
            </p>
            <p>
              <strong>Email:</strong> {session.user?.email}
            </p>
            <p>
              <strong>Image:</strong>{" "}
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  style={{ borderRadius: "50%", verticalAlign: "middle" }}
                />
              ) : (
                "Not provided"
              )}
            </p>
          </div>
        </div>

        <div className="card">
          <h2>Protected Content</h2>
          <p>
            This page is only accessible to authenticated users. The middleware
            automatically redirects unauthenticated users to the sign-in page.
          </p>
          <p style={{ marginTop: "1rem" }}>
            Try signing out and navigating here directly - you&apos;ll be redirected
            to the login page.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <SignOutButton />
          </div>
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
