function generateMockTemperatureData(): { timestamp: Date; temperature: number }[] {
    const data: { timestamp: Date; temperature: number }[] = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const date = new Date(now);
        date.setDate(now.getDate() - dayOffset);

        for (let hour = 0; hour < 24; hour++) {
            const timestamp = new Date(date);
            timestamp.setHours(hour, 0, 0, 0);

            // Simulación: temperatura entre 40°C y 90°C con variación horaria
            const baseTemp = 40 + Math.random() * 50;
            const fluctuation = Math.sin((hour / 24) * 2 * Math.PI) * 10;
            const temperature = Math.round(baseTemp + fluctuation);

            data.push({ timestamp, temperature });
        }
    }

    return data;
}

const mockData = generateMockTemperatureData();

export const Heatdata = {
    data:mockData,
    title: 'Temperatura de prueba'
}


