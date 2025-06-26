

import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';

Chart.register(...registerables);

export const generarGraficaBase64 = async (chartData: any, width: number = 600, height: number = 400): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("No se pudo crear el contexto del canvas");
            resolve('');
            return;
        }

        // Configura la gráfica
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.rangosEjeX || chartData.puntosEjeX,
                datasets: Object.keys(chartData.puntosGrficar || {}).map(key => ({
                    label: key,
                    data: chartData.puntosGrficar[key],
                    borderColor: getRandomColor(),
                    tension: 0.1,
                    fill: false,
                    pointRadius: 3,
                    pointBackgroundColor: getRandomColor()
                }))
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: chartData.title }
                },
                scales: {
                    x: { title: { display: true, text: chartData.xAxisLabel } },
                    y: { title: { display: true, text: chartData.yAxisLabel } }
                }
            }
        });

        // Espera un breve tiempo para asegurar que la gráfica se renderice
        setTimeout(() => {
            const base64 = canvas.toDataURL('image/png');
            chart.destroy(); // Limpia la gráfica para liberar memoria
            resolve(base64);
            console.log(base64)
        }, 2000);
    });
};

// Genera un color aleatorio para las gráficas
const getRandomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// esto es como un metodo en java *CASI*  -> (file: File) es el tipo de parametro que esta esperando
// y la promesa es el tipo de dato que espera en respuesta


export const convertirArchivoABase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(",")[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};



export const generarGraficaExiBase64 = async (chartData: any, width: number = 600, height: number = 400): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("No se pudo crear el contexto del canvas");
            resolve('');
            return;
        }
        const data = {
            labels: chartData.puntosEjeX,
            datasets: [
                {
                    label: chartData.title,
                    data: chartData.puntosEjeY,
                    boderColor: getRandomColor(),
                    borderWidth: 2,
                    fill: false,
                }
            ]
        }

        const options: ChartOptions<'line'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartData.title,
                },
            },
            scales: {
                x: {
                    type: 'logarithmic' as const, // ✅ Forzamos tipo literal
                    position: 'bottom' as const,
                    title: {
                        display: true,
                        text: chartData.xAxisLabel,
                    },
                },
                y: {
                    type: 'logarithmic' as const, // ✅ Forzamos tipo literal
                    position: 'left' as const,
                    title: {
                        display: true,
                        text: chartData.yAxisLabel,
                    },
                },
            },
        }


        // Espera un breve tiempo para asegurar que la gráfica se renderice

        const config: ChartConfiguration<'line'> = {
            type: 'line',
            data,
            options,
        };

        const chart = new Chart(ctx, config);

        // Esperamos a que se dibuje completamente
        setTimeout(() => {
            const base64 = canvas.toDataURL('image/png');
            chart.destroy();
            resolve(base64);
        }, 500); // Puedes ajustar este tiempo si es necesario
    });
};
