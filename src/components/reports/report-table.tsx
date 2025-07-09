"use client"

import * as React from "react"
import { extractPdfFiles } from "@/lib/pdf-utlis"
import type { PdfFile } from "@/types/typeListDocs"
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, Download, Loader2, Search, Filter } from "lucide-react"
import Image from "next/image"
import { downloadBase64File } from "@/utils/file-download-utils"

type DataTableProps = {
  tenantName: string
  userPoolid: string
}

export function DataTable({ tenantName, userPoolid }: DataTableProps) {
  const [data, setData] = React.useState<PdfFile[]>([])
  const [loading, setLoading] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Estados para la descarga - movidos al componente principal
  const [downloadingFiles, setDownloadingFiles] = React.useState<Set<string>>(new Set())
  const [pdfCache, setPdfCache] = React.useState<Map<string, string>>(new Map())

  // Función para manejar descarga - corregida
  const handleDownload = async (fileName: string) => {
    if (!fileName.trim()) {
      alert("Nombre de archivo inválido")
      return
    }

    // Agregar archivo a la lista de descargas en progreso
    setDownloadingFiles((prev) => new Set(prev).add(fileName))

    try {
      // Verificar si ya tenemos el archivo en caché
      const cachedPdf = pdfCache.get(fileName)

      if (cachedPdf) {
        const success = downloadBase64File(cachedPdf, `${fileName}.pdf`)
        if (success) {
          alert("Archivo descargado correctamente")
        } else {
          alert("Error al descargar el archivo")
        }
      } else {
        // Descargar desde el servidor
        const response = await fetch("/api/down-file-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPoolId: userPoolid,
            tenantName: tenantName,
            key: `${fileName}`,
          }),
        })

        if (response.ok) {
          const data = await response.json()

          // Guardar en caché para futuras descargas
          setPdfCache((prev) => new Map(prev).set(fileName, data.base64File))

          const success = downloadBase64File(data.base64File, data.fileName || `${fileName}.pdf`)
          if (success) {
            alert("Archivo descargado correctamente")
          } else {
            alert("Error al descargar el archivo")
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          alert(`Error al obtener el archivo: ${errorData.message || "Error desconocido"}`)
        }
      }
    } catch (error) {
      console.error("Error en descarga:", error)
      alert("Error al descargar el archivo. Por favor, inténtalo de nuevo.")
    } finally {
      // Remover archivo de la lista de descargas en progreso
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(fileName)
        return newSet
      })
    }
  }

  // Columnas para tabla con botón de descarga - corregidas
  const columns: ColumnDef<PdfFile>[] = [
    {
      accessorKey: "fileName",
      header: "Archivo",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src="/icons/file-text-icon.png" alt="Archivo" width={16} height={16} className="text-primary" />
          <span className="font-medium">{row.getValue("fileName")}</span>
        </div>
      ),
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
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              handleDownload(fileName)
            }}
            disabled={isDownloading}
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:border-primary/50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Download className="w-4 h-4 text-primary" />
            )}
          </Button>
        )
      },
    },
  ]

  const fetchData = async (e?: React.FormEvent) => {
    e?.preventDefault()
    try {
      setLoading(true)
      const res = await fetch("/api/list-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName,
          userPoolid,
        }),
      })

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const json = await res.json()
      const pdfFiles = extractPdfFiles(json)
      setData(pdfFiles)
    } catch (err) {
      console.error("Error al obtener los archivos PDF:", err)
      alert("Error al cargar los archivos. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Image src="/icons/icono_cabecera.png" alt="Archivos PDF" width={20} height={20} />
            Archivos PDF
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Gestiona y descarga tus archivos PDF generados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Botón para cargar archivos */}
          <div className="flex justify-center">
            <Button
              onClick={fetchData}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Cargando archivos...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Cargar Archivos PDF
                </>
              )}
            </Button>
          </div>

          {/* Mostrar la tabla solo si hay datos */}
          {data.length > 0 && (
            <>
              {/* Controles de filtrado */}
              <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar archivos por nombre..."
                    value={(table.getColumn("fileName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("fileName")?.setFilterValue(event.target.value)}
                    className="max-w-sm border-primary/20 focus:border-primary"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/5 bg-transparent">
                      <Filter className="w-4 h-4 mr-2" />
                      Columnas
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          className="capitalize"
                        >
                          {column.id === "fileName" && "Archivo"}
                          {column.id === "size" && "Tamaño"}
                          {column.id === "lastModified" && "Fecha"}
                          {column.id === "actions" && "Acciones"}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Tabla */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-muted/30">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="font-semibold text-foreground">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-primary/5 transition-colors border-border/50">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Image
                              src="/icons/file-text-icon.png"
                              alt="No hay archivos PDF"
                              width={48}
                              height={48}
                              className="text-muted-foreground/50"
                            />
                            <p className="text-lg font-medium">No hay archivos PDF</p>
                            <p className="text-sm">Los archivos aparecerán aquí una vez cargados</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between px-2">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {table.getRowModel().rows.length} de {data.length} archivo(s)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="hover:bg-primary/5"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="hover:bg-primary/5"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Estado cuando no hay datos y no está cargando */}
          {data.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Image
                  src="/icons/file-text-icon.png"
                  alt="No hay archivos cargados"
                  width={48}
                  height={48}
                  className="text-muted-foreground"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No hay archivos cargados</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Haz clic en &quot;Cargar Archivos PDF&quot; para ver tus documentos disponibles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

  )
}
