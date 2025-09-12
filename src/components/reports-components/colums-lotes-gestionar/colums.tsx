"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UsersInfo } from "@/types"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { ResponseQueryReportsList } from "@/types"
type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export const columns: ColumnDef<ResponseQueryReportsList>[] = [
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
        accessorKey: "codigo",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Codigo" />
            )
        },
    },
    {
        accessorKey: "fechaUpdate",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Fecha de Modificacion" />
            )
        }
    },

    {
        accessorKey: "statusLote",
        header: 'Estado',
        cell: ({ row }) => {
            const status = row.getValue("statusLote");
            let variant: BadgeVariant = "secondary"; // variante común para todos
            let className = ""; // clase personalizada según el estado

            switch (status) {
                case "DESCOMPRIMIDO":
                    className = "bg-blue-primary text-white";
                    break;
            }

            return (
                <div>
                    <Badge variant={variant} className={className}>
                        {row.getValue("statusLote")}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "activo",
        header: "Dispositivo"
    }
]