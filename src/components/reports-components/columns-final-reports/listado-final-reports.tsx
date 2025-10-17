import { DataTable } from "@/components/ui/data-table";
import {  ResponseQueryReportsList} from "@/types";
import { getColumns } from "@/components/reports-components/columns-final-reports/columns";
import { useEffect, useState } from "react";

interface TableGestionReportsFileProps {

  selectedFinalReport?: string | null
  tenantName: string;
  status: string;
  userPoolId: string;
}

export default function TableGestionReportsFile({

  selectedFinalReport,
  tenantName,
  status,
  userPoolId,
}: TableGestionReportsFileProps) {
  const [data, setData] = useState<ResponseQueryReportsList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filters = [
    { column: "codigo", placeholder: "Filter by Nombre..." },
    { column: "activo", placeholder: "Filter by dispositivo..." },
  ];

  async function QueryReportsList(): Promise<void> {
    try {
      setIsLoading(true);
      const response = await fetch("/api/query-report-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantName, userPoolId, status}),
      });
      if (!response.ok) throw new Error("Error fetching report list");
      const rowData = await response.json();
      const mapperData: ResponseQueryReportsList[] = rowData.map((d: any) => ({
        codigo: d.lote_job_id,
        activo: d.activo,
        statusLote: d.estado,
        fechaUpdate: d.fecha_creacion
      }));
      setData(mapperData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    QueryReportsList();
  }, [tenantName, userPoolId, status]);

  return (
    <div className="space-y-4">
      <div>
        <DataTable
          columns={getColumns( selectedFinalReport)}
          data={data}
          filters={filters}
          // isLoading={isLoading} // si tu DataTable admite este prop
        />
      </div>
    </div>
  );
}
