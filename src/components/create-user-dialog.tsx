"use client"

import * as React from "react"
import { Plus, User, Mail, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {CreateUserData} from "@/types"

interface CreateUserDialogProps {
  onUserCreated?: (user: CreateUserData) => void
}

export function CreateUserDialog({ onUserCreated }: CreateUserDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<CreateUserData>({
    userName: "",
    userEmail: "",
    userRole: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.userName || !formData.userEmail || !formData.userRole) {
      toast(
        "Error",
        {description: "Please fill in all fields",

      })
      return
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.userEmail)) {
      toast(
        "Error",
        {description: "Please enter a valid email address",

      })
      return
    }

    setLoading(true)
    try {
      // Aquí harías la llamada a tu API
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: formData.userName,
          userEmail: formData.userEmail,
          userRole: formData.userRole,
        }),
      })

      if (response.ok) {
        toast(
          "Success",
          {description: "User created successfully",
        })

        // Callback para notificar al componente padre
        onUserCreated?.(formData)

        // Resetear formulario y cerrar dialog
        setFormData({ userName: "", userEmail: "", userRole: "" })
        setOpen(false)
      } else {
        throw new Error("Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast(
        "Error",
        {description: "Failed to create user. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ userName: "", userEmail: "", userRole: "" })
    setOpen(false)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "TenantAdmin":
        return "default"
      case "TenantUser":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto hidden h-8 lg:flex">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            Create New User
          </DialogTitle>
          <DialogDescription className="text-base">
            Add a new user to the system. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="userName"
                placeholder="Enter username"
                value={formData.userName}
                onChange={(e) => setFormData((prev) => ({ ...prev, userName: e.target.value }))}
                className="h-11"
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="userEmail" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="Enter email address"
                value={formData.userEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, userEmail: e.target.value }))}
                className="h-11"
                disabled={loading}
              />
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="userRole" className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                User Role
              </Label>
              <Select
                value={formData.userRole}
                onValueChange={(value: "TenantAdmin" | "TenantUser") =>
                  setFormData((prev) => ({ ...prev, userRole: value }))
                }
                disabled={loading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TenantAdmin">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        Admin
                      </Badge>
                      <span>Tenant Administrator</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="TenantUser">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        User
                      </Badge>
                      <span>Tenant User</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.userRole && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  <Badge variant={getRoleBadgeVariant(formData.userRole)} className="text-xs">
                    {formData.userRole}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
