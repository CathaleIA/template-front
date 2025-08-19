"use client"

import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableViewOptions } from "@/components/ui/data-table-view"


// Configuración para cada filtro
interface FilterConfig {
    column: string
    placeholder: string
    type?: 'text' | 'select'
}


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filters?: FilterConfig[] // Opcional, puede no tener filtros
}

export function DataTable<TData, TValue>({
    columns,
    data,
    filters = [],
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    // Inicializar con el primer filtro disponible:
    const [activeFilter, setActiveFilter] = React.useState<string>(
        filters.length > 0 ? filters[0].column : ""
    )
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const handleFilterChange = (newFilter: string) => {
        // Limpiar el filtro anterior
        if (activeFilter) {
            table.getColumn(activeFilter)?.setFilterValue("")
        }
        // Cambiar al nuevo filtro
        setActiveFilter(newFilter)
    }

    return (
        <div>
            {filters.length > 0 && (
                <div className="flex items-center justify-between gap-4 p-2">
                    {/* Filtros agrupados a la izquierda */}
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1 w-auto">
                            <Label htmlFor="filter-select" className="text-sm font-medium">
                                Filtrar por:
                            </Label>
                            <Select
                                value={activeFilter}
                                onValueChange={handleFilterChange}
                            >
                                <SelectTrigger id="filter-select" className="w-44 md:w-48">
                                    <SelectValue placeholder="Select filter..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {filters.map((filter) => (
                                        <SelectItem key={filter.column} value={filter.column}>
                                            {filter.column}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {activeFilter && (
                            <div className="flex flex-col gap-1 w-auto">
                                <Label htmlFor="filter-input" className="text-sm font-medium">
                                    Buscar:
                                </Label>
                                <Input
                                    id="filter-input"
                                    placeholder={filters.find(f => f.column === activeFilter)?.placeholder || ""}
                                    value={(table.getColumn(activeFilter)?.getFilterValue() as string) ?? ""}
                                    onChange={(event) =>
                                        table.getColumn(activeFilter)?.setFilterValue(event.target.value)
                                    }
                                    className="w-full max-w-sm"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                    <DataTableViewOptions table={table} />
                    </div>

                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />

        </div>
    )
}