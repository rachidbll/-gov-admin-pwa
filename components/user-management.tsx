"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Edit, Trash2, Shield, UserIcon, UserCheck, UserX, Copy, Key } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface UserManagementProps {
  user: {
    id: string
    name: string
    email: string
    role: "ADMIN" | "EDITOR" | "FILLER" | "VIEWER"
    createdAt: string
    lastLogin?: string
    isDefaultPassword: boolean
  }
}

export function UserManagement({ user }: UserManagementProps) {
  const [users, setUsers] = useState<
    {
      id: string
      name: string
      email: string
      role: "ADMIN" | "EDITOR" | "FILLER" | "VIEWER"
      createdAt: string
      updatedAt: string
      lastLogin?: string
      isDefaultPassword: boolean
    }[]
  >([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{
    id: string
    name: string
    email: string
    role: "ADMIN" | "EDITOR" | "FILLER" | "VIEWER"
    createdAt: string
    updatedAt: string
    lastLogin?: string
    isDefaultPassword: boolean
  } | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "FILLER" as const,
    govId: "",
  })
  const { createUser, getAllUsers, updateUser, deleteUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const allUsers = await getAllUsers()
    setUsers(allUsers)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const result = await createUser(newUser)

    if (result.success) {
      toast({
        title: "User Created",
        description: `User created successfully. Default password: ${result.defaultPassword}`,
      })
      setIsCreateDialogOpen(false)
      setNewUser({ name: "", email: "", role: "FILLER", govId: "" })
      loadUsers()
    } else {
      toast({
        title: "Creation Failed",
        description: result.error || "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) return

    const result = await updateUser(selectedUser.id, {
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
    })

    if (result.success) {
      toast({
        title: "User Updated",
        description: "User information has been updated successfully",
      })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } else {
      toast({
        title: "Update Failed",
        description: result.error || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    const result = await deleteUser(userId)

    if (result.success) {
      toast({
        title: "User Deleted",
        description: "User has been removed from the system",
      })
      loadUsers()
    } else {
      toast({
        title: "Deletion Failed",
        description: result.error || "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-red-600" />
      case "EDITOR":
        return <Edit className="h-4 w-4 text-blue-600" />
      case "FILLER":
        return <UserIcon className="h-4 w-4 text-green-600" />
      case "VIEWER":
        return <UserCheck className="h-4 w-4 text-gray-600" />
      default:
        return <UserIcon className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "EDITOR":
        return "default"
      case "FILLER":
        return "secondary"
      case "VIEWER":
        return "outline"
      default:
        return "outline"
    }
  }

  if (user.role !== "ADMIN") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <UserX className="mx-auto h-12 w-12 mb-4" />
            <p>Access Denied</p>
            <p className="text-sm">Only administrators can manage users</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>Create and manage user accounts with different access levels</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system with specified role and permissions
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-name">Full Name *</Label>
                    <Input
                      id="create-name"
                      value={newUser.name}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email Address *</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="user@gov.org"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-role">Role *</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value as "ADMIN" | "EDITOR" | "FILLER" | "VIEWER" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrator - Full access</SelectItem>
                        <SelectItem value="EDITOR">Editor - Create/edit forms</SelectItem>
                        <SelectItem value="FILLER">Filler - Fill assigned forms</SelectItem>
                        <SelectItem value="VIEWER">Viewer - Read-only access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-govid">Government ID (Optional)</Label>
                    <Input
                      id="create-govid"
                      value={newUser.govId}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, govId: e.target.value }))}
                      placeholder="GOV-123456789"
                    />
                  </div>
                  <Alert className="border-blue-200 bg-blue-50">
                    <Key className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Default password will be: <code className="bg-blue-100 px-1 rounded">admin123</code>
                      <br />
                      User will be required to change it on first login.
                    </AlertDescription>
                  </Alert>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create User</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <span>{u.email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => copyToClipboard(u.email)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(u.role)} className="flex items-center space-x-1 w-fit">
                        {getRoleIcon(u.role)}
                        <span className="capitalize">{u.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={u.isDefaultPassword ? "destructive" : "default"}>
                          {u.isDefaultPassword ? "Default Password" : "Secure"}
                        </Badge>
                        {u.id === user.id && (
                          <Badge variant="outline" className="text-xs">
                            Current User
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {u.id !== user.id && (
                          <Button variant="outline" size="sm" onClick={() => handleDeleteUser(u.id, u.name)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) => setSelectedUser((prev) => (prev ? { ...prev, role: value as any } : null))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="FILLER">Filler</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
