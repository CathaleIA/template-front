import { Variable } from "lucide-react";

/// DATOS SIMULADOS DE TENDENCIAS 
// TENDENCIES
interface TraceData {
  x: Date[];
  y: number[];
  name: string;
  mode?: 'lines' | 'markers' | 'lines+markers';
  lineColor?: string;
}

// MODIFICADO: Datos entre 20-30 Hz (siempre positivos)
const generateData = (
  points: number,
  timeRange: number // en milisegundos
) => {
  const baseValue = 25; // Centro del rango 20-30
  const x = Array.from({ length: points }, (_, i) => {
    const step = timeRange / points;
    return new Date(Date.now() - timeRange + step * i);
  });
  const y = Array.from({ length: points }, () => {
    // Variación de ±2.5 para mantener el rango 20-30
    const variation = (Math.random() * 2 - 1) * 2.5;
    return Math.max(20, Math.min(30, baseValue + variation));
  });
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

// Función para generar datos con valores constantes en un rango específico
const generatePowerData = (
  days: number,
  baseValue: number,
  maxVariation: number
): { x: Date[], y: number[] } => {
  const points = 24 * days;
  const now = Date.now();
  const timeRange = days * 24 * 60 * 60 * 1000;
  
  const x = Array.from({ length: points }, (_, i) => {
    const date = new Date(now - timeRange + (i * (timeRange / points)));
    date.setMinutes(0, 0, 0);
    return date;
  });
  
  const y = Array.from({ length: points }, () => {
    const randomVariation = (Math.random() * 2 - 1) * maxVariation;
    return baseValue + randomVariation;
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

// Potencia Activa (820 ±1.5 kW)
const PotenciaActiva: TraceData = {
  ...generatePowerData(30, 820, 1.5), // baseValue=820, variación=±1.5
  name: 'Potencia Activa',
  mode: 'lines'
};

// Potencia Reactiva (275 ±1.5 kVAr)
const PotenciaReactiva: TraceData = {
  ...generatePowerData(30, 275, 1.5), // baseValue=275, variación=±1.5
  name: 'Potencia Reactiva',
  mode: 'lines'
};

// Potencia Aparente (875 ±1.5 kVA)
const PotenciaAparente: TraceData = {
  ...generatePowerData(30, 875, 1.5), // baseValue=875, variación=±1.5
  name: 'Potencia Aparente',
  mode: 'lines'
};

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

      // Base entre 65 y 70 con fluctuación mínima
      const baseTemp = 67; // punto medio
      const randomFluctuation = (Math.random() * 2 - 1) * 1.5; // ±1.5 °C
      const offset = index * 0.5; // pequeñas diferencias entre fases

      y.push(Math.round(baseTemp + randomFluctuation + offset));
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

const FrecuencyCilindersData = {
  minPF: 0,
  maxPF: 100,
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

// Configuraciones individuales para cada tipo de potencia
const PotenciaActivaData = {
  minPF: 818,
  maxPF: 822,
  traces: [PotenciaActiva],
  tittle: 'Potencia Activa',
  yAxisTitle: 'Potencia [kW]',
};

const PotenciaReactivaData = {
  minPF: 250,
  maxPF: 300,
  traces: [PotenciaReactiva],
  tittle: 'Potencia Reactiva',
  yAxisTitle: 'Potencia [kVAr]',
};

const PotenciaAparenteData = {
  minPF: 850,
  maxPF: 900,
  traces: [PotenciaAparente],
  tittle: 'Potencia Aparente',
  yAxisTitle: 'Potencia [kVA]',
};

//OUTPUTS
export {
  FrecuencyCilindersData,
  EnergyPowerData,
  PotenciaActivaData,
  PotenciaReactivaData,
  PotenciaAparenteData,
  VelocidadFrecuencyData,
  DevanadosData,
}