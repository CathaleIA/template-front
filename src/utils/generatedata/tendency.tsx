import { Variable } from "lucide-react";

// TENDENCIES
interface TraceData {
  x: Date[];
  y: number[];
  name: string;
  mode?: 'lines' | 'markers' | 'lines+markers';
}
const generateData = (
  points: number,
  timeRange: number // en milisegundos
) => {
  const baseValue = 40 + Math.random() * 20; // 40–60
  const x = Array.from({ length: points }, (_, i) => {
    const step = timeRange / points;
    return new Date(Date.now() - timeRange + step * i);
  });
  const y = Array.from({ length: points }, () =>
    baseValue + (Math.random() * 2 - 1) * 0.5 // variación de ±0.5Hz
  );
  return { x, y };
};
const FrecuencyCilinder1: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 1',
};
const FrecuencyCilinder2: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 2',
};
const FrecuencyCilinder3: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 3',
}
const FrecuencyCilinder4: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 4',
}
const FrecuencyCilinder5: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 5',
}
const FrecuencyCilinder6: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 6',
}
const FrecuencyCilinder7: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 7',
}
const FrecuencyCilinder8: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 8',
}
const FrecuencyCilinder9: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 9',
}
const FrecuencyCilinder10: TraceData = {
  x: generateData(1000, 3600000).x,
  y: generateData(1000, 3600000).y,
  mode: 'lines',
  name: 'Cyl 10',
}
const data = [
  FrecuencyCilinder1,
  FrecuencyCilinder2,
  FrecuencyCilinder3,
  FrecuencyCilinder4,
  FrecuencyCilinder5,
  FrecuencyCilinder6,
  FrecuencyCilinder7,
  FrecuencyCilinder8,
  FrecuencyCilinder9,
  FrecuencyCilinder10,
];






//power
const generateEnergyData = (
  days: number, // número de días a mostrar (1-30)
  baseValue: number,
  variation: number,
  dailyPeakHour: number = 14 // hora pico diaria (0-23)
): { x: Date[], y: number[] } => {
  const points = 24 * days;
  const now = Date.now();
  const timeRange = days * 24 * 60 * 60 * 1000;
  const x = Array.from({ length: points }, (_, i) => {
    const date = new Date(now - timeRange + (i * (timeRange / points)));
    date.setMinutes(0, 0, 0);
    return date;
  });
  const y = Array.from({ length: points }, (_, i) => {
    const hourOfDay = new Date(x[i]).getHours();
    const dailyPattern = 0.7 + 0.3 * Math.cos((hourOfDay - dailyPeakHour) * Math.PI / 12);
    return (baseValue * dailyPattern) + (Math.random() * 2 - 1) * variation;
  });
  return { x, y };
};
const EnergyConsumed: TraceData = {
  ...generateEnergyData(30, 150, 20, 14),
  name: 'Energía Consumida (kWh)',
  mode: 'lines'
};
const EnergyGenerated: TraceData = {
  ...generateEnergyData(30, 80, 15, 12),
  name: 'Energía Generada (kWh)',
  mode: 'lines'
};
const ReactiveEnergyGenerated: TraceData = {
  ...generateEnergyData(30, 60, 10, 10),
  name: 'Energía Reactiva Generada (kVARh)',
  mode: 'lines'
};
const energyTraces = [
  EnergyConsumed,
  EnergyGenerated,
  ReactiveEnergyGenerated
];
const ActivePower: TraceData = {
  ...generateEnergyData(30, 1250, 100, 14), // Base de 1250 kW con variación de 100
  name: 'Potencia Activa (kW)',
  mode: 'lines'
};
const ReactivePower: TraceData = {
  ...generateEnergyData(30, 600, 50, 10), // Base de 600 kVAR con variación de 50
  name: 'Potencia Reactiva (kVAR)',
  mode: 'lines'
};
const ApparentPower: TraceData = {
  ...generateEnergyData(30, 1400, 120, 14), // Base de 1400 kVA con variación de 120
  name: 'Potencia Aparente (kVA)',
  mode: 'lines'
};
const powerTraces = [
  ActivePower,
  ReactivePower,
  ApparentPower
];





//VELOCIDAD|FRECUENCIA
function generarVelocidadMotor(puntos: number = 100): TraceData {
  const x: Date[] = [];
  const y: number[] = [];
  const baseRPM = 1800;
  const now = Date.now();
  const unMesMs = 30 * 24 * 60 * 60 * 1000;
  const inicio = now - unMesMs;
  const intervalo = unMesMs / puntos;
  for (let i = 0; i < puntos; i++) {
    x.push(new Date(inicio + i * intervalo));
    const ruido = Math.random() * 10 - 5; // ±5 rpm
    y.push(baseRPM + ruido);
  }
  return {
    x,
    y,
    name: 'Velocidad',
    mode: 'lines',
  };
}
function generarFrecuenciaMotor(puntos: number = 100): TraceData {
  const x: Date[] = [];
  const y: number[] = [];
  const baseHz = 60;
  const now = Date.now();
  const unMesMs = 30 * 24 * 60 * 60 * 1000;
  const inicio = now - unMesMs;
  const intervalo = unMesMs / puntos;
  for (let i = 0; i < puntos; i++) {
    x.push(new Date(inicio + i * intervalo));
    const ruido = Math.random() * 0.5 - 0.25; // ±0.25 Hz
    y.push(baseHz + ruido);
  }
  return {
    x,
    y,
    name: 'Frecuencia',
    mode: 'lines',
  };
}
const rpmTraces: TraceData[] = [
  generarFrecuenciaMotor(),
  generarVelocidadMotor(),
];


// Temperatura Devanados
function generateWindingTemperatureTraces(days: number = 7): TraceData[] {
  const now = new Date();
  const totalPoints = days * 24;

  const baseColors = {
    U: '#1f77b4', // azul
    V: '#ff7f0e', // naranja
    W: '#2ca02c'  // verde
  };

  const traces: TraceData[] = ['U', 'V', 'W'].map((phase, index) => {
    const x: Date[] = [];
    const y: number[] = [];

    for (let i = 0; i < totalPoints; i++) {
      const timestamp = new Date(now);
      timestamp.setHours(now.getHours() - (totalPoints - i));
      x.push(timestamp);

      // Simulación: base + fluctuación + offset por fase
      const baseTemp = 60 + Math.random() * 10;
      const fluctuation = Math.sin((i / 24) * 2 * Math.PI) * 5;
      const offset = index * 2; // U=0, V=2, W=4
      y.push(Math.round(baseTemp + fluctuation + offset));
    }

    return {
      x,
      y,
      name: `Dev ${phase}`,
      lineColor: baseColors[phase as keyof typeof baseColors],
      mode: 'lines'
    };
  });

  return traces;
}



//SALIDAS

const DevanadosData = {
  minPF: 50,
  maxPF: 85,
  traces: generateWindingTemperatureTraces(30),
  tittle: 'Temperatura devanados',
  yAxisTitle: 'Temperatura [°C]'
}
const PowerData = {
  minPF: 1000,
  maxPF: 1480,
  traces: powerTraces,
  tittle: 'Potencias del generador',
  yAxisTitle: 'Potencia',
}

const FrecuencyCilindersData = {
  minPF: 30,
  maxPF: 65,
  traces: data,
  tittle: 'Grafica de frecuencias',
  yAxisTitle: 'Frecuencia [Hz]',
}

const EnergyPowerData = {
  minPF: 0,
  maxPF: 200,
  traces: energyTraces,
  tittle: 'Consumo y Generación de Energía',
  yAxisTitle: 'Energía (kWh/kVARh)',
};

const VelocidadFrecuencyData = {
  minPF: 0,
  maxPF: 1900,
  traces: rpmTraces,
  tittle: 'Velocidad vs Frecuencia',
  yAxisTitle: 'Frecuency vs rpm'
};



//OUTPUTS
export {
  FrecuencyCilindersData,
  EnergyPowerData,
  PowerData,
  VelocidadFrecuencyData,
  DevanadosData,
}