// Generar datos simulados para 10 cilindros
interface CylinderTempChartProps {
    minTemp?: number;
    maxTemp?: number;
    title?: string;
    warningThreshold?: number;
}

interface CylinderData {
    minTemp: number;
    maxTemp: number;
    title: string;
    warningThreshold?: number;
    cylinders?: Array<string>;
    current?: Array<number>;
    min?: Array<number>;
    max?: Array<number>;
}

const generateSimulatedData = ({
    minTemp = 90,
    maxTemp = 110,
    title = 'Temperatura cilindros',
    warningThreshold = 0.9,
}: CylinderTempChartProps): CylinderData => {
    const cylinders = Array.from({ length: 20 }, (_, i) => `C${i + 1}`);
    const currentTemps = cylinders.map(() => minTemp + Math.random() * (maxTemp - minTemp));

    return {
        minTemp: 90,
        maxTemp: 110,
        title: 'Temperaturas de los cilindros',
        warningThreshold: 0.9,
        cylinders,
        current: currentTemps,
        min: currentTemps.map(temp => Math.max(minTemp - 5, temp - 5 - Math.random() * 5)),
        max: currentTemps.map(temp => Math.min(maxTemp + 5, temp + 5 + Math.random() * 5))
    };
};

export {
    generateSimulatedData,
}