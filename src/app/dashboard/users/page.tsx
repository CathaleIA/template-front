"use client"

import { columns } from "../users/columns"
import { UsersInfo } from "@/types"
import { DataTable } from "@/components/ui/data-table"
import React, { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"

import { useNotifications } from "@/context/notification-context"

import { CreateUserDialog } from '@/components/create-user-dialog'
import { CreateUserData } from "@/types"
import { AppPageLoading } from "@/components/skeleton/app-page-loading"

export default function DemoPage() {
    const { addNotification } = useNotifications()

    const [data, setData] = useState<UsersInfo[]>([])
    const [loading, setLoading] = useState(false)
    const filters = [
        { column: "email", placeholder: "Filter by email..." },
        { column: "userName", placeholder: "Filter by user name..." }
    ]

    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true)
                const response = await fetch("/api/users")
                if (!response.ok) {
                    throw new Error("Failed to fetch users")
                }

                const rawData = await response.json()
                console.log("rwar data", rawData)
                const mappedUsers: UsersInfo[] = rawData.map((data: any) => ({
                    userName: data.user_name,
                    userRole: data.user_role,
                    email: data.email,
                    statusState: data.status,
                    isEnabled: data.enabled,
                    createdDate: data.created,
                    modifiedDate: data.modified,
                }))

                setData(mappedUsers)
            } catch (error) {
                console.error("Error fetching users:", error)
            } finally {
                setLoading(false)
            }
        }

        getUsers()
    }, [])

    // Callback para cuando se crea un nuevo usuario
    const handleUserCreated = (user: CreateUserData) => {
        addNotification({
            type: "success",
            title: "Usuario creado exitosamente",
            message: `El nuevo usuario ${user.userName} ha sido agregado al sistema.`,
        })
        //window.location.reload() // O mejor aún, hacer fetch de nuevo
    }

    if (loading) {
        return <AppPageLoading />
    }

    return (

        <div className="container mx-auto px-5">
            <PageHeader
                title="Gestión de Usuarios"
                description="Administra los usuarios de tu aplicación desde este panel de control."
                actions={
                    <CreateUserDialog onUserCreated={handleUserCreated} />
                }
            />
            <div className="mt-6 bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-6">Historico de usuarios</h2>
                <DataTable columns={columns} data={data} filters={filters} />
            </div>

        </div>
    )
}