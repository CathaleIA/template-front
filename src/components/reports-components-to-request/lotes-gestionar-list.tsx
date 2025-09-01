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

const lotes = [
  {
    job_id: "2d5a1571-30fd-4267-b53b-e7010882asdfb82a",
    fecha_modificacion: "2025-08-01",
    estado: "Pendiente",
    activo_test: "CT",
  },
  {
    job_id: "2d5a1571-30fd-4267-b53b-e70asdfa10882b82a",
    fecha_modificacion: "2025-08-05",
    estado: "En proceso",
    activo_test: "Dinamicas",
  },
  {
    job_id: "cc5e80d4-4ebc-4761-b815-90945038061c",
    fecha_modificacion: "2025-08-10",
    estado: "NORMALIZADO",
    activo_test: "Estaticas",
  },
  {
    job_id: "b43fc2c3-f4f8-4c8a-8a82-9483a5bc82ad",
    fecha_modificacion: "2025-08-12",
    estado: "NORMALIZADO",
    activo_test: "CT",
  },
  {
    job_id: "2d5a1571-30fd-4267-b53b-e7010882b82a",
    fecha_modificacion: "2025-08-15",
    estado: "Pendiente",
    activo_test: "CT",
  },
]

interface TableGestionLotesProps {
  onJobSelect?: (jobId: string) => void
  selectedJobId?: string
}

export default function TableGestionLotes({ onJobSelect, selectedJobId }: TableGestionLotesProps) {
    
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
              <TableCell>{lote.fecha_modificacion}</TableCell>
              <TableCell>{lote.estado}</TableCell>
              <TableCell>{lote.activo_test}</TableCell>
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
