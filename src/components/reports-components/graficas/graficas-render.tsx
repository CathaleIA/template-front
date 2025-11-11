import { useEffect, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    PointElement,
    BarElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

interface GraficaProps {
    graficas: {
        key: string;
        type: string;
        data: any;
        options: any;
    }[];
}

export default function GraficasRender({ graficas }: GraficaProps) {
    console.log("🔍 GraficasRender recibió:", graficas);
    return (
        <>
            {graficas.map((grafica, i) => (
                <ChartToBase64
                    key={i}
                    grafica={grafica}
                    targetId={`${grafica.key}-container`} // 👈 se inserta en el contenedor con ID
                />
            ))}
        </>
    );
}

function ChartToBase64({ grafica, targetId }: { grafica: any; targetId: string }) {
    const chartRef = useRef<ChartJS | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const container = document.getElementById(targetId);

            if (container && chartRef.current) {
                const base64 = chartRef.current.toBase64Image();
                const img = document.createElement("img");
                img.src = base64;
                img.width = 600;
                img.height = 400;
                container.innerHTML = "";
                container.appendChild(img);
                console.log(`✅ Insertado en #${targetId}`);
            } else {
                console.warn(`⚠️ No encontré el contenedor con ID: ${targetId}`);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [grafica, targetId]);


    const ChartComponent = grafica.type === "line" ? Line : Bar;

    return (
        <div style={{ visibility: "hidden", position: "absolute", width: "600px", height: "400px" }}>
            <ChartComponent
                ref={chartRef as any}
                data={grafica.data}
                options={{
                    ...grafica.options,
                    responsive: false, // 👈 evita que se autoajuste a 0
                    maintainAspectRatio: false,
                }}
                width={600}
                height={400}
            />
        </div>
    );
}
