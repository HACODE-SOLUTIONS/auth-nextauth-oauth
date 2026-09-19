import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/auth-buttons"

export default async function ProfilePage() {
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
          <h1>Profile</h1>

          <div className="profile-info" style={{ marginTop: "2rem" }}>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="Profile"
                width={80}
                height={80}
                className="profile-avatar"
              />
            )}
            <div className="profile-details">
              <div className="profile-name">
                {session.user?.name || "Anonymous User"}
              </div>
              <div className="profile-email">{session.user?.email}</div>
              <div style={{ fontSize: "0.9rem", color: "#999", marginTop: "0.5rem" }}>
                ID: {session.user?.id}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Account Details</h2>
          <div style={{ marginTop: "1rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                  <td style={{ padding: "0.75rem 0", fontWeight: "600" }}>
                    User ID
                  </td>
                  <td style={{ padding: "0.75rem 0", color: "#666" }}>
                    {session.user?.id}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                  <td style={{ padding: "0.75rem 0", fontWeight: "600" }}>
                    Name
                  </td>
                  <td style={{ padding: "0.75rem 0", color: "#666" }}>
                    {session.user?.name || "Not provided"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                  <td style={{ padding: "0.75rem 0", fontWeight: "600" }}>
                    Email
                  </td>
                  <td style={{ padding: "0.75rem 0", color: "#666" }}>
                    {session.user?.email}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0.75rem 0", fontWeight: "600" }}>
                    Profile Picture
                  </td>
                  <td style={{ padding: "0.75rem 0", color: "#666" }}>
                    {session.user?.image ? "Provided" : "Not provided"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "2rem" }}>
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
