'use client';

import React, { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Thermometer, Gauge, Droplets, BatteryCharging, Fuel, Activity, Timer, Zap, TrendingUp, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, RadialBarChart, RadialBar, Cell } from "recharts";

// Types based on actual API response
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

type AlertLevel = "normal" | "warning" | "danger";

// Compact KPI Card with Radial Gauge
const CompactKPICard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  alertLevel, 
  max,
  type = 'radial'
}: {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  alertLevel: AlertLevel;
  max?: number;
  type?: 'radial' | 'simple';
}) => {
  const getColor = (level: AlertLevel) => {
    switch (level) {
      case "normal": return "#10b981";
      case "warning": return "#f59e0b";
      case "danger": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const color = getColor(alertLevel);
  const percentage = max ? (value / max) * 100 : 0;

  const data = [
    {
      name: title,
      value: percentage,
      fill: color,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-600 truncate">{title}</h3>
        <div style={{ color }} className="flex-shrink-0">{icon}</div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-lg font-bold" style={{ color }}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </div>
          <div className="text-xs text-gray-500">{unit}</div>
        </div>
        
        {type === 'radial' && max && (
          <div className="w-12 h-12 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={data}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={color}
                  background={{ fill: '#f3f4f6' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      <div className={`mt-2 h-0.5 rounded-full`} style={{ backgroundColor: color }}></div>
    </div>
  );
};

// Compact Chart Component
const CompactChart = ({ 
  title, 
  data, 
  color, 
  type = 'line',
  thresholds 
}: {
  title: string;
  data: any[];
  color: string;
  type?: 'line' | 'area';
  thresholds?: { warning?: number; danger?: number };
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              {thresholds?.warning && (
                <ReferenceLine y={thresholds.warning} stroke="#f59e0b" strokeDasharray="3 3" />
              )}
              {thresholds?.danger && (
                <ReferenceLine y={thresholds.danger} stroke="#ef4444" strokeDasharray="3 3" />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.1}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              {thresholds?.warning && (
                <ReferenceLine y={thresholds.warning} stroke="#f59e0b" strokeDasharray="3 3" />
              )}
              {thresholds?.danger && (
                <ReferenceLine y={thresholds.danger} stroke="#ef4444" strokeDasharray="3 3" />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Thresholds based on your existing values
const thresholds = {
  temperaturaAgua: { warning: 80, danger: 100, max: 120 },
  temperaturaAceite: { warning: 90, danger: 110, max: 130 },
  presionAceite: { warning: 3, danger: 2, max: 10 }, // Lower is worse
  rpm: { warning: 4000, danger: 5000, max: 6000 },
  voltajeBateria: { warning: 11, danger: 10, max: 15 }, // Lower is worse
  cargaMotor: { warning: 80, danger: 95, max: 100 },
  temperaturaEGT: { warning: 650, danger: 750, max: 900 },
  presionTurbo: { warning: 2, danger: 2.5, max: 3 },

  // Agregado:
  velocidadVehiculo: { warning: 100, danger: 110, max: 120 },
};

const getAlertLevel = (value: number, metric: keyof typeof thresholds): AlertLevel => {
  const limits = thresholds[metric];
  
  // Special case for pressure (lower is worse)
  if (metric === "presionAceite") {
    if (value < limits.danger) return "danger";
    if (value < limits.warning) return "warning";
    return "normal";
  }
  
  // Special case for battery voltage
  if (metric === "voltajeBateria") {
    if (value < limits.danger) return "danger";
    if (value < limits.warning) return "warning";
    return "normal";
  }
  
  // Standard case (higher is worse)
  if (value > limits.danger) return "danger";
  if (value > limits.warning) return "warning";
  return "normal";
};

// Mock API function - replace with your actual API call
const fetchMotorData = async (): Promise<MotorData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data based on your API structure
  return {
    timestamp: "2025-07-01T10:27:08.361Z",
    motor: {
      rpm: 4892,
      temperaturaAgua: 90.74,
      temperaturaAceite: 92.02,
      presionAceite: 4.67,
      voltajeBateria: 12.08,
      consumoCombustibleLh: 6.82,
      cargaMotor: 30.18,
      tiempoEncendidoMin: 10.92,
      velocidadVehiculo: 85.95,
      relacionTransmision: "3ra",
      modoOperacion: "Aceleración"
    },
    bancos: {
      A1: {
        lambda: 1.02,
        tiempoInyeccionMs: 2.39,
        tiempoEncendidoAvance: 2.94,
        temperaturaEGT: 718.76,
        presionCombustible: 2.36,
        presionTurbo: 1.34
      },
      B1: {
        lambda: 0.99,
        tiempoInyeccionMs: 2.21,
        tiempoEncendidoAvance: 0.25,
        temperaturaEGT: 479.96,
        presionCombustible: 3.81,
        presionTurbo: 1.11
      }
    }
  };
};

// Generate mock historical data
const generateMockHistoricalData = (baseValue: number, variance: number = 10) => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const value = baseValue + (Math.random() - 0.5) * variance * 2;
    data.push({
      time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, value)
    });
  }
  
  return data;
};

export default function CompactMotorDashboard() {
  const [data, setData] = useState<MotorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const motorData = await fetchMotorData();
        setData(motorData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Cargando datos del motor...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-6 w-6" />
          <AlertTitle>Error de Conexión</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Monitor de Maquinaria</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Modo: {data.motor.modoOperacion}</span>
                <span>Transmisión: {data.motor.relacionTransmision}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Última actualización: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-6">
        {/* Primary Motor Metrics */}
        <section>
          <h2 className="text-md font-semibold text-gray-800 mb-3">Parámetros Principales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <CompactKPICard
              title="RPM"
              value={data.motor.rpm}
              unit="rpm"
              icon={<Gauge className="h-4 w-4" />}
              alertLevel={getAlertLevel(data.motor.rpm, "rpm")}
              max={thresholds.rpm.max}
            />
            <CompactKPICard
              title="Temp. Agua"
              value={data.motor.temperaturaAgua}
              unit="°C"
              icon={<Thermometer className="h-4 w-4" />}
              alertLevel={getAlertLevel(data.motor.temperaturaAgua, "temperaturaAgua")}
              max={thresholds.temperaturaAgua.max}
            />
            <CompactKPICard
              title="Temp. Aceite"
              value={data.motor.temperaturaAceite}
              unit="°C"
              icon={<Thermometer className="h-4 w-4" />}
              alertLevel={getAlertLevel(data.motor.temperaturaAceite, "temperaturaAceite")}
              max={thresholds.temperaturaAceite.max}
            />
            <CompactKPICard
              title="Presión Aceite"
              value={data.motor.presionAceite}
              unit="bar"
              icon={<Droplets className="h-4 w-4" />}
              alertLevel={getAlertLevel(data.motor.presionAceite, "presionAceite")}
              max={thresholds.presionAceite.max}
            />
            <CompactKPICard
              title="Carga Motor"
              value={data.motor.cargaMotor}
              unit="%"
              icon={<Activity className="h-4 w-4" />}
              alertLevel={getAlertLevel(data.motor.cargaMotor, "cargaMotor")}
              max={thresholds.cargaMotor.max}
            />
            <CompactKPICard
              title="Velocidad"
              value={data.motor.velocidadVehiculo}
              unit="km/h"
              icon={<Zap className="h-4 w-4" />}
              alertLevel="normal"
              max={thresholds.velocidadVehiculo.max}
            />
          </div>
        </section>

        {/* Secondary Metrics */}
        <section>
          <h2 className="text-md font-semibold text-gray-800 mb-3">Parámetros Secundarios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <CompactKPICard
              title="Voltaje Batería"
              value={data.motor.voltajeBateria}
              unit="V"
              icon={<BatteryCharging className="h-4 w-4" />}
              alertLevel={getAlertLevel(data.motor.voltajeBateria, "voltajeBateria")}
              max={thresholds.voltajeBateria.max}
            />
            <CompactKPICard
              title="Consumo Combustible"
              value={data.motor.consumoCombustibleLh}
              unit="L/h"
              icon={<Fuel className="h-4 w-4" />}
              alertLevel="normal"
              type="simple"
            />
            <CompactKPICard
              title="Tiempo Encendido"
              value={data.motor.tiempoEncendidoMin}
              unit="hrs"
              icon={<Timer className="h-4 w-4" />}
              alertLevel="normal"
              type="simple"
            />
            <CompactKPICard
              title="Lambda A1"
              value={data.bancos.A1.lambda}
              unit=""
              icon={<Settings className="h-4 w-4" />}
              alertLevel="normal"
              type="simple"
            />
            <CompactKPICard
              title="Lambda B1"
              value={data.bancos.B1.lambda}
              unit=""
              icon={<Settings className="h-4 w-4" />}
              alertLevel="normal"
              type="simple"
            />
          </div>
        </section>

        {/* Bank Details */}
        <section>
          <h2 className="text-md font-semibold text-gray-800 mb-3">Detalles de Bancos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank A1 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Banco A1</h3>
              <div className="grid grid-cols-2 gap-3">
                <CompactKPICard
                  title="EGT"
                  value={data.bancos.A1.temperaturaEGT}
                  unit="°C"
                  icon={<Thermometer className="h-4 w-4" />}
                  alertLevel={getAlertLevel(data.bancos.A1.temperaturaEGT, "temperaturaEGT")}
                  max={thresholds.temperaturaEGT.max}
                />
                <CompactKPICard
                  title="Presión Turbo"
                  value={data.bancos.A1.presionTurbo}
                  unit="bar"
                  icon={<Gauge className="h-4 w-4" />}
                  alertLevel={getAlertLevel(data.bancos.A1.presionTurbo, "presionTurbo")}
                  max={thresholds.presionTurbo.max}
                />
                <CompactKPICard
                  title="Tiempo Inyección"
                  value={data.bancos.A1.tiempoInyeccionMs}
                  unit="ms"
                  icon={<Timer className="h-4 w-4" />}
                  alertLevel="normal"
                  type="simple"
                />
                <CompactKPICard
                  title="Presión Combustible"
                  value={data.bancos.A1.presionCombustible}
                  unit="bar"
                  icon={<Fuel className="h-4 w-4" />}
                  alertLevel="normal"
                  type="simple"
                />
              </div>
            </div>

            {/* Bank B1 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Banco B1</h3>
              <div className="grid grid-cols-2 gap-3">
                <CompactKPICard
                  title="EGT"
                  value={data.bancos.B1.temperaturaEGT}
                  unit="°C"
                  icon={<Thermometer className="h-4 w-4" />}
                  alertLevel={getAlertLevel(data.bancos.B1.temperaturaEGT, "temperaturaEGT")}
                  max={thresholds.temperaturaEGT.max}
                />
                <CompactKPICard
                  title="Presión Turbo"
                  value={data.bancos.B1.presionTurbo}
                  unit="bar"
                  icon={<Gauge className="h-4 w-4" />}
                  alertLevel={getAlertLevel(data.bancos.B1.presionTurbo, "presionTurbo")}
                  max={thresholds.presionTurbo.max}
                />
                <CompactKPICard
                  title="Tiempo Inyección"
                  value={data.bancos.B1.tiempoInyeccionMs}
                  unit="ms"
                  icon={<Timer className="h-4 w-4" />}
                  alertLevel="normal"
                  type="simple"
                />
                <CompactKPICard
                  title="Presión Combustible"
                  value={data.bancos.B1.presionCombustible}
                  unit="bar"
                  icon={<Fuel className="h-4 w-4" />}
                  alertLevel="normal"
                  type="simple"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Historical Charts */}
        <section>
          <h2 className="text-md font-semibold text-gray-800 mb-3">Tendencias (Últimas 24h)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CompactChart
              title="RPM"
              data={generateMockHistoricalData(data.motor.rpm, 200)}
              color="#3b82f6"
              thresholds={{ warning: thresholds.rpm.warning, danger: thresholds.rpm.danger }}
            />
            <CompactChart
              title="Temperatura Agua (°C)"
              data={generateMockHistoricalData(data.motor.temperaturaAgua, 5)}
              color="#ef4444"
              type="area"
              thresholds={{ warning: thresholds.temperaturaAgua.warning, danger: thresholds.temperaturaAgua.danger }}
            />
            <CompactChart
              title="Carga Motor (%)"
              data={generateMockHistoricalData(data.motor.cargaMotor, 10)}
              color="#10b981"
              thresholds={{ warning: thresholds.cargaMotor.warning, danger: thresholds.cargaMotor.danger }}
            />
            <CompactChart
              title="EGT A1 (°C)"
              data={generateMockHistoricalData(data.bancos.A1.temperaturaEGT, 30)}
              color="#f59e0b"
              type="area"
              thresholds={{ warning: thresholds.temperaturaEGT.warning, danger: thresholds.temperaturaEGT.danger }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}