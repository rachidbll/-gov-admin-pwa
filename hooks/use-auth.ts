"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "filler" | "viewer"
  createdAt: string
  lastLogin?: string
  isDefaultPassword: boolean
}

interface LoginCredentials {
  email?: string
  password?: string
  govId?: string
  type: "email" | "government"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("gov-admin-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)

    try {
      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check for default admin credentials
      if (credentials.type === "email" && credentials.email === "admin" && credentials.password === "admin") {
        const adminUser: User = {
          id: "admin-1",
          name: "System Administrator",
          email: "admin@gov.org",
          role: "admin",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isDefaultPassword: true,
        }

        setUser(adminUser)
        localStorage.setItem("gov-admin-user", JSON.stringify(adminUser))
        return { success: true, requiresPasswordChange: false } // Changed from true to false
      }

      // Check other stored users
      const storedUsers = JSON.parse(localStorage.getItem("gov-admin-users") || "[]")
      const foundUser = storedUsers.find(
        (u: User) =>
          (credentials.type === "email" && u.email === credentials.email) ||
          (credentials.type === "government" && u.id === credentials.govId),
      )

      if (foundUser) {
        const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() }
        setUser(updatedUser)
        localStorage.setItem("gov-admin-user", JSON.stringify(updatedUser))

        // Update user in stored users list
        const updatedUsers = storedUsers.map((u: User) => (u.id === foundUser.id ? updatedUser : u))
        localStorage.setItem("gov-admin-users", JSON.stringify(updatedUsers))

        return { success: true, requiresPasswordChange: foundUser.isDefaultPassword }
      }

      throw new Error("Invalid credentials")
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: "Invalid credentials" }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: "No user logged in" }

    try {
      // Simulate password change
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedUser = { ...user, isDefaultPassword: false }
      setUser(updatedUser)
      localStorage.setItem("gov-admin-user", JSON.stringify(updatedUser))

      // Update in users list if exists
      const storedUsers = JSON.parse(localStorage.getItem("gov-admin-users") || "[]")
      const updatedUsers = storedUsers.map((u: User) => (u.id === user.id ? updatedUser : u))
      localStorage.setItem("gov-admin-users", JSON.stringify(updatedUsers))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to change password" }
    }
  }

  const createUser = async (userData: {
    name: string
    email: string
    role: "admin" | "editor" | "filler" | "viewer"
    govId?: string
  }) => {
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString(),
        isDefaultPassword: true,
      }

      const storedUsers = JSON.parse(localStorage.getItem("gov-admin-users") || "[]")

      // Check if user already exists
      const existingUser = storedUsers.find((u: User) => u.email === userData.email)
      if (existingUser) {
        return { success: false, error: "User with this email already exists" }
      }

      storedUsers.push(newUser)
      localStorage.setItem("gov-admin-users", JSON.stringify(storedUsers))

      return { success: true, user: newUser, defaultPassword: "admin123" }
    } catch (error) {
      return { success: false, error: "Failed to create user" }
    }
  }

  const getAllUsers = (): User[] => {
    if (!user || user.role !== "admin") return []

    const storedUsers = JSON.parse(localStorage.getItem("gov-admin-users") || "[]")
    // Include the current admin user
    const adminUser = user.id === "admin-1" ? [user] : []
    return [...adminUser, ...storedUsers]
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    try {
      const storedUsers = JSON.parse(localStorage.getItem("gov-admin-users") || "[]")
      const updatedUsers = storedUsers.map((u: User) => (u.id === userId ? { ...u, ...updates } : u))
      localStorage.setItem("gov-admin-users", JSON.stringify(updatedUsers))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to update user" }
    }
  }

  const deleteUser = async (userId: string) => {
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    try {
      const storedUsers = JSON.parse(localStorage.getItem("gov-admin-users") || "[]")
      const filteredUsers = storedUsers.filter((u: User) => u.id !== userId)
      localStorage.setItem("gov-admin-users", JSON.stringify(filteredUsers))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to delete user" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("gov-admin-user")
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
