"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { ResponseQueryReportsList } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import ButtonUploadDBStatus from "@/components/reports-components/button-upload-report-db/button-upload-db-status";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

// Exporta una función que devuelve el array de ColumnDef
export function useColumns<TData extends ResponseQueryReportsList = ResponseQueryReportsList>(
  onJobSelect?: (jobId: string) => void,
  onActivoSelect?: (activo: string) => void,
  selectedJobId?: string,
  tenantName?: string
): ColumnDef<TData>[] {
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const handleSuccess = (response: any) => {
    setMessage(response.message || "Actualización exitosa");
    setIsError(false);
    toast.success( response.message);
  };

  const handleError = (error: Error) => {
    setMessage(error.message || "Error en la actualización");
    setIsError(true);
    toast.error(error.message);
  };

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
          <div>

            <Button
              variant={selectedJobId === jobId ? "custom" : "secondary"}
              className="bg-green-500 text-white hover:bg-green-900"
              size="custom"
              onClick={() => {
                onJobSelect?.(jobId);
                onActivoSelect?.(row.getValue("activo"))
              }}

            >
              {selectedJobId === jobId ? "Seleccionado" : "Seleccionar"}
            </Button>
            <ButtonUploadDBStatus 
              tenantName={tenantName || ""}
              sortKey={row.getValue("codigo")}
              statusValue={"GESTIONADO"}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>

        );
      },
    },
  ] as ColumnDef<TData>[];
}
