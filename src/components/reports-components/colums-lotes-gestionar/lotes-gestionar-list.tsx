"use client"

import { DataTable } from "@/components/ui/data-table"
import { ResponseQueryReportsList } from "@/types"
import {columns} from "@/components/reports-components/colums-lotes-gestionar/colums"

import { useEffect, useState } from "react"

interface TableGestionLotesProps {
  onJobSelect?: (jobId: string) => void
  selectedJobId?: string
  tenantName: string
  status: string
  userPoolId: string
}
  //  <Button
  //                 variant={selectedJobId === lote.job_id ? "default" : "secondary"}
  //                 size="sm"
  //                 onClick={() => onJobSelect?.(lote.job_id)}
  //               >
  //                 {selectedJobId === lote.job_id ? "Seleccionado" : "Seleccionar"}
  //               </Button>

export default function TableGestionLotes({ onJobSelect, selectedJobId, tenantName, status, userPoolId }: TableGestionLotesProps) {
  const [data, setData] = useState<ResponseQueryReportsList[]>([])
  const [isLoading, setIsLoading] = useState(false)
   const filters = [
        { column: "codigo", placeholder: "Filter by codigo..." },
        { column: "activo", placeholder: "Filter by dispositivo..." }
    ]


  async function QueryReportsList(): Promise<void> {
    try {
      setIsLoading(true)
      const response = await fetch("/api/query-report-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantName,
          userPoolId,
          status,
        }),
      })

      if (!response.ok) {
        throw new Error("Error fetching report list")
      }

      const rowData = await response.json()
      const mapperData: ResponseQueryReportsList[] = rowData.map((data: any) => {
        return {
          codigo: data.job_id,
          fechaUpdate: data.fecha_creacion,
          statusLote: data.estado,
          activo: data.activo,
        }
      })
      setData(mapperData)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    QueryReportsList()
  }, [tenantName, userPoolId, status])




  return (
    <div className="space-y-4">
      {selectedJobId && (
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm font-medium text-blue-800">Job ID seleccionado: {selectedJobId}</p>
        </div>
      )}
      <div>
        <DataTable columns={columns} data={data} filters={filters} />
      </div>
    </div>
  )
}
