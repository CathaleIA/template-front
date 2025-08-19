"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ParadasData } from "@/types"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export const columns: ColumnDef<ParadasData>[] = [
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
        accessorKey: "operator",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Operador" />
            )
        },
    },
    {
        accessorKey: "justify",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Justificacion" />
            )
        },
        cell: ({ row }) => {
            const username = row.getValue("justify") as string

            return (
                <Link
                    // href={`/dashboard/users/${username}`}
                    href={'#'}
                    className="text-blue-600 underline font-medium cursor-pointer"
                    style={{ textDecorationThickness: '2px', textUnderlineOffset: '4px' }}
                >
                    {username}
                </Link>
            )
        }
    },
    {
        accessorKey: "state",
        header: 'Estado',
        cell: ({ row }) => {
            const status = row.getValue("state");
            let variant: BadgeVariant = "secondary"; // variante común para todos
            let className = ""; // clase personalizada según el estado

            switch (status) {
                case "CERRADA":
                    className = "bg-blue-500 text-white";
                    break;
                case "EN CURSO":
                    className = "bg-green-500 text-white";
                    break;
                default:
                    className = "bg-gray-500 text-white";
            }

            return (
                <div>
                    <Badge variant={variant} className={className}>
                        {row.getValue("state")}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "duration",
        header: "Duracion [h]",
    },
    {
        accessorKey: "date",
        header: "Fechas",
    },
]