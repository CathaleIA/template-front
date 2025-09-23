import type { ItemPremitive, ItemQuery } from "@/types"
import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { getAnexoColumns } from "@/components/reports-components/colums-anexos-gestionar/colums" // 👈 columnas específicas

interface CardProps {
  tenant_name: string;
  job_id: string;
  estado: string;
  type: string;
  onSelectAnexo?: (item: ItemPremitive) => void;
}

export default function ListadoAnexos({ tenant_name, job_id, estado, type, onSelectAnexo}: CardProps) {
  const [data, setData] = useState<ItemPremitive[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function getItems(): Promise<ItemPremitive[]> {
    const bodyConsult: ItemQuery = { tenant_name, job_id, estado, type }

    const res = await fetch("/api/item-consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(bodyConsult),
    })

    if (!res.ok) throw new Error("Error cargando items")

    const rowData = await res.json()
    return rowData.map((d: any) => ({
      tenant_id: d.tenant_id,
      job_id: d.job_id,
      activo: d.activo,
      estado: d.estado,
      fecha_creacion: d.fecha_creacion,
      pool_user_id: d.pool_user_id,
      s3_html_path: d.s3_html_path,
      s3_json_path: d.s3_json_path,
    }))
  }

  useEffect(() => {
    if (!tenant_name || !job_id || !estado) {
      setData([])
      return
    }

    const fetchItems = async () => {
      setIsLoading(true)
      try {
        const items = await getItems()
        setData(items)
      } catch (error) {
        console.error("Error loading items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [tenant_name, job_id, estado])

  return (
    <div>
      <DataTable
        columns={getAnexoColumns(onSelectAnexo)}
        data={data}
        filters={[
          { column: "s3_html_path", placeholder: "Buscar por nombre..." },
          { column: "activo", placeholder: "Buscar por dispositivo..." },
        ]}
      />
    </div>
  )
}
