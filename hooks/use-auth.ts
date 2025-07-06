"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "EDITOR" | "FILLER" | "VIEWER"
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isDefaultPassword: boolean
}

interface LoginCredentials {
  email?: string
  password?: string
  type: "email" | "government"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true, requiresPasswordChange: data.user.isDefaultPassword }
      } else {
        throw new Error(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: "No user logged in" }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user, isDefaultPassword: false })
        return { success: true }
      } else {
        throw new Error(data.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Change password failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
  }

  const createUser = async (userData: {
    name: string
    email: string
    role: "ADMIN" | "EDITOR" | "FILLER" | "VIEWER"
  }) => {
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, user: data.user, defaultPassword: data.defaultPassword }
      } else {
        throw new Error(data.error || "Failed to create user")
      }
    } catch (error) {
      console.error("Create user failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
  }

  const getAllUsers = async (): Promise<User[]> => {
    if (!user || user.role !== "ADMIN") return []

    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        return data.users
      } else {
        throw new Error(response.statusText)
      }
    } catch (error) {
      console.error("Get all users failed:", error)
      return []
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        throw new Error(data.error || "Failed to update user")
      }
    } catch (error) {
      console.error("Update user failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
  }

  const deleteUser = async (userId: string) => {
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        throw new Error(data.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Delete user failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    changePassword,
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
  }
}
