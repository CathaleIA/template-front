"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { PdfFile } from "@/types"
import { Download, Loader2, FileChartLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"


interface CreateColumnsProps {
    downloadingFiles: Set<string>
    handleDownload: (fileName: string) => void
}

export const createColumns = ({
    downloadingFiles,
    handleDownload,
}: CreateColumnsProps): ColumnDef<PdfFile>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "fileName",
            header: ({ column }) => {
                return (
                    <DataTableColumnHeader column={column} title="File name" />
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileChartLine className="w-4 h-4"/>
                    <span className="font-medium">{row.getValue("fileName")}</span>
                </div>
            )
        },
        {
            accessorKey: "size",
            header: "Tamaño",
            cell: ({ row }) => {
                const bytes = row.getValue("size") as number
                const formatSize = (bytes: number) => {
                    if (bytes === 0) return "0 Bytes"
                    const k = 1024
                    const sizes = ["Bytes", "KB", "MB", "GB"]
                    const i = Math.floor(Math.log(bytes) / Math.log(k))
                    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
                }
                return <div className="text-muted-foreground">{formatSize(bytes)}</div>
            },
        },
        {
            accessorKey: "lastModified",
            header: "Última modificación",
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {new Date(row.getValue("lastModified")).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const fileName = row.getValue("fileName") as string
                const isDownloading = downloadingFiles.has(fileName)
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault()
                            handleDownload(fileName)
                        }}
                        disabled={isDownloading}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:border-primary/50"
                    >
                        {isDownloading ? (
                            <Loader2 className="animate-spin text-primary" />
                        ) : (
                            <Download className="text-primary" />
                        )}
                    </Button>
                )
            },
        },
    ]