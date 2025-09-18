
import { columns } from "./columns"
import { cookies } from "next/headers"
import { UsersInfo } from "@/types"
import { UsersActionsWrapper } from "@/components/wrappers/UsersActionsWrapper"
import { PageHeader } from "@/components/page-header"

import { getUserFromToken } from "@/lib/auth-service-server"
import { redirect } from "next/navigation"


export default async function UserPage() {

    const payload = await getUserFromToken()

    if (!payload || payload.userRole !== "TenantAdmin") {
        redirect("/dashboard")
    }

    const filters = [
        { column: "email", placeholder: "Filter by email..." },
        { column: "userName", placeholder: "Filter by user name..." }
    ]
    const cookieStore = await cookies()
    let mappedUsers: UsersInfo[] = []

    const token = cookieStore.get("cognito_id_token")?.value
    if (!token) {
        throw new Error("Error, token no encontrado!. Sesion no encontrada o token invalido")
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL}/users`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'force-cache'
        });

        if (!response.ok) {
            throw new Error("Error al obtener los usuarios.")
        }

        const rawData = await response.json();

        mappedUsers = rawData.map((data: any) => ({
            userName: data.user_name,
            userRole: data.user_role,
            email: data.email,
            statusState: data.status,
            isEnabled: data.enabled,
            createdDate: data.created,
            modifiedDate: data.modified,
        }))

    } catch (error) {
        console.log("Error:", error)
    }

    return (
        <div className="flex flex-col gap-4 p-5 bg-bg-inset h-[calc(100svh-var(--header-height))]!">
            <PageHeader
                title="Gestión de Usuarios"
                description="Administra los usuarios de tu aplicación desde este panel de control."
            />
            <div className="flex-1">
                <UsersActionsWrapper columns={columns} data={mappedUsers} filters={filters} />
            </div>
        </div>
    )
}