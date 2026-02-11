import { ColumnDef } from "@tanstack/react-table";
import { Report } from "@/types/solar";
import { Button } from "@/components/ui/button";

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
    header: "Usuario",
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
    accessorKey: "NombreArchivo",
    header: "Nombre del archivo",
    cell: ({ row }) => {
      const value = row.getValue("pathFile") as string;
      const nombreArchivo = value.split("/").slice(-1)[0]; // 
      return nombreArchivo.replace(/\.html$/, ".pdf");
    },
  },
  {
    accessorKey: "pathFile",
    header: "Reporte",
    cell: ({ row }) => {
      const path = row.getValue("pathFile") as string;
      console.log("Path del archivo para reporte:", path);
      const handleClick = async () => {
        const response = await fetch(
          `/api/pdf-solar-get-url?path=${encodeURIComponent(path)}`
        );

        const data = await response.json();

        window.open(data.url, "_blank");
      };

      return (
        <Button onClick={handleClick}>Ver reporte</Button>
      );
    },
  },
];
