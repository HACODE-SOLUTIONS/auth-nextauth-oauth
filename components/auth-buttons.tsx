"use client"

import { signIn, signOut } from "next-auth/react"

/**
 * Sign In Button Component
 * 
 * Client component that triggers OAuth sign-in flow.
 * Can be used for specific providers or default sign-in.
 */
export function SignInButton({ provider }: { provider?: string }) {
  const handleSignIn = () => {
    if (provider) {
      signIn(provider)
    } else {
      signIn()
    }
  }

  const getButtonClass = () => {
    if (provider === "github") return "button button-github"
    if (provider === "google") return "button button-google"
    return "button button-primary"
  }

  const getButtonText = () => {
    if (provider === "github") return "Sign in with GitHub"
    if (provider === "google") return "Sign in with Google"
    return "Sign In"
  }

  return (
    <button onClick={handleSignIn} className={getButtonClass()}>
      {getButtonText()}
    </button>
  )
}

/**
 * Sign Out Button Component
 * 
 * Client component that signs out the current user.
 */
export function SignOutButton() {
  return (
    <button onClick={() => signOut()} className="button button-secondary">
      Sign Out
    </button>
  )
}
