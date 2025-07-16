"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@/context/UserContext"
import { DataTable } from "@/components/ui/data-table"
import { createColumns } from "./columns"
import { downloadBase64File } from "@/utils/file-download-utils"
import type { PdfFile } from "@/types"
import { extractPdfFiles } from "@/lib/pdf-utlis"

import { PageHeader } from "@/components/page-header"
import { AppPageLoading } from "@/components/skeleton/app-page-loading"

export default function ReportsPage() {
    const [data, setData] = useState<PdfFile[]>([])
    const [loading, setLoading] = useState(false)
    const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
    const [pdfCache, setPdfCache] = useState<Map<string, string>>(new Map())
    const [tenantLocalHost, setTenantLocalHost] = useState<string | null>(null)

    const { userr } = useUser()
    const userPoolid = userr?.userName || ""

    useEffect(() => {
        const storedTenant = localStorage.getItem("tenant")
        if (storedTenant) {
            setTenantLocalHost(storedTenant)
        }
    }, [])

    useEffect(() => {
        const fetchDataIfNeeded = async () => {
            if (!tenantLocalHost || !userr?.userName) {
                console.log("Datos faltantes:", { tenantLocalHost, userName: userr?.userName })
                return
            }

            setLoading(true)
            try {
                const res = await fetch("/api/list-docs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tenantName: tenantLocalHost,
                        userPoolid: userr.userName,
                    }),
                })

                if (!res.ok) throw new Error("Error al cargar archivos")

                const json = await res.json()
                const pdfFiles = extractPdfFiles(json)
                setData(pdfFiles)
            } catch (error) {
                console.error(error)
                alert("No se pudieron cargar los archivos.")
            } finally {
                setLoading(false)
            }
        }

        fetchDataIfNeeded()
    }, [tenantLocalHost, userr])

    async function handleDownload(fileName: string) {
        if (!fileName.trim()) return alert("Nombre de archivo inválido")
        setDownloadingFiles((prev) => new Set(prev).add(fileName))

        try {
            const cachedPdf = pdfCache.get(fileName)
            if (cachedPdf) {
                downloadBase64File(cachedPdf, `${fileName}.pdf`)
            } else {
                const res = await fetch("/api/down-file-pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userPoolId: userr?.userName,
                        tenantName: tenantLocalHost,
                        key: fileName,
                    }),
                    cache: "force-cache"
                })

                if (res.ok) {
                    const data = await res.json()
                    setPdfCache((prev) => new Map(prev).set(fileName, data.base64File))
                    downloadBase64File(data.base64File, data.fileName || `${fileName}.pdf`)
                } else {
                    const error = await res.json()
                    alert(`Error al descargar: ${error.message}`)
                }
            }
        } catch (error) {
            console.error("Error:", error)
            alert("Hubo un problema al descargar el archivo.")
        } finally {
            setDownloadingFiles((prev) => {
                const next = new Set(prev)
                next.delete(fileName)
                return next
            })
        }
    }

    const columns = createColumns({
        downloadingFiles,
        handleDownload,
    })

    const filters = [
        { column: "fileName", placeholder: "Filtrar por nombre..." },
    ]

    return (
        <>
            {loading ? <AppPageLoading /> :
                <div className="container mx-auto">
                    <PageHeader
                        title="Listado de reposrtes"
                        description="Administrar reportes almacenados en la base de datos."
                    />
                    <div className="mt-6 bg-card rounded-lg shadow-sm p-6 border border-border">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Historico de reportes</h2>
                        <DataTable columns={columns} data={data} filters={filters} />
                    </div>
                </div>
            }
        </>
    )
}