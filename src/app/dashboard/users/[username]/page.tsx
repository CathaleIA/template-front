"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { UserInfo } from "@/types/user"
import { Trash2, Save, X, User, Mail, ShieldUser } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { PageHeader } from "@/components/page-header"
import { AppPageLoading } from "@/components/skeleton/app-page-loading"
import { Separator } from "@/components/ui/separator"

import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"

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
  const [userTrigger, setUserTrigger] = React.useState<string>("Informacion de organizacion")

  const userInfoType: Array<string> = ["Informacion personal", "Informacion de organizacion", "Estatus"]

  const fetchUser = async (cacheType: RequestCache = "force-cache") => {
    try {
      const response = await fetch(`/api/user/${username}`, {
        method: "GET",
        cache: cacheType,
      })
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
        await fetchUser("no-cache")
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

  // Cargar usuario desde API
  React.useEffect(() => {
    fetchUser("force-cache")
  }, [username, router])


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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="customdestructive"
              size="custom"
              className="gap-1"
            >
              <Trash2 />
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
      ) : (
        <Button
          variant="customdestructive"
          size="custom"
          className="gap-1"
          onClick={() => setIsEditing(false)}>
          <X /> Cancel
        </Button>
      )}
    </div>
  );

  const getUserDataByTab = (tab: string, userInfo: Partial<UserInfo>) => {
    console.log(userInfo)
    switch (tab) {
      case "Informacion personal":
        return [
          { label: "Nombre", value: userInfo.userName },
          { label: "email", value: userInfo.email },
          { label: "userRole", value: userInfo.userRole },
        ];

      case "Informacion de organizacion":
        return [
          { label: "id", value: userInfo.tenantId },
          { label: "nombre", value: userInfo.tenantName },
          { label: "Tier", value: userInfo.tenantTier },
        ];

      case "Estatus":
        return [
          { label: "Estado", value: userInfo.statusState },
          { label: "Activo", value: userInfo.isEnabled },
          { label: "Creado", value: userInfo.createdDate },
          { label: "Modificado", value: userInfo.modifiedDate },
        ];
      default:
        return [
          { label: "nn", value: "nnn" },
        ]
    }
  }

  return (
    <div className="p-5 h-[calc(100svh-var(--header-height))]! w-full">
      <div className="flex flex-col gap-4 p-5 bg-bg-white">
        <PageHeader
          title="Editar usuario"
          description="Seguimiento personlaizado a sus usuarios."
          actions={EditDeleteActions}
        />
        <div className="grid md:grid-cols-[3fr_6fr] gap-4">
          {/* Información básica */}
          <Card className="flex flex-col items-center justify-center bg-bg-white shadow-none py-5 rounded-xs hover:shadow-[0px_4px_5px_rgba(0,0,0,0.1)]">
            <CardHeader className="flex flex-col items-center">
              <Avatar className="size-25">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="font-bold text-lg uppercase">
                {user.tenantName}
              </span>
            </CardHeader>
            <CardContent className="text-[14px] leading-[32px]">
              <div className="flex flex-row gap-1 items-center">
                <User className="h-4 w-4" />
                <p>{user.userName}</p>
              </div>
              <div className="flex flex-row gap-1 items-center">
                <Mail className="h-4 w-4" />
                <p>{user.email || ""}</p>
              </div>
              <div className="flex flex-row gap-1 items-center">
                <ShieldUser className="h-4 w-4" />
                <p>{user.userRole}</p>
              </div>
              <Separator className="mt-4 border-2" />
            </CardContent>
          </Card>
          <Card className="bg-bg-white shadow-none rounded-xs px-3 py-5 hover:shadow-[0px_4px_5px_rgba(0,0,0,0.1)]">
            <nav className="border-b-2 border-border text-sm font-semibold text-primary leading-none">
              <ul className="flex items-center w-auto list-none gap-8">
                {userInfoType.map(type => (
                  <motion.li
                    key={type}
                    initial={false}
                    className={`relative py-3 w-auto list-none cursor-pointer hover:text-blue-link ${type === userTrigger
                      ? 'text-blue-link'
                      : ''
                      }`}
                    onClick={() => setUserTrigger(type)}
                  >
                    {type}
                    {type === userTrigger ? (
                      <motion.div
                        className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-link"
                        layoutId="underline"
                        id="underline"
                      />
                    ) : null}
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="p-5">
              <AnimatePresence mode="wait">
                {editedUser && getUserDataByTab(userTrigger, editedUser).map((field) => (
                  <motion.div
                    key={field.label}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    {
                      userTrigger === "Informacion personal"
                        ? (

                          <div className="grid grid-cols-[1fr_8fr] gap-4 pb-4">
                            <div className="flex justify-end items-center">
                              <Label>{field.label}:</Label>
                            </div>
                            {
                              field.label === "userRole" || field.label === "email" ? (
                                <div className="flex justify-start items-center w-auto ">
                                  <Input
                                    value={field.value?.toString()}
                                    onChange={(e) =>
                                      setEditedUser((prev) => ({ ...prev, [field.label]: e.target.value }))
                                    }
                                  />
                                </div>
                              ) : (
                                <div className="flex justify-start items-center w-auto ">
                                  <Input
                                    value={field.value?.toString()}
                                    readOnly
                                  />
                                </div>
                              )
                            }
                          </div>

                        ) : (
                          <div className="grid grid-cols-[1fr_8fr] gap-4 pb-4">
                            <div className="flex justify-end items-center">
                              <Label>{field.label}:</Label>
                            </div>
                            <div className="flex justify-start items-center w-auto">
                              <Input
                                value={field.value?.toString()}
                                readOnly
                              />
                            </div>
                          </div>
                        )
                    }
                  </motion.div>
                ))}
                {userTrigger === "Informacion personal" && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-end pt-2"
                  >
                    <Button
                      variant="custom"
                      size="custom"
                      onClick={handleSave} disabled={saving}
                    >
                      <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}