"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, RefreshCw, CheckCircle, AlertCircle, Settings, Plus, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "filler" | "viewer"
}

interface GoogleSheetsConnection {
  id: string
  name: string
  sheetId: string
  lastSync: string
  status: "connected" | "error" | "syncing"
  autoSync: boolean
  formType: string
}

interface GoogleSheetsSyncProps {
  user: User
}

export function GoogleSheetsSync({ user }: GoogleSheetsSyncProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connections, setConnections] = useState<GoogleSheetsConnection[]>([
    {
      id: "1",
      name: "Employee Registration Forms",
      sheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      lastSync: "2 minutes ago",
      status: "connected",
      autoSync: true,
      formType: "Employee Registration",
    },
    {
      id: "2",
      name: "Citizen Service Requests",
      sheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      lastSync: "1 hour ago",
      status: "connected",
      autoSync: false,
      formType: "Service Request",
    },
    {
      id: "3",
      name: "Document Processing Log",
      sheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      lastSync: "Failed",
      status: "error",
      autoSync: true,
      formType: "OCR Processing",
    },
  ])
  const [newConnection, setNewConnection] = useState({
    name: "",
    sheetUrl: "",
    formType: "",
  })
  const { toast } = useToast()

  const connectGoogleAccount = async () => {
    setIsConnecting(true)

    try {
      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Google Account Connected",
        description: "Successfully connected to Google Sheets. You can now create new connections.",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const createNewConnection = () => {
    if (!newConnection.name || !newConnection.sheetUrl || !newConnection.formType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const connection: GoogleSheetsConnection = {
      id: Date.now().toString(),
      name: newConnection.name,
      sheetId: extractSheetId(newConnection.sheetUrl),
      lastSync: "Never",
      status: "connected",
      autoSync: true,
      formType: newConnection.formType,
    }

    setConnections([...connections, connection])
    setNewConnection({ name: "", sheetUrl: "", formType: "" })

    toast({
      title: "Connection Created",
      description: "New Google Sheets connection has been established.",
    })
  }

  const extractSheetId = (url: string): string => {
    // Extract sheet ID from Google Sheets URL
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : url
  }

  const syncConnection = async (connectionId: string) => {
    setConnections(
      connections.map((conn) => (conn.id === connectionId ? { ...conn, status: "syncing" as const } : conn)),
    )

    try {
      // Simulate sync process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setConnections(
        connections.map((conn) =>
          conn.id === connectionId ? { ...conn, status: "connected" as const, lastSync: "Just now" } : conn,
        ),
      )

      toast({
        title: "Sync Complete",
        description: "Data has been successfully synced to Google Sheets.",
      })
    } catch (error) {
      setConnections(
        connections.map((conn) =>
          conn.id === connectionId ? { ...conn, status: "error" as const, lastSync: "Failed" } : conn,
        ),
      )

      toast({
        title: "Sync Failed",
        description: "Failed to sync data to Google Sheets. Please check your connection.",
        variant: "destructive",
      })
    }
  }

  const toggleAutoSync = (connectionId: string) => {
    setConnections(connections.map((conn) => (conn.id === connectionId ? { ...conn, autoSync: !conn.autoSync } : conn)))
  }

  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter((conn) => conn.id !== connectionId))
    toast({
      title: "Connection Removed",
      description: "Google Sheets connection has been deleted.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Google Account Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets Integration</CardTitle>
          <CardDescription>Connect your Google account to automatically sync form data to spreadsheets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Sheet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Google Account</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <Badge variant="default">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>

          <Button variant="outline" onClick={connectGoogleAccount} disabled={isConnecting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isConnecting ? "animate-spin" : ""}`} />
            {isConnecting ? "Reconnecting..." : "Reconnect Account"}
          </Button>
        </CardContent>
      </Card>

      {/* Create New Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Connection</CardTitle>
          <CardDescription>Link a form type to a specific Google Sheet for automatic data sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="connection-name">Connection Name</Label>
              <Input
                id="connection-name"
                value={newConnection.name}
                onChange={(e) => setNewConnection((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Employee Forms"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <Input
                id="sheet-url"
                value={newConnection.sheetUrl}
                onChange={(e) => setNewConnection((prev) => ({ ...prev, sheetUrl: e.target.value }))}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-type">Form Type</Label>
              <Select
                value={newConnection.formType}
                onValueChange={(value) => setNewConnection((prev) => ({ ...prev, formType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee Registration">Employee Registration</SelectItem>
                  <SelectItem value="Service Request">Service Request</SelectItem>
                  <SelectItem value="OCR Processing">OCR Processing</SelectItem>
                  <SelectItem value="QCM Interview">QCM Interview</SelectItem>
                  <SelectItem value="Custom Form">Custom Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={createNewConnection}>
            <Plus className="mr-2 h-4 w-4" />
            Create Connection
          </Button>
        </CardContent>
      </Card>

      {/* Existing Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Active Connections</CardTitle>
          <CardDescription>Manage your Google Sheets connections and sync settings</CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No connections configured yet. Create your first connection above.
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div key={connection.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{connection.name}</h3>
                      <p className="text-sm text-gray-600">Form Type: {connection.formType}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          connection.status === "connected"
                            ? "default"
                            : connection.status === "syncing"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {connection.status === "connected" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {connection.status === "syncing" && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                        {connection.status === "error" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {connection.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">SHEET ID</Label>
                      <p className="font-mono">{connection.sheetId.substring(0, 20)}...</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">LAST SYNC</Label>
                      <p>{connection.lastSync}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">AUTO SYNC</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Switch checked={connection.autoSync} onCheckedChange={() => toggleAutoSync(connection.id)} />
                        <span className="text-xs">{connection.autoSync ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncConnection(connection.id)}
                        disabled={connection.status === "syncing"}
                      >
                        <RefreshCw
                          className={`mr-2 h-3 w-3 ${connection.status === "syncing" ? "animate-spin" : ""}`}
                        />
                        Sync Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Open Sheet
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteConnection(connection.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Statistics</CardTitle>
          <CardDescription>Overview of data synchronization activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-gray-600">Records Synced Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-gray-600">Pending Syncs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-gray-600">Failed Syncs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
