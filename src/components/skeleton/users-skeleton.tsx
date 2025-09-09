// app/users/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function UsersSkeleton() {
    // Simula columnas (ajusta según tu tabla real)
    const columns = [
        { name: "Usuario" },
        { name: "Rol" },
        { name: "Email" },
        { name: "Estado" },
        { name: "Creado" },
        { name: "Acciones" },
    ]

    // Simula filas
    const rows = 6

    return (
        <div className="flex flex-col gap-4 p-5 bg-bg-inset h-[calc(100svh-var(--header-height))]!">
            {/* Skeleton del PageHeader */}
            <Card className="card-generic p-5 w-[100%]">
                <div className="grid grid-cols-[1fr_auto] gap-4">
                    <div className="flex flex-col justify-end">
                        <Skeleton className="h-6 w-64 rounded" /> {/* Título */}
                        <Skeleton className="h-4 w-96 mt-2 rounded" /> {/* Descripción */}
                    </div>
                    <div className="flex justify-end items-end h-full">
                        <Skeleton className="h-10 w-32 rounded" /> {/* Botón de acciones */}
                    </div>
                </div>
            </Card>

            {/* Skeleton del UsersActionsWrapper → incluye filtros y tabla */}
            <div className="flex-1">
                {/* Skeleton de filtros */}
                <Card className="flex items-center justify-between card-generic p-5 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-row gap-1 w-auto">
                            {/* Simula 2 inputs de filtro */}
                            <Skeleton className="h-10 w-64 rounded" />
                            <Skeleton className="h-10 w-64 rounded" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-10 w-24 rounded" /> {/* Botón Buscar */}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded" /> {/* DataViewOptions */}
                    </div>
                </Card>

                {/* Skeleton de la tabla */}
                <Card className="flex flex-col card-generic p-5">
                    <div className="mb-4">
                        <Skeleton className="h-10 w-32 rounded" /> {/* Botón de acciones arriba de la tabla */}
                    </div>

                    <div className="rounded-md border">
                        {/* Cabeceras de la tabla */}
                        <div className="border-b bg-muted/50">
                            <div className="grid grid-cols-6"> {/* Ajusta cols según tus columnas */}
                                {columns.map((col, i) => (
                                    <div key={i} className="p-4">
                                        <Skeleton className="h-4 w-full max-w-32 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filas skeleton */}
                        <div>
                            {Array.from({ length: rows }).map((_, rowIndex) => (
                                <div key={rowIndex} className="border-b grid grid-cols-6 hover:bg-muted/50">
                                    {columns.map((_, colIndex) => (
                                        <div key={colIndex} className="p-4">
                                            <Skeleton className="h-4 w-full max-w-24 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skeleton de paginación */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            <Skeleton className="h-4 w-48 rounded" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-8 w-20 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-20 rounded" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}