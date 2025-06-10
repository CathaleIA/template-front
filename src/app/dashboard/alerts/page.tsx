"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Thermometer, Gauge, Droplets, BatteryCharging, Fuel, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, ComposedChart, ReferenceLine } from "recharts";

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

// Define thresholds for each metric with operational zones
const thresholds = {
  temperaturaAgua: { 
    min: 0, 
    normal: 105, 
    warning: 120, 
    danger: 170, 
    max: 200 
  },
  temperaturaAceite: { 
    min: 0, 
    normal: 90, 
    warning: 110, 
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
    normal: 6000, 
    warning: 6500, 
    danger: 7000, 
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

// Map historical data fields to current data fields
const fieldMapping = {
  rpm: 'revoluciones',
  temperaturaAgua: 'temperatura',
  voltajeBateria: 'voltaje',
  consumoCombustibleLh: 'consumoCombustible',
  presionAceite: 'presionAceite'
};

// Function to determine alert level
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

// Get color class based on alert level
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

// Calculate historical statistics
const calculateStats = (historicalData: HistoricalDataPoint[], field: string, currentValue: number): HistoricalStats => {
  const values = historicalData.map(item => item[field as keyof HistoricalDataPoint] as number).filter(val => typeof val === 'number' && !isNaN(val));
  
  if (values.length === 0) {
    return { avg: currentValue, min: currentValue, max: currentValue, current: currentValue, trend: 'stable' };
  }

  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculate trend based on recent values vs average
  const recentValues = values.slice(-10); // Last 10 readings
  const recentAvg = recentValues.length > 0 ? recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length : avg;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  const trendThreshold = avg * 0.05; // 5% threshold
  
  if (recentAvg > avg + trendThreshold) trend = 'up';
  else if (recentAvg < avg - trendThreshold) trend = 'down';
  
  return { avg: Number(avg.toFixed(2)), min, max, current: currentValue, trend };
};

// Generate threshold chart data
const generateThresholdData = (currentValue: number, metric: keyof typeof thresholds, count = 15) => {
  const limits = thresholds[metric];
  const result = [];
  let baseValue = currentValue;
  
  for (let i = 0; i < count; i++) {
    // Add some variation to simulate real data
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
        
        // Generate threshold chart data for various metrics
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
    
    // Set up interval to refresh data every 30 seconds
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
      
      // Calculate statistics for each metric if we have current data
      if (data) {
        const stats: Record<string, HistoricalStats> = {};
        
        // Calculate stats for mapped fields
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

  // Custom Tooltip for threshold charts
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

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold">Cargando datos del motor...</h2>
      </div>
    );
  }

  // Render error state
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

  // Render data
  if (!data) return null;

  // Function to render trend icon
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

  // Function to render threshold chart
  const renderThresholdChart = (
    title: string, 
    value: number, 
    unit: string, 
    metric: keyof typeof thresholds,
    icon: React.ReactNode,
    chartKey: string
  ) => {
    const alertLevel = getAlertLevel(value, metric);
    const colorClass = getColorClass(alertLevel);
    const stats = historicalStats[metric];
    const data = chartData[chartKey] || [];
    const limits = thresholds[metric];
    
    // Determine if it's a "lower is better" metric
    const isLowerBetter = metric === "voltajeBateria" || metric === "presionAceite" || metric === "presionCombustible";
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={colorClass}>{icon}</div>
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
              <ComposedChart data={data}>
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
                
                {/* Área de peligro */}
                <Area 
                  type="monotone" 
                  dataKey={() => limits.max}
                  fill="rgba(239, 68, 68, 0.2)" 
                  stroke="none"
                />
                
                {/* Líneas de referencia para zonas operativas */}
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
                
                {/* Línea de datos actual */}
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
            {alertLevel === "normal" && "Estado: Área operativa normal"}
            {alertLevel === "warning" && "¡Atención! Área de advertencia"}
            {alertLevel === "danger" && "¡ALERTA! Área de peligro"}
          </CardDescription>
        </CardContent>
      </Card>
    );
  };

  // Function to render historical comparison chart
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
              {renderThresholdChart("RPM", data.motor.rpm, "rpm", "rpm", <Gauge className="h-5 w-5" />, "rpm")}
              {renderThresholdChart("Temperatura Agua", data.motor.temperaturaAgua, "°C", "temperaturaAgua", <Thermometer className="h-5 w-5" />, "temperaturaAgua")}
              {renderThresholdChart("Temperatura Aceite", data.motor.temperaturaAceite, "°C", "temperaturaAceite", <Thermometer className="h-5 w-5" />, "temperaturaAceite")}
              {renderThresholdChart("Presión Aceite", data.motor.presionAceite, "bar", "presionAceite", <Droplets className="h-5 w-5" />, "presionAceite")}
              {renderThresholdChart("Voltaje Batería", data.motor.voltajeBateria, "V", "voltajeBateria", <BatteryCharging className="h-5 w-5" />, "voltajeBateria")}
              {renderThresholdChart("Consumo Combustible", data.motor.consumoCombustibleLh, "L/h", "consumoCombustibleLh", <Fuel className="h-5 w-5" />, "consumoCombustibleLh")}
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
              {renderThresholdChart("Lambda A1", data.bancos.A1.lambda, "", "lambda", <Thermometer className="h-5 w-5" />, "lambda_A1")}
              {renderThresholdChart("Tiempo Inyección A1", data.bancos.A1.tiempoInyeccionMs, "ms", "tiempoInyeccionMs", <Gauge className="h-5 w-5" />, "tiempoInyeccionMs_A1")}
              {renderThresholdChart("Avance Encendido A1", data.bancos.A1.tiempoEncendidoAvance, "°", "tiempoEncendidoAvance", <Gauge className="h-5 w-5" />, "tiempoEncendidoAvance_A1")}
              {renderThresholdChart("Temperatura EGT A1", data.bancos.A1.temperaturaEGT, "°C", "temperaturaEGT", <Thermometer className="h-5 w-5" />, "temperaturaEGT_A1")}
              {renderThresholdChart("Presión Combustible A1", data.bancos.A1.presionCombustible, "bar", "presionCombustible", <Droplets className="h-5 w-5" />, "presionCombustible_A1")}
              {renderThresholdChart("Presión Turbo A1", data.bancos.A1.presionTurbo, "bar", "presionTurbo", <Gauge className="h-5 w-5" />, "presionTurbo_A1")}
            </div>
          </TabsContent>

          <TabsContent value="bancoB" className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderThresholdChart("Lambda B1", data.bancos.B1.lambda, "", "lambda", <Thermometer className="h-5 w-5" />, "lambda_B1")}
              {renderThresholdChart("Tiempo Inyección B1", data.bancos.B1.tiempoInyeccionMs, "ms", "tiempoInyeccionMs", <Gauge className="h-5 w-5" />, "tiempoInyeccionMs_B1")}
              {renderThresholdChart("Avance Encendido B1", data.bancos.B1.tiempoEncendidoAvance, "°", "tiempoEncendidoAvance", <Gauge className="h-5 w-5" />, "tiempoEncendidoAvance_B1")}
              {renderThresholdChart("Temperatura EGT B1", data.bancos.B1.temperaturaEGT, "°C", "temperaturaEGT", <Thermometer className="h-5 w-5" />, "temperaturaEGT_B1")}
              {renderThresholdChart("Presión Combustible B1", data.bancos.B1.presionCombustible, "bar", "presionCombustible", <Droplets className="h-5 w-5" />, "presionCombustible_B1")}
              {renderThresholdChart("Presión Turbo B1", data.bancos.B1.presionTurbo, "bar", "presionTurbo", <Gauge className="h-5 w-5" />, "presionTurbo_B1")}
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