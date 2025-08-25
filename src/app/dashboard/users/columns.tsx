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

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export const columns: ColumnDef<UsersInfo>[] = [
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
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Email" />
            )
        },
    },
    {
        accessorKey: "userName",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Name" />
            )
        },
        cell: ({ row }) => {
            const username = row.getValue("userName") as string

            return (
                <Link
                    href={`/dashboard/users/${username}`}
                    className="text-text-active underline font-medium cursor-pointer hover:text-link-active transition-colors"
                    style={{ textDecorationThickness: '2px', textUnderlineOffset: '4px' }}
                >
                    {username}
                </Link>
            )
        }
    },
    {
        accessorKey: "userRole",
        header: "Role",
    },

    {
        accessorKey: "statusState",
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue("statusState");
            let variant: BadgeVariant = "secondary"; // variante común para todos
            let className = ""; // clase personalizada según el estado

            switch (status) {
                case "FORCE_CHANGE_PASSWORD":
                    className = "bg-blue-500 text-white";
                    break;
                case "CONFIRMED":
                    className = "bg-green-500 text-white";
                    break;
                case "PENDING_CONFIRMATION":
                    className = "bg-gray-500 text-white";
                    break;
                default:
                    className = "bg-gray-500 text-white";
            }

            return (
                <div>
                    <Badge variant={variant} className={className}>
                        {row.getValue("statusState")}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "isEnabled",
        header: "Enabled",
    },
    {
        accessorKey: "createdDate",
        header: "Created",
    },
    {
        accessorKey: "modifiedDate",
        header: "Modifed",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const userSelect = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(userSelect.email)}
                        >
                            Copy user name
                        </DropdownMenuItem>
                        <Link href={`/dashboard/users/${userSelect.userName}`} passHref legacyBehavior>
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]