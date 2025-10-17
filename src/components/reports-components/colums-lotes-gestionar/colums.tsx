"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ItemPremitive, ResponseQueryReportsList } from "@/types";
import { Button } from "@/components/ui/button";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

// Exporta una función que devuelve el array de ColumnDef
export function getColumns<TData extends ResponseQueryReportsList = ResponseQueryReportsList>(
  onJobSelect?: (jobId: string) => void,
   onActivoSelect?: (activo: string) => void,
  selectedJobId?: string
): ColumnDef<TData>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "codigo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Codigo" />
      ),
    },
    {
      accessorKey: "fechaUpdate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha de Modificacion" />
      ),
    },
    {
      accessorKey: "statusLote",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue<string>("statusLote");
        let variant: BadgeVariant = "secondary";
        let className = "";

        switch (status) {
          case "DESCOMPRIMIDO":
            className = "bg-blue-primary text-white";
            break;
          // añade más casos si quieres
        }

        return <Badge variant={variant} className={className}>{status}</Badge>;
      },
    },
    {
      accessorKey: "activo",
      header: "Dispositivo",
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        // row.original está tipado como TData (ResponseQueryReportsList)
        const jobId = (row.original as unknown as ResponseQueryReportsList).lote_job_id || (row.getValue("codigo") as string);
        return (
          <Button
            variant={selectedJobId === jobId ? "custom" : "secondary"}
            size="custom"
            onClick={() => {onJobSelect?.(jobId);
              onActivoSelect?.(row.getValue("activo"))
            } }
            
          >
            {selectedJobId === jobId ? "Seleccionado" : "Seleccionar"}
          </Button>
        );
      },
    },
  ] as ColumnDef<TData>[];
}
