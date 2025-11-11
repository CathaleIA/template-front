import { useEffect, useState } from "react";
import DatosGraficaObjeto from "@/utils/graficas/consult-data-to-grafica";
import transformarDatatomapAChartObjects from "@/utils/graficas/graficas-map-json";
import GraficasRender from "@/components/reports-components/graficas/graficas-render";
interface props{
    s3KeyJson?: string;
}
export default function Dashboard({s3KeyJson} : props) {
  const [graficas, setGraficas] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // 1️⃣ obtienes el JSON desde S3
      const json = await DatosGraficaObjeto(s3KeyJson);

      // 2️⃣ lo transformas al formato Chart.js
      if (json) {
        const charts = transformarDatatomapAChartObjects(json);
        setGraficas(charts);
      }
    }
    fetchData();
  }, [s3KeyJson]);

  return (
    <div>
      {/* 3️⃣ pasas la lista de gráficas al renderizador */}
      <GraficasRender graficas={graficas} />
    </div>
  );
}
