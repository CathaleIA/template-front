"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Thermometer, Gauge, Droplets, BatteryCharging, Fuel } from "lucide-react";
// Importar los componentes UI directamente si no están disponibles
// Si usas ShadCN, asegúrate de haber ejecutado los comandos de instalación para cada componente
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

// Define thresholds for each metric
const thresholds = {
  temperaturaAgua: { normal: 105, warning: 120, danger: 170 },
  temperaturaAceite: { normal: 90, warning: 110, danger: 130 },
  presionAceite: { normal: 2, warning: 1.5, danger: 1 },
  rpm: { normal: 6000, warning: 6500, danger: 7000 },
  voltajeBateria: { normal: 12, warning: 11.5, danger: 11 },
  consumoCombustibleLh: { normal: 10, warning: 15, danger: 20 },
  cargaMotor: { normal: 80, warning: 90, danger: 95 },
  temperaturaEGT: { normal: 450, warning: 550, danger: 650 },
  presionCombustible: { normal: 3, warning: 2.5, danger: 2 },
  presionTurbo: { normal: 1.8, warning: 2.2, danger: 2.5 },
  lambda: { normal: 1, warning: 1.2, danger: 1.5 },
  tiempoInyeccionMs: { normal: 5, warning: 8, danger: 10 },
  tiempoEncendidoAvance: { normal: 20, warning: 30, danger: 40 },
};

// Function to determine alert level
const getAlertLevel = (value: number, metric: keyof typeof thresholds): AlertLevel => {
  const limits = thresholds[metric];
  
  // Custom logic for each metric type (some are higher-is-better, some are lower-is-better)
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

// Generate historical chart data for demo
const generateHistoricalData = (currentValue: number, count = 15) => {
  const result = [];
  let baseValue = currentValue - (Math.random() * currentValue * 0.3);
  
  for (let i = 0; i < count; i++) {
    baseValue += (Math.random() - 0.5) * (currentValue * 0.1);
    result.push({
      time: `${14 - i}m ago`,
      value: parseFloat(baseValue.toFixed(2))
    });
  }
  
  return result.reverse();
};

export default function AlertsPage() {
  const [data, setData] = useState<MotorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<Record<string, any[]>>({});

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
        
        // Generate chart data for various metrics
        const newChartData: Record<string, any[]> = {
          temperaturaAgua: generateHistoricalData(jsonData.motor.temperaturaAgua),
          temperaturaAceite: generateHistoricalData(jsonData.motor.temperaturaAceite),
          rpm: generateHistoricalData(jsonData.motor.rpm),
          presionAceite: generateHistoricalData(jsonData.motor.presionAceite),
          voltajeBateria: generateHistoricalData(jsonData.motor.voltajeBateria),
          consumoCombustibleLh: generateHistoricalData(jsonData.motor.consumoCombustibleLh),
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
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Function to render a KPI card
  const renderKpiCard = (
    title: string, 
    value: number, 
    unit: string, 
    metric: keyof typeof thresholds,
    icon: React.ReactNode
  ) => {
    const alertLevel = getAlertLevel(value, metric);
    const colorClass = getColorClass(alertLevel);
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={colorClass}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={colorClass}>{value}</span> {unit}
          </div>
          
          <div className="mt-4 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData[metric] || []}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={
                    alertLevel === "normal" ? "#10b981" : 
                    alertLevel === "warning" ? "#f59e0b" : 
                    "#ef4444"
                  } 
                  strokeWidth={2} 
                  dot={false}
                />
                <Tooltip 
                  contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                  labelStyle={{ color: "#9ca3af" }}
                  itemStyle={{ color: "#f3f4f6" }}
                  formatter={(value: any) => [`${value} ${unit}`, ""]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <CardDescription className="pt-2">
            {alertLevel === "normal" && "Estado: Normal"}
            {alertLevel === "warning" && "¡Atención! Valor elevado"}
            {alertLevel === "danger" && "¡ALERTA! Nivel crítico"}
          </CardDescription>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-gray-500">Detección de alarmas del motor</h1>
        
        <div className="flex items-center justify-between">
          <p className=" text-gray-500 ">
            Última actualización: {new Date(data.timestamp).toLocaleString()}
          </p>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${data.motor.modoOperacion === "Freno motor" ? "bg-blue-500" : "bg-green-500"}`}></div>
            <p className = "text-gray-500">Estado: {data.motor.modoOperacion}</p>
          </div>
        </div>

        <Tabs defaultValue="motor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="motor">Motor</TabsTrigger>
            <TabsTrigger value="bancoA">Banco A1</TabsTrigger>
            <TabsTrigger value="bancoB">Banco B1</TabsTrigger>
          </TabsList>
          
          <TabsContent value="motor" className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderKpiCard("RPM", data.motor.rpm, "rpm", "rpm", <Gauge className="h-5 w-5" />)}
              {renderKpiCard("Temperatura Agua", data.motor.temperaturaAgua, "°C", "temperaturaAgua", <Thermometer className="h-5 w-5" />)}
              {renderKpiCard("Temperatura Aceite", data.motor.temperaturaAceite, "°C", "temperaturaAceite", <Thermometer className="h-5 w-5" />)}
              {renderKpiCard("Presión Aceite", data.motor.presionAceite, "bar", "presionAceite", <Droplets className="h-5 w-5" />)}
              {renderKpiCard("Voltaje Batería", data.motor.voltajeBateria, "V", "voltajeBateria", <BatteryCharging className="h-5 w-5" />)}
              {renderKpiCard("Consumo Combustible", data.motor.consumoCombustibleLh, "L/h", "consumoCombustibleLh", <Fuel className="h-5 w-5" />)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Adicional</CardTitle>
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
                  <CardTitle>Tendencia RPM vs Temperatura</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.rpm?.map((item, index) => ({
                      ...item,
                      temp: chartData.temperaturaAgua?.[index]?.value || 0
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis yAxisId="left" stroke="#10b981" />
                      <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                      <Tooltip 
                        contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                        labelStyle={{ color: "#9ca3af" }}
                        itemStyle={{ color: "#f3f4f6" }}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="value" 
                        name="RPM" 
                        stroke="#10b981" 
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="temp" 
                        name="Temp. Agua" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="bancoA" className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lambda</CardTitle>
                  <div className="text-green-500"><Gauge className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className="text-green-500">{data.bancos.A1.lambda}</span>
                  </div>
                  <div className="mt-4 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateHistoricalData(data.bancos.A1.lambda)}>
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Tooltip 
                          contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                          labelStyle={{ color: "#9ca3af" }}
                          itemStyle={{ color: "#f3f4f6" }}
                          formatter={(value: any) => [`${value}`, ""]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <CardDescription className="pt-2">Estado: Normal</CardDescription>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Inyección</CardTitle>
                  <div className="text-green-500"><Gauge className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className="text-green-500">{data.bancos.A1.tiempoInyeccionMs}</span> ms
                  </div>
                  <div className="mt-4 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateHistoricalData(data.bancos.A1.tiempoInyeccionMs)}>
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Tooltip 
                          contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                          labelStyle={{ color: "#9ca3af" }}
                          itemStyle={{ color: "#f3f4f6" }}
                          formatter={(value: any) => [`${value} ms`, ""]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <CardDescription className="pt-2">Estado: Normal</CardDescription>
                </CardContent>
              </Card>
              {renderKpiCard("Temperatura EGT", data.bancos.A1.temperaturaEGT, "°C", "temperaturaEGT", <Thermometer className="h-5 w-5" />)}
              {renderKpiCard("Presión Combustible", data.bancos.A1.presionCombustible, "bar", "presionCombustible", <Gauge className="h-5 w-5" />)}
              {renderKpiCard("Presión Turbo", data.bancos.A1.presionTurbo, "bar", "presionTurbo", <Gauge className="h-5 w-5" />)}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Encendido</CardTitle>
                  <div className="text-green-500"><Gauge className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className="text-green-500">{data.bancos.A1.tiempoEncendidoAvance}</span> °
                  </div>
                  <div className="mt-4 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateHistoricalData(data.bancos.A1.tiempoEncendidoAvance)}>
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Tooltip 
                          contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                          labelStyle={{ color: "#9ca3af" }}
                          itemStyle={{ color: "#f3f4f6" }}
                          formatter={(value: any) => [`${value} °`, ""]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <CardDescription className="pt-2">Estado: Normal</CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="bancoB" className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lambda</CardTitle>
                  <div className="text-green-500"><Gauge className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className="text-green-500">{data.bancos.B1.lambda}</span>
                  </div>
                  <div className="mt-4 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateHistoricalData(data.bancos.B1.lambda)}>
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Tooltip 
                          contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                          labelStyle={{ color: "#9ca3af" }}
                          itemStyle={{ color: "#f3f4f6" }}
                          formatter={(value: any) => [`${value}`, ""]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <CardDescription className="pt-2">Estado: Normal</CardDescription>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Inyección</CardTitle>
                  <div className="text-green-500"><Gauge className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className="text-green-500">{data.bancos.B1.tiempoInyeccionMs}</span> ms
                  </div>
                  <div className="mt-4 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateHistoricalData(data.bancos.B1.tiempoInyeccionMs)}>
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Tooltip 
                          contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                          labelStyle={{ color: "#9ca3af" }}
                          itemStyle={{ color: "#f3f4f6" }}
                          formatter={(value: any) => [`${value} ms`, ""]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <CardDescription className="pt-2">Estado: Normal</CardDescription>
                </CardContent>
              </Card>
              {renderKpiCard("Temperatura EGT", data.bancos.B1.temperaturaEGT, "°C", "temperaturaEGT", <Thermometer className="h-5 w-5" />)}
              {renderKpiCard("Presión Combustible", data.bancos.B1.presionCombustible, "bar", "presionCombustible", <Gauge className="h-5 w-5" />)}
              {renderKpiCard("Presión Turbo", data.bancos.B1.presionTurbo, "bar", "presionTurbo", <Gauge className="h-5 w-5" />)}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Encendido</CardTitle>
                  <div className="text-green-500"><Gauge className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className="text-green-500">{data.bancos.B1.tiempoEncendidoAvance}</span> °
                  </div>
                  <div className="mt-4 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateHistoricalData(data.bancos.B1.tiempoEncendidoAvance)}>
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Tooltip 
                          contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                          labelStyle={{ color: "#9ca3af" }}
                          itemStyle={{ color: "#f3f4f6" }}
                          formatter={(value: any) => [`${value} °`, ""]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <CardDescription className="pt-2">Estado: Normal</CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Estado del Sistema</h2>
          <Alert variant={
            Object.keys(data.motor).some(key => 
              key in thresholds && 
              getAlertLevel(data.motor[key as keyof typeof data.motor] as number, key as keyof typeof thresholds) === "danger"
            ) ? "destructive" : "default"
          }>
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Estado General</AlertTitle>
            <AlertDescription>
              {Object.keys(data.motor).some(key => 
                key in thresholds && 
                getAlertLevel(data.motor[key as keyof typeof data.motor] as number, key as keyof typeof thresholds) === "danger"
              ) 
                ? "¡Se detectaron valores críticos! Se requiere atención inmediata."
                : Object.keys(data.motor).some(key => 
                    key in thresholds && 
                    getAlertLevel(data.motor[key as keyof typeof data.motor] as number, key as keyof typeof thresholds) === "warning"
                  )
                    ? "Se detectaron valores elevados. Monitorear con atención."
                    : "Todos los sistemas operando dentro de parámetros normales."
              }
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}