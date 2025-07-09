"use client"
import type React from "react"
import { useUser } from "@/context/UserContext"
import { useState } from "react"
import { DataTable } from "@/components/reports/report-table";


export default function ListTable() {
    const [tenant, setTenant] = useState("")
    const tenantLocalHost = localStorage.getItem("tenant") || tenant
    const { userr } = useUser()
    return (
        <div>
            <DataTable tenantName={tenantLocalHost} userPoolid={userr?.userName || ""} />
        </div>
    )
}