"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AnomalyDetection } from "@/types"

import { Badge } from "@/components/ui/badge"


import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export const columns: ColumnDef<AnomalyDetection>[] = [
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
        accessorKey: "timestamp",
        header: "TimeStamp",
    },
    {
        accessorKey: "parameter",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Parametro" />
            )
        }
    },
    {
        accessorKey: "value",
        header: "Valor",
    },

    {
        accessorKey: "severity",
        header: 'Severidad',
        cell: ({ row }) => {
            const status = row.getValue("severity");
            let variant: BadgeVariant = "secondary"; // variante común para todos
            let className = ""; // clase personalizada según el estado

            switch (status) {
                case "low":
                    className = "bg-gray-500 text-white";
                    break;
                case "medium":
                    className = "bg-blue-primary text-white";
                    break;
                case "high":
                    className = "bg-badge-error text-white";
                    break;
                default:
                    className = "bg-gray-500 text-white";
            }

            return (
                <div>
                    <Badge variant={variant} className={className}>
                        {row.getValue("severity")}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "probability",
        header: "Probabilidad",
    }
]