"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { ResponseQueryReportsList } from "@/types"
import { Button } from "@/components/ui/button"
import CreateFinalReportFile from "@/components/reports-components/dinamic-report/DownFileAndMatchStyle"
import Link from "next/link"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

export function getColumns<TData extends ResponseQueryReportsList = ResponseQueryReportsList>(
  selectedFinalReport?: string | null
): ColumnDef<TData>[] {
  return [
    {
      accessorKey: "codigo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="codigo" />
      ),
      cell: ({ row }) => {
        const path = row.getValue("codigo") as string
        const fileName = path?.split("/").pop() || ""
        return fileName.replace(/\.zip$/i, ".pdf") // 👈 cambia .zip → .pdf
      },
    },
    {
      accessorKey: "fechaUpdate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
    },
    {
      accessorKey: "statusLote",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue<string>("statusLote")
        let variant: BadgeVariant = "secondary"
        let className = ""

        if (status === "GESTIONADO") {
          className = "bg-blue-primary text-white"
        }

        return <Badge variant={variant} className={className}>{status}</Badge>
      },
    },
    {
      accessorKey: "activo",
      header: "Dispositivo",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <CreateFinalReportFile job_id={row.getValue("codigo")} activo={row.getValue("activo")}/>
        );
      },
    },
  ]
}
