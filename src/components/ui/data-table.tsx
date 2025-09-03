"use client"

import * as React from "react"
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
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"

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
        initialState: {
            pagination: {
                pageSize: 6,
            }
        }
    })

    const [filtersValue, setFiltersValue] = React.useState<Record<string, string>>({});

    return (
        <div className="flex flex-col gap-2 bg-bg-inset">
            {filters.length > 0 && (
                <Card className="flex items-center justify-between card-generic p-5">
                    {/* Filtros agrupados a la izquierda */}
                    <div className="flex items-center gap-4">
                        <div className="flex flex-row gap-1 w-auto">
                            {
                                filters.map((filter) => (
                                    <Input
                                        key={filter.column}
                                        placeholder={filter.placeholder}
                                        value={filtersValue[filter.column] ?? ""}
                                        onChange={(e) =>
                                            setFiltersValue((prev) => ({
                                                ...prev,
                                                [filter.column]: e.target.value,
                                            }))
                                        }
                                    >
                                    </Input>
                                ))
                            }
                        </div>
                        <div className="flex flex-col gap-1 w-auto">
                            <Button
                                variant="custom"
                                size="custom"
                                onClick={(event) => {
                                    filters.forEach((filter) => {
                                        const column = table.getColumn(filter.column)
                                        if (column) {
                                            column.setFilterValue(filtersValue[filter.column] ?? "")
                                        }
                                    })
                                }}
                            >
                                <Search />
                                Buscar
                            </Button>
                        </div>

                    </div>
                    <div className="flex gap-2">
                        <DataTableViewOptions table={table} />
                    </div>
                </Card>
            )}

            <Card className="card-generic p-5">
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
                <DataTablePagination table={table} />
            </Card>
        </div>
    )
}