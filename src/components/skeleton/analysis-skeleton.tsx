import { Skeleton } from "@/components/ui/skeleton"
import { Tabs } from "@/components/ui/tabs"
import { Card, CardTitle, CardDescription, CardContent, CardHeader } from "@/components/ui/card"

export default function AnalisysSkeleton() {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col w-full">
                <Tabs defaultValue="data" className="bg-bg-inset">
                    <div className="pt-2 bg-bg-white">
                        <Skeleton className="h-9.5 w-[80%]" />
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            <Card className="card-generic">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Skeleton className="h-5 w-5 rounded" /> {/* Ícono */}
                                        <Skeleton className="h-5 w-48" /> {/* Título "Cargar Datos de Sensores" */}
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-full max-w-md" /> {/* Descripción */}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-32" /> {/* Label "Archivo de Datos" */}
                                        <div className="border-1 border-dashed border-border rounded-lg p-6">
                                            <Skeleton className="h-7 w-full rounded-md" /> {/* Botón "Seleccionar archivo" */}
                                        </div>
                                    </div>

                                    {/* Skeleton del Alert */}
                                    <div className="rounded-md border p-4 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4 rounded" />
                                            <Skeleton className="h-4 w-32" /> {/* Título "Formatos Soportados" */}
                                        </div>
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-full max-w-xs" />
                                            <Skeleton className="h-3 w-full max-w-sm" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="card-generic">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Skeleton className="h-5 w-5 rounded" /> {/* Activity icon */}
                                        <Skeleton className="h-5 w-40" /> {/* "Estado de los Datos" */}
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-56" /> {/* Descripción */}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Simulando las 5 filas de datos */}
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="flex justify-between">
                                                <Skeleton className="h-4 w-32" /> {/* Etiqueta: "Archivo cargado", etc. */}
                                                <Skeleton className="h-4 w-24" /> {/* Valor: nombre, número, fecha, etc. */}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Skeleton del Alert de "Valores Actuales" */}
                                    <div className="mt-4 p-3 border rounded-md space-y-3">
                                        <Skeleton className="h-4 w-32" /> {/* Título "Valores Actuales" */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <div key={i} className="flex justify-between">
                                                    <Skeleton className="h-3 w-16" /> {/* Nombre métrica */}
                                                    <Skeleton className="h-3 w-12" /> {/* Valor + unidad */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}