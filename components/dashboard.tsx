"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Camera,
  Users,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
  Download,
} from "lucide-react"
import { FormCreator } from "./form-creator"
import { OCRProcessor } from "./ocr-processor"
import { QCMInterview } from "./qcm-interview"
import { GoogleSheetsSync } from "./google-sheets-sync"
import { NotificationCenter } from "./notification-center"
import { PasswordChangeDialog } from "./password-change-dialog"
import { UserManagement } from "./user-management"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "filler" | "viewer"
  isDefaultPassword?: boolean
}

interface DashboardProps {
  user: User
  isOnline: boolean
}

export function Dashboard({ user, isOnline }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [notifications, setNotifications] = useState([
    { id: 1, type: "submission", message: "New form submission received", time: "2 min ago" },
    { id: 2, type: "reminder", message: "Form deadline approaching", time: "1 hour ago" },
    { id: 3, type: "sync", message: "Google Sheets sync completed", time: "3 hours ago" },
  ])

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  useEffect(() => {
    // Don't automatically show password change dialog
    // User can access it via settings button or users tab
  }, [user])

  const stats = {
    activeForms: 12,
    completedToday: 8,
    pendingReview: 5,
    overdueItems: 2,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Government Administration</h1>
              <Badge variant={isOnline ? "default" : "destructive"} className="ml-3">
                {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter notifications={notifications} />
              <div className="text-sm text-gray-600">
                Welcome, {user.name} ({user.role})
                {user.isDefaultPassword && (
                  <Badge variant="destructive" className="ml-2">
                    Default Password
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Add this after the header, before the main content */}
      {user.isDefaultPassword && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                  <p className="text-sm text-yellow-700">
                    You are using the default password. Please change it for security.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="create-form">Create Form</TabsTrigger>
            <TabsTrigger value="ocr">OCR Digitize</TabsTrigger>
            <TabsTrigger value="interview">QCM Interview</TabsTrigger>
            <TabsTrigger value="sync">Google Sheets</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeForms}</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedToday}</div>
                  <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingReview}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overdueItems}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => setActiveTab("create-form")}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    Create Form
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => setActiveTab("ocr")}
                  >
                    <Camera className="h-6 w-6 mb-2" />
                    Scan Document
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => setActiveTab("interview")}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    Start Interview
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => setActiveTab("sync")}
                  >
                    <Download className="h-6 w-6 mb-2" />
                    Sync Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest form submissions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { form: "Citizen Registration Form", user: "John Doe", status: "completed", time: "10 min ago" },
                    { form: "Building Permit Application", user: "Jane Smith", status: "pending", time: "1 hour ago" },
                    { form: "Tax Assessment Form", user: "Mike Johnson", status: "overdue", time: "2 hours ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.form}</p>
                        <p className="text-sm text-gray-600">Submitted by {activity.user}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            activity.status === "completed"
                              ? "default"
                              : activity.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-form">
            <FormCreator user={user} />
          </TabsContent>

          <TabsContent value="ocr">
            <OCRProcessor user={user} />
          </TabsContent>

          <TabsContent value="interview">
            <QCMInterview user={user} />
          </TabsContent>

          <TabsContent value="sync">
            <GoogleSheetsSync user={user} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement user={user} />
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>View submission trends and export data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Export to Excel
                    </Button>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Export to PDF
                    </Button>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Analytics dashboard would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <PasswordChangeDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        required={user.isDefaultPassword}
      />
    </div>
  )
}
