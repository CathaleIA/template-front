"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Report } from "@/types/solar";

export function ReportsTable() {
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tenantName, setTenantName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  /**
   * 1️⃣ Obtener tenant desde cookies / API
   */
  useEffect(() => {
    async function fetchTenant() {
      try {
        const res = await fetch("/api/auth/tenantget");

        if (!res.ok) {
          throw new Error("Error obteniendo tenant");
        }

        const data = await res.json();

        if (data?.username && data?.userPoolDomain) {
          setTenantName(data.userPoolDomain);
          setUserName(data.userPoolId);
        } else {
          setError("No se encontraron datos de tenant");
        }
      } catch (err) {
        console.error("Error obteniendo tenant:", err);
        setError("Error al cargar tenant");
      }
    }

    fetchTenant();
  }, []);

  /**
   * 2️⃣ Obtener reportes CUANDO el tenant esté listo
   */
  useEffect(() => {
    if (!tenantName || !userName) return;

    async function fetchReports() {
      try {
        setLoading(true);

        // Log para ver tenantName y userName
        console.log("tenantName desde fetchReports:", tenantName);
        console.log("userName desde fetchReports:", userName);

        const res = await fetch("/api/pdf-solar-down", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantName,
            userPoolName: userName,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }

        const json = await res.json();
        setData(json.resultData ?? []);
      } catch (err) {
        console.error("Error cargando reportes:", err);
        setError("Error al cargar reportes");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [tenantName, userName]);
  if (loading) return <p>Cargando reportes...</p>;

  return <DataTable columns={columns} data={data} />;
}
