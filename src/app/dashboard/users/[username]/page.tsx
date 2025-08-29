"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { UserInfo } from "@/types/user"
import { Trash2, Edit, Save, X } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { AppPageLoading } from "@/components/skeleton/app-page-loading"

export default function UserPage() {
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = React.useState<UserInfo | null>(null)
  const [editedUser, setEditedUser] = React.useState<Partial<UserInfo>>({})
  const [isEditing, setIsEditing] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const router = useRouter()

  // Cargar usuario desde API
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/${username}`)
        if (response.ok) {
          const data = await response.json()
          const userInfo: UserInfo = {
            userName: data.user_name,
            tenantId: data.tenant_id,
            userRole: data.user_role,
            email: data.email,
            statusState: data.status,
            isEnabled: data.enabled,
            createdDate: data.created,
            modifiedDate: data.modified,
            tenantName: data.tenant_name,
            tenantTier: data.tenant_tier,
          }
          setUser(userInfo)
          setEditedUser(userInfo)
        } else {
          toast.error("Error", { description: "User not found" })
          router.push("/dashboard/users")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        toast.error("Error", { description: "Failed to load user data" })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [username, router])

  // Guardar cambios (solo email y rol)
  const handleSave = async () => {
    if (!editedUser || !user) return
    setSaving(true)

    try {
      const response = await fetch(`/api/user/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: user.userName,
          userEmail: editedUser.email,
          userRole: editedUser.userRole,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setUser({
          ...user,
          email: updated.email,
          userRole: updated.user_role,
        })
        setIsEditing(false)
        toast.success("Success", { description: "User updated successfully" })
      } else {
        throw new Error("Update failed")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error", { description: "Failed to update user" })
    } finally {
      setSaving(false)
    }
  }

  // Eliminar usuario (solo enviar username)
  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/user/${username}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Success", { description: "User deleted successfully" })
        router.push("/dashboard/users")
      } else {
        throw new Error("Delete failed")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error", { description: "Failed to delete user" })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AppPageLoading />
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>User not found</p>
      </div>
    )
  }
  const EditDeleteActions = (
    <div className="flex gap-2">
      {!isEditing ? (
        <>
          <Button variant="custom" size="custom" className="gap-1" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="customdestructive"
                size="custom"
                className="gap-1"
              >
                <Trash2/> 
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <>
          <Button 
            variant="customdestructive" 
            size="custom" 
            className="gap-1"
            onClick={() => setIsEditing(false)}>
              <X/> Cancel
          </Button>
          <Button variant="custom" size="custom" className="gap-1" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Editar usuario"
        description="Seguimiento personlaizado a sus usuarios."
        actions={EditDeleteActions}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user details and account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Username</Label>
              <Input value={user.userName} disabled />
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={editedUser.email || ""}
                onChange={(e) =>
                  setEditedUser((prev) => ({ ...prev, email: e.target.value }))
                }
                disabled={!isEditing}
              />
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              {isEditing ? (
                <Select
                  value={editedUser.userRole || ""}
                  onValueChange={(value) => setEditedUser((prev) => ({ ...prev, userRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TenantAdmin">Administrador</SelectItem>
                    <SelectItem value="TenantUser">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="w-fit capitalize">
                  {user.userRole}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información del Tenant */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
            <CardDescription>Organization and tenant details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Tenant ID</Label>
              <Input value={user.tenantId} disabled />
            </div>

            <div className="grid gap-2">
              <Label>Tenant Name</Label>
              <Input value={user.tenantName} disabled />
            </div>

            <div className="grid gap-2">
              <Label>Tenant Tier</Label>
              <Input value={user.tenantTier} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Estado y fechas */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Status & Timeline</CardTitle>
            <CardDescription>Account status and history</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Badge
                variant={
                  user.statusState === "active"
                    ? "default"
                    : user.statusState === "inactive"
                      ? "destructive"
                      : "secondary"
                }
                className="w-fit capitalize"
              >
                {user.statusState}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Label>Enabled</Label>
              <Badge variant="outline" className="w-fit">
                {user.isEnabled ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Label>Created Date</Label>
              <Input value={new Date(user.createdDate).toLocaleString()} disabled />
            </div>

            <div className="grid gap-2">
              <Label>Last Modified</Label>
              <Input value={new Date(user.modifiedDate).toLocaleString()} disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}