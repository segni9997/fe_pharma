"use client"

import { useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}
