import type { ItemPremitive, ItemQuery } from "@/types"
import { useState } from "react"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Componente eventos de la llamada del archivo con HTML entocnes sera la del archiv o HTML
// por otro lado tambien el LLamado de JSON y la GRAFICA

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"


interface CardProps {
    tenant_name: string;
    job_id: string;
    estado: string;
    onSelectAnexo?:(item: ItemPremitive) => void;
}

export default function ListadoAnexos({ tenant_name, job_id, estado, onSelectAnexo }: CardProps) {
    const [items, setItems] = useState<ItemPremitive[]>([])
    const [isLoading, setIsLoading] = useState(false)
    // el operador de propagación no ssirva para expandir un iterable o objeto
    async function getItems(): Promise<ItemPremitive[]> {
        // tenemos que recordar siempre comolocar "/" en el api
        const bodyConsult: ItemQuery = {
            tenant_name: tenant_name,
            job_id: job_id,
            estado: estado
        }

        const res = await fetch("/api/item-consult", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify(bodyConsult),
        })

        if (!res.ok) throw new Error("Error cargando items")

        return res.json()
    }
    const handleLoadItems = async () => {
        setIsLoading(true)
        try {
            const newItems = await getItems()
            setItems(newItems)
        } catch (error) {
            console.error("Error loading items:", error)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Listado de Anexos</h3>
                <button
                    onClick={handleLoadItems}
                    disabled={isLoading || !job_id}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? "Cargando..." : "Cargar Anexos"}
                </button>
            </div>
            {!job_id && (
                <p className="text-gray-500 text-sm">Selecciona un Job ID del paso anterior para cargar los anexos</p>
            )}
            <div className="h-[400px] overflow-y-auto space-y-2">
                        <Table>
                            <TableCaption>Listado anexos para gestionar.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Nombre Archivo</TableHead>
                                    <TableHead>Fecha modificación</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Activo - Dispositivo</TableHead>
                                </TableRow>
                            </TableHeader >
                            <TableBody>
                                {items.map((lote) => (
                                    <TableRow key={lote.job_id}>
                                        <TableCell>{lote.s3_json_path.split("/").pop() || "Desconocido"}</TableCell>
                                        <TableCell>{lote.fecha_creacion}</TableCell>
                                        <TableCell><Badge>{lote.estado}</Badge></TableCell>
                                        <TableCell>{lote.pool_user_id}</TableCell>
                                        <TableCell><Button onClick={() => onSelectAnexo?.(lote)}>Gestionar</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4}>Total de lotes</TableCell>
                                    <TableCell className="text-right">{items.length}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    
            </div>
        </div>
    )

}
