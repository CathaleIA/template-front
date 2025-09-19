"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { ItemPremitive } from "@/types"
import { Button } from "@/components/ui/button"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

export function getAnexoColumns<TData extends ItemPremitive = ItemPremitive>(
  onSelectAnexo?: (item: ItemPremitive) => void
): ColumnDef<TData>[] {
  return [
    {
      accessorKey: "s3_html_path",
      header: "Nombre archivo",
      cell: ({ row }) => {
        const path = row.getValue("s3_html_path") as string
        const fileName = path.split("/").pop() || ""
        return fileName.replace(/\.html$/i, ".pdf") // 👈 cambia .html → .pdf
      },
    },
    {
      accessorKey: "fecha_creacion",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue<string>("estado")
        let variant: BadgeVariant = "secondary"
        let className = ""

        if (status === "NORMALIZADO") {
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
        const anexo = row.original as ItemPremitive
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectAnexo?.(anexo)}
          >
            Seleccionar
          </Button>
        )
      },
    },
  ]
}
