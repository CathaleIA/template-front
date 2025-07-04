"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Thermometer, Gauge, Droplets, BatteryCharging, Fuel, TrendingUp, TrendingDown, Minus, BarChart3, ZoomIn } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, ComposedChart, ReferenceLine, AreaChart,  PieChart, Pie, Cell } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Define threshold types and interfaces
type AlertLevel = "normal" | "warning" | "danger";

interface MotorData {
  timestamp: string;
  motor: {
    rpm: number;
    temperaturaAgua: number;
    temperaturaAceite: number;
    presionAceite: number;
    voltajeBateria: number;
    consumoCombustibleLh: number;
    cargaMotor: number;
    tiempoEncendidoMin: number;
    velocidadVehiculo: number;
    relacionTransmision: string;
    modoOperacion: string;
  };
  bancos: {
    A1: {
      lambda: number;
      tiempoInyeccionMs: number;
      tiempoEncendidoAvance: number;
      temperaturaEGT: number;
      presionCombustible: number;
      presionTurbo: number;
    };
    B1: {
      lambda: number;
      tiempoInyeccionMs: number;
      tiempoEncendidoAvance: number;
      temperaturaEGT: number;
      presionCombustible: number;
      presionTurbo: number;
    };
  };
}

interface HistoricalDataPoint {
  alertas: string[];
  estadoGeneral: string;
  torque: number;
  timestamp: string;
  voltaje: number;
  createdAt: string;
  revoluciones: number;
  potencia: number;
  temperatura: number;
  eficiencia: number;
  consumoCombustible: number;
  id: string;
  presionAceite: number;
  nivelAceite: number;
}

interface HistoricalStats {
  avg: number;
  min: number;
  max: number;
  current: number;
  trend: 'up' | 'down' | 'stable';
}

interface Anomaly {
  timestamp: string;
  value: number;
  level: AlertLevel;
}

// Define thresholds for each metric with operational zones
const thresholds = {
  temperaturaAgua: { 
    min: 0, 
    normal: 50, 
    warning: 100, 
    danger: 120, 
    max: 200 
  },
  temperaturaAceite: { 
    min: 0, 
    normal: 70, 
    warning: 100, 
    danger: 130, 
    max: 150 
  },
  presionAceite: { 
    min: 0, 
    normal: 2, 
    warning: 1.5, 
    danger: 1, 
    max: 5 
  },
  rpm: { 
    min: 0, 
    normal: 2000, 
    warning: 40000, 
    danger: 5000, 
    max: 8000 
  },
  voltajeBateria: { 
    min: 10, 
    normal: 12, 
    warning: 11.5, 
    danger: 11, 
    max: 15 
  },
  consumoCombustibleLh: { 
    min: 0, 
    normal: 10, 
    warning: 15, 
    danger: 20, 
    max: 25 
  },
  cargaMotor: { 
    min: 0, 
    normal: 80, 
    warning: 90, 
    danger: 95, 
    max: 100 
  },
  temperaturaEGT: { 
    min: 0, 
    normal: 450, 
    warning: 550, 
    danger: 650, 
    max: 800 
  },
  presionCombustible: { 
    min: 0, 
    normal: 3, 
    warning: 2.5, 
    danger: 2, 
    max: 5 
  },
  presionTurbo: { 
    min: 0, 
    normal: 1.8, 
    warning: 2.2, 
    danger: 2.5, 
    max: 3 
  },
  lambda: { 
    min: 0.5, 
    normal: 1, 
    warning: 1.2, 
    danger: 1.5, 
    max: 2 
  },
  tiempoInyeccionMs: { 
    min: 0, 
    normal: 5, 
    warning: 8, 
    danger: 10, 
    max: 15 
  },
  tiempoEncendidoAvance: { 
    min: 0, 
    normal: 20, 
    warning: 30, 
    danger: 40, 
    max: 50 
  },
};


const fieldMapping = {
  rpm: 'revoluciones',
  temperaturaAgua: 'temperatura',
  voltajeBateria: 'voltaje',
  consumoCombustibleLh: 'consumoCombustible',
  presionAceite: 'presionAceite'
};


const metricDescriptions: Record<string, string> = {
  rpm: "Mide las revoluciones por minuto del motor. Valores altos pueden indicar sobreesfuerzo.",
  temperaturaAgua: "Muestra la temperatura del agua de enfriamiento. Temperaturas elevadas pueden causar sobrecalentamiento.",
  temperaturaAceite: "Indica la temperatura del aceite del motor. Niveles altos pueden dañar componentes internos.",
  presionAceite: "Mide la presión del aceite. Valores bajos pueden indicar problemas de lubricación.",
  voltajeBateria: "Muestra el voltaje de la batería. Niveles bajos pueden afectar el sistema eléctrico.",
  consumoCombustibleLh: "Indica el consumo de combustible por hora. Valores altos pueden señalar ineficiencia.",
  temperaturaEGT: "Mide la temperatura de los gases de escape. Valores altos pueden indicar problemas de combustión.",
  presionCombustible: "Muestra la presión del sistema de combustible. Niveles bajos pueden afectar el rendimiento.",
  presionTurbo: "Indica la presión del turbocompresor. Valores fuera de rango pueden dañar el motor.",
  lambda: "Mide la relación aire-combustible. Valores fuera de rango pueden indicar mezcla ineficiente.",
  tiempoInyeccionMs: "Tiempo de inyección de combustible. Valores altos pueden indicar problemas en el sistema de combustible.",
  tiempoEncendidoAvance: "Mide el avance del encendido. Valores fuera de rango pueden afectar la eficiencia."
};


const getAlertLevel = (value: number, metric: keyof typeof thresholds): AlertLevel => {
  const limits = thresholds[metric];
  
  if (metric === "voltajeBateria" || metric === "presionAceite" || metric === "presionCombustible") {
    if (value < limits.danger) return "danger";
    if (value < limits.warning) return "warning";
    return "normal";
  } else {
    if (value > limits.danger) return "danger";
    if (value > limits.warning) return "warning";
    return "normal";
  }
};


const getColorClass = (alertLevel: AlertLevel): string => {
  switch (alertLevel) {
    case "normal":
      return "text-green-500";
    case "warning":
      return "text-amber-500";
    case "danger":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};


const calculateStats = (historicalData: HistoricalDataPoint[], field: string, currentValue: number): HistoricalStats => {
  const values = historicalData.map(item => item[field as keyof HistoricalDataPoint] as number).filter(val => typeof val === 'number' && !isNaN(val));
  
  if (values.length === 0) {
    return { avg: currentValue, min: currentValue, max: currentValue, current: currentValue, trend: 'stable' };
  }

  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const recentValues = values.slice(-10);
  const recentAvg = recentValues.length > 0 ? recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length : avg;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  const trendThreshold = avg * 0.05;
  
  if (recentAvg > avg + trendThreshold) trend = 'up';
  else if (recentAvg < avg - trendThreshold) trend = 'down';
  
  return { avg: Number(avg.toFixed(2)), min, max, current: currentValue, trend };
};

// Detect anomalies in chart data
const detectAnomalies = (chartData: any[], metric: keyof typeof thresholds): Anomaly[] => {
  return chartData
    .map(data => ({
      timestamp: data.time,
      value: data.value,
      level: getAlertLevel(data.value, metric)
    }))
    .filter(anomaly => anomaly.level !== "normal");
};

// Generate threshold chart data
const generateThresholdData = (currentValue: number, metric: keyof typeof thresholds, count = 15) => {
  const limits = thresholds[metric];
  const result = []; // Fixed variable name from 'resultgester' to 'result'
  let baseValue = currentValue;
  
  for (let i = 0; i < count; i++) {
    baseValue += (Math.random() - 0.5) * (currentValue * 0.05);
    baseValue = Math.max(limits.min, Math.min(limits.max, baseValue));
    
    result.push({
      time: `${14 - i}m`,
      value: parseFloat(baseValue.toFixed(2)),
      normalZone: limits.normal,
      warningZone: limits.warning,
      dangerZone: limits.danger,
      maxZone: limits.max,
      minZone: limits.min
    });
  }
  
  return result.reverse();
};

interface GaugeChartProps {
  value: number;
  max: number;
  unit: string;
  title: string;
  alertLevel: AlertLevel;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, max, unit, title, alertLevel }) => {
  // Configuración de zonas
  const dangerThreshold = max * 0.8; // 80% del máximo
  const warningThreshold = max * 0.6; // 60% del máximo
  
  // Crear datos para el medidor
  const percentage = (value / max) * 100;
  const emptyPercentage = 100 - percentage;
  
  const data = [
    { name: 'value', value: percentage, color: getColor() },
    { name: 'empty', value: emptyPercentage, color: '#374151' }
  ];
  
  function getColor() {
    if (value >= dangerThreshold) return '#EF4444';
    if (value >= warningThreshold) return '#F59E0B';
    return '#22C55E';
  }
  
  // Crear datos para las zonas de fondo
  const backgroundData = [
    { name: 'danger', value: 20, color: '#DC2626' },
    { name: 'warning', value: 20, color: '#D97706' },
    { name: 'normal', value: 60, color: '#059669' }
  ];
  
  const formatValue = (val: number) => {
    if (val >= 1000) return `${(val/1000).toFixed(1)}k`;
    return val.toFixed(val < 10 ? 1 : 0);
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 rounded-xl shadow-2xl border border-gray-700">
      <h3 className="text-gray-200 text-sm font-semibold mb-2 text-center">{title}</h3>
      
      <div className="relative w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Fondo con zonas de color */}
            <Pie
              data={backgroundData}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="75%"
              dataKey="value"
              stroke="none"
            >
              {backgroundData.map((entry, index) => (
                <Cell key={`bg-${index}`} fill={entry.color} opacity={0.3} />
              ))}
            </Pie>
            
            {/* Medidor principal */}
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="75%"
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`main-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <div className="text-white text-2xl font-bold">
            {formatValue(value)}
          </div>
          <div className="text-gray-300 text-sm font-medium">
            {unit}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {alertLevel === "normal" ? "NORMAL" : alertLevel === "warning" ? "ADVERTENCIA" : "PELIGRO"}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Threshold Chart Component
interface ThresholdChartProps {
  title: string;
  value: number;
  unit: string;
  metric: keyof typeof thresholds;
  icon: React.ReactNode;
  chartKey: string;
  chartData: any[];
  stats?: HistoricalStats;
}

const ThresholdChart: React.FC<ThresholdChartProps> = ({
  title,
  value,
  unit,
  metric,
  icon,
  chartKey,
  chartData,
  stats
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const alertLevel = getAlertLevel(value, metric);
  const colorClass = getColorClass(alertLevel);
  const limits = thresholds[metric];
  const isLowerBetter = metric === "voltajeBateria" || metric === "presionAceite" || metric === "presionCombustible";
  const anomalies = detectAnomalies(chartData, metric);

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Tiempo: ${label}`}</p>
          <p className="text-blue-400 font-semibold">{`Valor: ${data.value}`}</p>
          <div className="mt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 bg-green-500 rounded"></div>
              <span className="text-green-400">Normal: ≤ {data.normalZone}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 bg-yellow-500 rounded"></div>
              <span className="text-yellow-400">Advertencia: ≤ {data.warningZone}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 bg-red-500 rounded"></div>
              <span className="text-red-400">Peligro: ≤ {data.dangerZone}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={colorClass}>{icon}</div>
            <button onClick={() => setIsModalOpen(true)} className="text-gray-500 hover:text-gray-300">
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            <span className={colorClass}>{value}</span> {unit}
            {stats && (
              <div className="ml-2 inline-flex items-center">
                {renderTrendIcon(stats.trend)}
              </div>
            )}
          </div>
          
          {stats && (
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
              <div>
                <p className="font-medium">Promedio</p>
                <p>{stats.avg} {unit}</p>
              </div>
              <div>
                <p className="font-medium">Mínimo</p>
                <p>{stats.min} {unit}</p>
              </div>
              <div>
                <p className="font-medium">Máximo</p>
                <p>{stats.max} {unit}</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af" 
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  domain={[limits.min, limits.max]}
                  tick={{ fontSize: 10 }}
                />
                <Area 
                  type="monotone" 
                  dataKey={() => limits.max}
                  fill="rgba(239, 68, 68, 0.2)" 
                  stroke="none"
                />
                <ReferenceLine 
                  y={isLowerBetter ? limits.danger : limits.danger} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
                <ReferenceLine 
                  y={isLowerBetter ? limits.warning : limits.warning} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
                <ReferenceLine 
                  y={isLowerBetter ? limits.normal : limits.normal} 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={
                    alertLevel === "normal" ? "#10b981" : 
                    alertLevel === "warning" ? "#f59e0b" : 
                    "#ef4444"
                  } 
                  strokeWidth={3} 
                  dot={{ r: 2 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-green-500 rounded"></div>
                <span className="text-green-500">Normal</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-yellow-500 rounded"></div>
                <span className="text-yellow-500">Advertencia</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-red-500 rounded"></div>
                <span className="text-red-500">Peligro</span>
              </div>
            </div>
          </div>
          
          <CardDescription className="pt-2">
            {metricDescriptions[metric]}
            <br />
            {alertLevel === "normal" && "Estado: Área operativa normal"}
            {alertLevel === "warning" && "¡Atención! Área de advertencia"}
            {alertLevel === "danger" && "¡ALERTA! Área de peligro"}
          </CardDescription>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title} - Vista Detallada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    domain={[limits.min, limits.max]}
                    tick={{ fontSize: 12 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={() => limits.max}
                    fill="rgba(239, 68, 68, 0.2)" 
                    stroke="none"
                  />
                  <ReferenceLine 
                    y={isLowerBetter ? limits.danger : limits.danger} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                  <ReferenceLine 
                    y={isLowerBetter ? limits.warning : limits.warning} 
                    stroke="#f59e0b" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                  <ReferenceLine 
                    y={isLowerBetter ? limits.normal : limits.normal} 
                    stroke="#10b981" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={
                      alertLevel === "normal" ? "#10b981" : 
                      alertLevel === "warning" ? "#f59e0b" : 
                      "#ef4444"
                    } 
                    strokeWidth={3} 
                    dot={{ r: 4 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Resumen de Anomalías</h3>
              {anomalies.length > 0 ? (
                <div className="space-y-2">
                  {anomalies.map((anomaly, index) => (
                    <Alert key={index} variant={anomaly.level === "danger" ? "destructive" : "default"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{anomaly.level === "danger" ? "Alerta Crítica" : "Advertencia"}</AlertTitle>
                      <AlertDescription>
                        Detectada a las {anomaly.timestamp}: Valor {anomaly.value} {unit} ({anomaly.level === "danger" ? "Zona de peligro" : "Zona de advertencia"})
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No se detectaron anomalías recientes.</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Descripción</h3>
              <p className="text-gray-600">{metricDescriptions[metric]}</p>
              <p className="text-gray-600 mt-2">
                Rangos operativos:
                <ul className="list-disc list-inside mt-1">
                  <li className="text-green-500">Normal: hasta {limits.normal} {unit}</li>
                  <li className="text-yellow-500">Advertencia: hasta {limits.warning} {unit}</li>
                  <li className="text-red-500">Peligro: hasta {limits.danger} {unit}</li>
                </ul>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function EnhancedAlertsPage() {
  const [data, setData] = useState<MotorData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingHistorical, setLoadingHistorical] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<Record<string, any[]>>({});
  const [historicalStats, setHistoricalStats] = useState<Record<string, HistoricalStats>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://apibackend-esjz.onrender.com/api/motor");
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData);
        
        const newChartData: Record<string, any[]> = {
          temperaturaAgua: generateThresholdData(jsonData.motor.temperaturaAgua, 'temperaturaAgua'),
          temperaturaAceite: generateThresholdData(jsonData.motor.temperaturaAceite, 'temperaturaAceite'),
          rpm: generateThresholdData(jsonData.motor.rpm, 'rpm'),
          presionAceite: generateThresholdData(jsonData.motor.presionAceite, 'presionAceite'),
          voltajeBateria: generateThresholdData(jsonData.motor.voltajeBateria, 'voltajeBateria'),
          consumoCombustibleLh: generateThresholdData(jsonData.motor.consumoCombustibleLh, 'consumoCombustibleLh'),
          temperaturaEGT_A1: generateThresholdData(jsonData.bancos.A1.temperaturaEGT, 'temperaturaEGT'),
          presionCombustible_A1: generateThresholdData(jsonData.bancos.A1.presionCombustible, 'presionCombustible'),
          presionTurbo_A1: generateThresholdData(jsonData.bancos.A1.presionTurbo, 'presionTurbo'),
          lambda_A1: generateThresholdData(jsonData.bancos.A1.lambda, 'lambda'),
          tiempoInyeccionMs_A1: generateThresholdData(jsonData.bancos.A1.tiempoInyeccionMs, 'tiempoInyeccionMs'),
          tiempoEncendidoAvance_A1: generateThresholdData(jsonData.bancos.A1.tiempoEncendidoAvance, 'tiempoEncendidoAvance'),
          temperaturaEGT_B1: generateThresholdData(jsonData.bancos.B1.temperaturaEGT, 'temperaturaEGT'),
          presionCombustible_B1: generateThresholdData(jsonData.bancos.B1.presionCombustible, 'presionCombustible'),
          presionTurbo_B1: generateThresholdData(jsonData.bancos.B1.presionTurbo, 'presionTurbo'),
          lambda_B1: generateThresholdData(jsonData.bancos.B1.lambda, 'lambda'),
          tiempoInyeccionMs_B1: generateThresholdData(jsonData.bancos.B1.tiempoInyeccionMs, 'tiempoInyeccionMs'),
          tiempoEncendidoAvance_B1: generateThresholdData(jsonData.bancos.B1.tiempoEncendidoAvance, 'tiempoEncendidoAvance'),
        };
        
        setChartData(newChartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido al obtener datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const interval = setInterval(fetchData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchHistoricalData = async () => {
    try {
      setLoadingHistorical(true);
      const response = await fetch("https://46ou4qrae1.execute-api.us-east-1.amazonaws.com/prod/history?hours=500000");
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos históricos: ${response.status}`);
      }
      
      const historicalJsonData = await response.json();
      setHistoricalData(historicalJsonData);
      
      if (data) {
        const stats: Record<string, HistoricalStats> = {};
        
        Object.entries(fieldMapping).forEach(([currentField, historicalField]) => {
          const currentValue = data.motor[currentField as keyof typeof data.motor] as number;
          stats[currentField] = calculateStats(historicalJsonData, historicalField, currentValue);
        });
        
        setHistoricalStats(stats);
      }
    } catch (err) {
      console.error("Error fetching historical data:", err);
    } finally {
      setLoadingHistorical(false);
    }
  };

  const renderHistoricalComparison = () => {
    if (!historicalData.length) return null;

    const comparisonData = Object.entries(fieldMapping).map(([currentField, historicalField]) => {
      const stats = historicalStats[currentField];
      if (!stats) return null;

      return {
        metric: currentField,
        current: stats.current,
        average: stats.avg,
        min: stats.min,
        max: stats.max
      };
    }).filter(Boolean);

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Comparación Histórica</CardTitle>
          <CardDescription>
            Comparación de valores actuales vs históricos
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="metric" 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                labelStyle={{ color: "#9ca3af" }}
                itemStyle={{ color: "#f3f4f6" }}
              />
              <Bar dataKey="current" name="Actual" fill="#3b82f6" />
              <Bar dataKey="average" name="Promedio" fill="#10b981" />
              <Bar dataKey="min" name="Mínimo" fill="#f59e0b" />
              <Bar dataKey="max" name="Máximo" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold">Cargando datos del motor...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-6 w-6" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los datos: {error}
          </AlertDescription>
        </Alert>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-500">Áreas Operativas del Motor</h1>
          <button
            onClick={fetchHistoricalData}
            disabled={loadingHistorical}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loadingHistorical ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            <span>{loadingHistorical ? "Cargando..." : "Cargar Históricos"}</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-gray-500">
            Última actualización: {new Date(data.timestamp).toLocaleString()}
          </p>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${data.motor.modoOperacion === "Freno motor" ? "bg-blue-500" : "bg-green-500"}`}></div>
            <p className="text-gray-500">Estado: {data.motor.modoOperacion}</p>
          </div>
        </div>

        {/* KPI Gauges Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GaugeChart
            title="RPM"
            value={data.motor.rpm}
            max={thresholds.rpm.max}
            unit="rpm"
            alertLevel={getAlertLevel(data.motor.rpm, "rpm")}
          />
          <GaugeChart
            title="Temperatura Agua"
            value={data.motor.temperaturaAgua}
            max={thresholds.temperaturaAgua.max}
            unit="°C"
            alertLevel={getAlertLevel(data.motor.temperaturaAgua, "temperaturaAgua")}
          />
          <GaugeChart
            title="Voltaje Batería"
            value={data.motor.voltajeBateria}
            max={thresholds.voltajeBateria.max}
            unit="V"
            alertLevel={getAlertLevel(data.motor.voltajeBateria, "voltajeBateria")}
          />
          <GaugeChart
            title="Presión Aceite"
            value={data.motor.presionAceite}
            max={thresholds.presionAceite.max}
            unit="bar"
            alertLevel={getAlertLevel(data.motor.presionAceite, "presionAceite")}
          />
        </div>

        {historicalData.length > 0 && (
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertTitle>Datos Históricos Cargados</AlertTitle>
            <AlertDescription>
              Se han cargado {historicalData.length} registros históricos para comparación.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="motor" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="motor">Motor</TabsTrigger>
            <TabsTrigger value="bancoA">Banco A1</TabsTrigger>
            <TabsTrigger value="bancoB">Banco B1</TabsTrigger>
            <TabsTrigger value="comparison">Comparación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="motor" className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ThresholdChart
                title="RPM"
                value={data.motor.rpm}
                unit="rpm"
                metric="rpm"
                icon={<Gauge className="h-5 w-5" />}
                chartKey="rpm"
                chartData={chartData.rpm}
                stats={historicalStats.rpm}
              />
              <ThresholdChart
                title="Temperatura Agua"
                value={data.motor.temperaturaAgua}
                unit="°C"
                metric="temperaturaAgua"
                icon={<Thermometer className="h-5 w-5" />}
                chartKey="temperaturaAgua"
                chartData={chartData.temperaturaAgua}
                stats={historicalStats.temperaturaAgua}
              />
              <ThresholdChart
                title="Temperatura Aceite"
                value={data.motor.temperaturaAceite}
                unit="°C"
                metric="temperaturaAceite"
                icon={<Thermometer className="h-5 w-5" />}
                chartKey="temperaturaAceite"
                chartData={chartData.temperaturaAceite}
                stats={historicalStats.temperaturaAceite}
              />
              <ThresholdChart
                title="Presión Aceite"
                value={data.motor.presionAceite}
                unit="bar"
                metric="presionAceite"
                icon={<Droplets className="h-5 w-5" />}
                chartKey="presionAceite"
                chartData={chartData.presionAceite}
                stats={historicalStats.presionAceite}
              />
              <ThresholdChart
                title="Voltaje Batería"
                value={data.motor.voltajeBateria}
                unit="V"
                metric="voltajeBateria"
                icon={<BatteryCharging className="h-5 w-5" />}
                chartKey="voltajeBateria"
                chartData={chartData.voltajeBateria}
                stats={historicalStats.voltajeBateria}
              />
              <ThresholdChart
                title="Consumo Combustible"
                value={data.motor.consumoCombustibleLh}
                unit="L/h"
                metric="consumoCombustibleLh"
                icon={<Fuel className="h-5 w-5" />}
                chartKey="consumoCombustibleLh"
                chartData={chartData.consumoCombustibleLh}
                stats={historicalStats.consumoCombustibleLh}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Adicional del Motor</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Carga Motor</p>
                    <p className="text-lg font-bold">{data.motor.cargaMotor}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Velocidad Vehículo</p>
                    <p className="text-lg font-bold">{data.motor.velocidadVehiculo} km/h</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tiempo Encendido</p>
                    <p className="text-lg font-bold">{data.motor.tiempoEncendidoMin} min</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Relación Transmisión</p>
                    <p className="text-lg font-bold">{data.motor.relacionTransmision}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Operativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={Object.entries(historicalStats).map(([metric, stats]) => ({
                        metric,
                        current: stats.current,
                        average: stats.avg
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="metric" 
                          stroke="#9ca3af"
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={40}
                        />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                          labelStyle={{ color: "#9ca3af" }}
                          itemStyle={{ color: "#f3f4f6" }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="current" 
                          name="Actual" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          dot={{ r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="average" 
                          name="Promedio" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bancoA" className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ThresholdChart
                title="Lambda A1"
                value={data.bancos.A1.lambda}
                unit=""
                metric="lambda"
                icon={<Thermometer className="h-5 w-5" />}
                chartKey="lambda_A1"
                chartData={chartData.lambda_A1}
              />
              <ThresholdChart
                title="Tiempo Inyección A1"
                value={data.bancos.A1.tiempoInyeccionMs}
                unit="ms"
                metric="tiempoInyeccionMs"
                icon={<Gauge className="h-5 w-5" />}
                chartKey="tiempoInyeccionMs_A1"
                chartData={chartData.tiempoInyeccionMs_A1}
              />
              <ThresholdChart
                title="Avance Encendido A1"
                value={data.bancos.A1.tiempoEncendidoAvance}
                unit="°"
                metric="tiempoEncendidoAvance"
                icon={<Gauge className="h-5 w-5" />}
                chartKey="tiempoEncendidoAvance_A1"
                chartData={chartData.tiempoEncendidoAvance_A1}
              />
              <ThresholdChart
                title="Temperatura EGT A1"
                value={data.bancos.A1.temperaturaEGT}
                unit="°C"
                metric="temperaturaEGT"
                icon={<Thermometer className="h-5 w-5" />}
                chartKey="temperaturaEGT_A1"
                chartData={chartData.temperaturaEGT_A1}
              />
              <ThresholdChart
                title="Presión Combustible A1"
                value={data.bancos.A1.presionCombustible}
                unit="bar"
                metric="presionCombustible"
                icon={<Droplets className="h-5 w-5" />}
                chartKey="presionCombustible_A1"
                chartData={chartData.presionCombustible_A1}
              />
              <ThresholdChart
                title="Presión Turbo A1"
                value={data.bancos.A1.presionTurbo}
                unit="bar"
                metric="presionTurbo"
                icon={<Gauge className="h-5 w-5" />}
                chartKey="presionTurbo_A1"
                chartData={chartData.presionTurbo_A1}
              />
            </div>
          </TabsContent>

          <TabsContent value="bancoB" className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ThresholdChart
                title="Lambda B1"
                value={data.bancos.B1.lambda}
                unit=""
                metric="lambda"
                icon={<Thermometer className="h-5 w-5" />}
                chartKey="lambda_B1"
                chartData={chartData.lambda_B1}
              />
              <ThresholdChart
                title="Tiempo Inyección B1"
                value={data.bancos.B1.tiempoInyeccionMs}
                unit="ms"
                metric="tiempoInyeccionMs"
                icon={<Gauge className="h-5 w-5" />}
                chartKey="tiempoInyeccionMs_B1"
                chartData={chartData.tiempoInyeccionMs_B1}
              />
              <ThresholdChart
                title="Avance Encendido B1"
                value={data.bancos.B1.tiempoEncendidoAvance}
                unit="°"
                metric="tiempoEncendidoAvance"
                icon={<Gauge className="h-5 w-5" />}
                chartKey="tiempoEncendidoAvance_B1"
                chartData={chartData.tiempoEncendidoAvance_B1}
              />
              <ThresholdChart
                title="Temperatura EGT B1"
                value={data.bancos.B1.temperaturaEGT}
                unit="°C"
                metric="temperaturaEGT"
                icon={<Thermometer className="h-5 w-5" />}
                chartKey="temperaturaEGT_B1"
                chartData={chartData.temperaturaEGT_B1}
              />
              <ThresholdChart
                title="Presión Combustible B1"
                value={data.bancos.B1.presionCombustible}
                unit="bar"
                metric="presionCombustible"
                icon={<Droplets className="h-5 w-5" />}
                chartKey="presionCombustible_B1"
                chartData={chartData.presionCombustible_B1}
              />
              <ThresholdChart
                title="Presión Turbo B1"
                value={data.bancos.B1.presionTurbo}
                unit="bar"
                metric="presionTurbo"
                icon={<Gauge className="h-5 w-5" />}
                chartKey="presionTurbo_B1"
                chartData={chartData.presionTurbo_B1}
              />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="p-1">
            {renderHistoricalComparison()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Alertas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries({
                      rpm: "RPM",
                      temperaturaAgua: "Temperatura Agua",
                      temperaturaAceite: "Temperatura Aceite",
                      presionAceite: "Presión Aceite",
                      voltajeBateria: "Voltaje Batería",
                      consumoCombustibleLh: "Consumo Combustible",
                      lambda_A1: "Lambda Banco A1",
                      lambda_B1: "Lambda Banco B1",
                      temperaturaEGT_A1: "EGT Banco A1",
                      temperaturaEGT_B1: "EGT Banco B1"
                    }).map(([metric, name]) => {
                      const value = metric.includes('_') 
                        ? metric.split('_')[0] === 'lambda' 
                          ? data.bancos[metric.split('_')[1] as 'A1'|'B1'].lambda
                          : data.bancos[metric.split('_')[1] as 'A1'|'B1'][metric.split('_')[0] as keyof typeof data.bancos.A1]
                        : data.motor[metric as keyof typeof data.motor];
                      
                      const alertLevel = getAlertLevel(value as number, metric.split('_')[0] as keyof typeof thresholds);
                      const colorClass = getColorClass(alertLevel);
                      
                      return (
                        <div key={metric} className="flex items-center justify-between">
                          <span>{name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${colorClass}`}>
                              {value} {metric === 'rpm' ? 'rpm' : 
                                metric.includes('temperatura') ? '°C' : 
                                metric.includes('presion') ? 'bar' : 
                                metric === 'voltajeBateria' ? 'V' : 
                                metric === 'consumoCombustibleLh' ? 'L/h' : ''}
                            </span>
                            <div className={`w-3 h-3 rounded-full ${colorClass.replace('text', 'bg')}`}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tendencias Históricas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(historicalStats).map(([metric, stats]) => ({
                        metric,
                        current: stats.current,
                        average: stats.avg,
                        min: stats.min,
                        max: stats.max
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="metric" 
                          stroke="#9ca3af"
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={40}
                        />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                          labelStyle={{ color: "#9ca3af" }}
                          itemStyle={{ color: "#f3f4f6" }}
                        />
                        <Bar dataKey="current" name="Actual" fill="#3b82f6" />
                        <Bar dataKey="average" name="Promedio" fill="#10b981" />
                        <Bar dataKey="min" name="Mínimo" fill="#f59e0b" />
                        <Bar dataKey="max" name="Máximo" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}