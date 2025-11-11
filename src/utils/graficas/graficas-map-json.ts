// aca vamos a consultar la informacion del anexo
// Consultaremos el Json -- obtener los objetos de las graficas y las vamos a almacenar en una lista
// dicha funcion va retornar esta lista de la data que vamos a graficar
// --------------------
// Tipos útiles
// --------------------
interface ChartDatasetSimple {
    label: string;
    data: number[];
    borderColor: string;
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
}

interface ObjetoDataPrimitivo {
    labels: (string | number)[];
    datasets: ChartDatasetSimple[];
}

interface ObjetoGrafica {
    key: string;
    type: string; // 'line', 'bar', ...
    data: ObjetoDataPrimitivo;
    options: any; // puedes tiparlo con Chart.js types si quieres
}


// --------------------
// Función transformadora
// --------------------
export default function transformarDatatomapAChartObjects(datatomap: Record<string, any>): ObjetoGrafica[] {
    if (!datatomap || typeof datatomap !== "object") return [];

    const colores = ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#4bc0c0", "#9966ff"];

    return Object.entries(datatomap)
        .filter(([clave]) => clave.startsWith("grafica"))
        .map(([clave, grafica]) => {
            // Validaciones básicas
            const labels = Array.isArray(grafica.data_eje_x) ? grafica.data_eje_x : [];
            const seriesArray = Array.isArray(grafica.series) ? grafica.series : [];

            // Transformar cada serie en dataset
            const datasets: ChartDatasetSimple[] = seriesArray.map((serie: any, index: number) => {
                const dataNumbers: number[] = Array.isArray(serie.data)
                    ? serie.data.map((v: any) => {
                        const n = Number(v);
                        return Number.isFinite(n) ? n : NaN;
                    })
                    : [];

                return {

                    label: String(serie.label),
                    data: dataNumbers,
                    borderColor: colores[index % colores.length],
                    fill: false,
                    tension: 0.2,
                    borderWidth: 2,
                };
            });

            // Opciones comunes
            const options = {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: grafica.title ?? clave,
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: grafica.xAxisLabel ?? "",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: grafica.yAxisLabel ?? "",
                        },
                    },
                },
            } as any;

            // Mapear graficType
            let chartType = "line";
            if (grafica.graficType === "linear") {
                chartType = "line";
            } else if (grafica.graficType === "log") {
                chartType = "logarithmic";
                options.scales.x.type = "logarithmic"; 
                options.scales.y.type = "logarithmic";
            } else if (grafica.graficType === "bar") {
                chartType = "bar";
            }

            return {
                key: clave,
                type: chartType,
                data: { labels, datasets },
                options,
            };
        });
}
