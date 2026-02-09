import { ColumnDef } from "@tanstack/react-table";
import { Report } from "@/types/solar";

export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "estado",
    header: "Estado",
  },
  {
    accessorKey: "tipoPrueba",
    header: "Tipo de Prueba",
  },
  {
    accessorKey: "userPoolId",
    header: "User Pool",
  },
  {
    accessorKey: "timestamp",
    header: "Fecha",
    cell: ({ row }) => {
      const value = row.getValue("timestamp") as string;
      return new Date(Number(value)).toLocaleString();
    },
  },
  {
    accessorKey: "pathFile",
    header: "Reporte",
    cell: ({ row }) => {
      const path = row.getValue("pathFile") as string;
      return (
        <a
          href={`https://solar-reports-prod-1762831693.s3.us-east-1.amazonaws.com/${path}`}
          target="_blank"
          className="text-blue-600 underline"
        >
          Ver reporte
        </a>
      );
    },
  },
];
