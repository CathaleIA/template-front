"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Report } from "@/types/solar";

export function ReportsTable() {
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/pdf-solar-down", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantName: "pooledtenant-serverlesssaas-240435918890",
            userPoolName: "tenant-admin-b496fcca4af911f087a7b12ec9ddb508",
          }),
        });

        const json = await res.json();
        setData(json.resultData ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) return <p>Cargando reportes...</p>;

  return <DataTable columns={columns} data={data} />;
}
