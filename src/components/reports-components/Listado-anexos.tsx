import type { ItemPremitive, ItemQuery } from "@/types/type-report/item"
import { useState } from "react"
import CardItem from "./Cards-params"

interface CardProps {
    tenant_name: string;
    job_id: string;
    estado: string;
}

export default function ListadoAnexos({ tenant_name, job_id, estado }: CardProps) {
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
        {items.map((item, index) => (
          <CardItem
            key={`${item.job_id}-${index}`}
            nameFile={item.s3_html_path?.split("/").pop() || "Desconocido"}
            date={item.fecha_creacion}
            estado={item.estado}
            pool_user_id={item.pool_user_id}
            lote={item.job_id}
          />
        ))}
      </div>
        </div>
    )

}
