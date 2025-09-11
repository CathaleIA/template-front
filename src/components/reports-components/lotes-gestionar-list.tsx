"use client"

import { Button } from "@/components/ui/button"
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
import { ResponseQueryReportsList } from "@/types"


import { useEffect, useState } from "react"

interface TableGestionLotesProps {
  onJobSelect?: (jobId: string) => void
  selectedJobId?: string
  tenantName: string
  status: string
  userPoolId: string
}


export default function TableGestionLotes({ onJobSelect, selectedJobId, tenantName, status, userPoolId }: TableGestionLotesProps) {
  const [lotes, setLotes] = useState<ResponseQueryReportsList[]>([])
  const [isLoading, setIsLoading] = useState(false)


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

      const data = await response.json()
      setLotes(data)
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

          <Table>
          <TableCaption>Listado de lotes para gestionar.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Job Id</TableHead>
              <TableHead>Fecha modificación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Activo test</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotes.map((lote) => (

              <TableRow key={lote.job_id}>
                <TableCell className="font-medium">{lote.job_id}</TableCell>
                <TableCell>{lote.fecha_creacion}</TableCell>
                <TableCell>{lote.estado}</TableCell>
                <TableCell>{lote.activo}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={selectedJobId === lote.job_id ? "default" : "secondary"}
                    size="sm"
                    onClick={() => onJobSelect?.(lote.job_id)}
                  >
                    {selectedJobId === lote.job_id ? "Seleccionado" : "Seleccionar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total de lotes</TableCell>
              <TableCell className="text-right">{lotes.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

    </div>
  )
}
