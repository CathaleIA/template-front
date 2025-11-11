import { DataTable } from "@/components/ui/data-table";
import { ResponseQueryReportsList} from "@/types";
import { useColumns } from "@/components/reports-components/colums-lotes-gestionar/colums";
import { useEffect, useState } from "react";

interface TableGestionLotesProps {
  onJobSelect?: (jobId: string) => void;
  selectedJobId?: string;
  tenantName: string;
  status: string;
  onActivoSelect?: (activo: string) => void;
  userPoolId: string;
}

export default function TableGestionLotes({
  onActivoSelect,
  onJobSelect,
  selectedJobId,
  tenantName,
  status,
  userPoolId,
}: TableGestionLotesProps) {
  const [data, setData] = useState<ResponseQueryReportsList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filters = [
    { column: "codigo", placeholder: "Filter by codigo..." },
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
      {selectedJobId && (
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm font-medium text-blue-800">
            Job ID seleccionado: {selectedJobId}
          </p>
        </div>
      )}

      <div>
        <DataTable
          columns={useColumns(onJobSelect, onActivoSelect, selectedJobId, tenantName)}
          data={data}
          filters={filters}
          // isLoading={isLoading} // si tu DataTable admite este prop
        />
      </div>
    </div>
  );
}
