"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    name: "John Smith",
    username: "owner",
    email: "owner@pharmacy.com",
    role: "owner",
    password: "password",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Sarah Johnson",
    username: "pharmacist",
    email: "pharmacist@pharmacy.com",
    role: "pharmacist",
    password: "password",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Mike Wilson",
    username: "cashier",
    email: "cashier@pharmacy.com",
    role: "cashier",
    password: "password",
    createdAt: new Date(),
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("pharmacy_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find((u) => u.username === username && u.password === password)
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("pharmacy_user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pharmacy_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
