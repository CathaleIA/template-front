"use client";
import { ReportsTable } from "@/components/reports-components/colums-solar-reports-gestionar/table-report-solar";


export default function GestionReportesPage() {

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Reportes</h1>
      <ReportsTable />
    </div>
  );
}
