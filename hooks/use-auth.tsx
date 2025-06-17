"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
        console.log("Loaded user from localStorage:", userData)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  const refreshUserData = async (userId: string) => {
    try {
      console.log("Refreshing user data for:", userId)
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        console.log("Refreshed user data:", userData)
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      } else {
        console.error("Failed to refresh user data:", response.status)
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Sign in failed")
    }

    setUser(result.user)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(result.user))
  }

  const signUp = async (name: string, email: string, password: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Sign up failed")
    }

    setUser(result.user)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(result.user))
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    console.log("Updating profile for user:", user.id, "with updates:", updates)

    const response = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Profile update failed:", error)
      throw new Error(error.error || "Failed to update profile")
    }

    const updatedUser = await response.json()
    console.log("Profile updated successfully:", updatedUser)
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  const refreshUser = async () => {
    if (!user) return
    await refreshUserData(user.id)
  }

  const updateUserState = (updatedUser: User) => {
    console.log("Updating user state:", updatedUser)
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshUser,
        setUser: updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
