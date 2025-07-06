"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Building2, Users, Info } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login({ email, password, type: "email" })

      if (result?.success) {
        if (result.requiresPasswordChange) {
          toast({
            title: "Password Change Required",
            description: "Please change your default password for security.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Login Successful",
            description: "Welcome to Government Administration System",
          })
        }
      } else {
        toast({
          title: "Login Failed",
          description: result?.error || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Government Administration</CardTitle>
          <CardDescription>Secure access to digital forms and document management</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Default Credentials Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>First Time Setup:</strong> Use default credentials to get started
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  Username: <code className="bg-blue-100 px-1 rounded">admin</code>
                </div>
                <div>
                  Password: <code className="bg-blue-100 px-1 rounded">admin</code>
                </div>
              </div>
              
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="email">Email Login</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Username/Email</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="admin or your.email@gov.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Shield className="mr-2 h-4 w-4" />
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>🔒 All communications are encrypted via HTTPS</p>
            <p className="mt-1">Role-based access control enabled</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
