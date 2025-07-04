'use client';

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Thermometer, Gauge, Droplets, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EnhancedKPICard } from "@/components/common/KPICard";
import { EnhancedMetricChart } from "@/components/common/MetricChart";
import { AlertStatus } from "@/components/common/AlertStatus";
import { HistoricalTrends } from "@/components/common/HistoricalTrends";
import { MotorData, HistoricalDataPoint, AlertLevel } from "@/components/common/types";
import { fetchMotorData, fetchHistoricalData } from "@/app/api/dashboard/api";
const bankThresholds = {
  lambda: { min: 0.7, normal: 0.9, warning: 1.1, danger: 1.3, max: 1.5 },
  tiempoInyeccionMs: { min: 0, normal: 5, warning: 10, danger: 15, max: 20 },
  tiempoEncendidoAvance: { min: 0, normal: 5, warning: 10, danger: 15, max: 20 },
  temperaturaEGT: { min: 0, normal: 500, warning: 700, danger: 800, max: 900 },
  presionCombustible: { min: 0, normal: 3, warning: 4, danger: 5, max: 6 },
  presionTurbo: { min: 0, normal: 1, warning: 1.5, danger: 2, max: 2.5 },
};

const getAlertLevel = (value: number, metric: keyof typeof bankThresholds): AlertLevel => {
  const limits = bankThresholds[metric];
  if (value > limits.danger || value < limits.min) return "danger";
  if (value > limits.warning || value < limits.normal) return "warning";
  return "normal";
};

export default function BankAPage() {
  const [data, setData] = useState<MotorData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingHistorical, setLoadingHistorical] = useState<boolean>(false);
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
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadHistoricalData = async () => {
    try {
      setLoadingHistorical(true);
      const historical = await fetchHistoricalData(80000);
      setHistoricalData(historical);
    } catch (err) {
      console.error("Error loading historical data:", err);
    } finally {
      setLoadingHistorical(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold">Cargando datos del banco A1...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-6 w-6" />
          <AlertTitle>Error</AlertTitle>
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Banco A1 - Monitoreo</h1>
        <button
          onClick={loadHistoricalData}
          disabled={loadingHistorical}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loadingHistorical ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>{historicalData.length > 0 ? "Actualizar" : "Cargar"} Históricos</span>
            </>
          )}
        </button>
      </div>

      {/* KPIs del Banco A1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <EnhancedKPICard
          title="Lambda"
          value={data.bancos.A1.lambda}
          unit="λ"
          icon={<Activity className="h-5 w-5" />}
          alertLevel={getAlertLevel(data.bancos.A1.lambda, "lambda")}
        />
        <EnhancedKPICard
          title="Tiempo Inyección"
          value={data.bancos.A1.tiempoInyeccionMs}
          unit="ms"
          icon={<Gauge className="h-5 w-5" />}
          alertLevel={getAlertLevel(data.bancos.A1.tiempoInyeccionMs, "tiempoInyeccionMs")}
        />
        <EnhancedKPICard
          title="Temperatura EGT"
          value={data.bancos.A1.temperaturaEGT}
          unit="°C"
          icon={<Thermometer className="h-5 w-5" />}
          alertLevel={getAlertLevel(data.bancos.A1.temperaturaEGT, "temperaturaEGT")}
        />
      </div>

      {/* Gráficas del Banco A1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EnhancedMetricChart
          title="Presión Turbo"
          value={data.bancos.A1.presionTurbo}
          unit="bar"
          color="#8b5cf6"
          icon={<Gauge className="h-5 w-5" />}
          type="area"
          data={historicalData.map(item => ({
            timestamp: item.timestamp,
            value: item.presionTurbo || 0
          }))}
          thresholds={bankThresholds.presionTurbo}
        />
        <EnhancedMetricChart
          title="Presión Combustible"
          value={data.bancos.A1.presionCombustible}
          unit="bar"
          color="#ec4899"
          icon={<Droplets className="h-5 w-5" />}
          type="bar"
          data={historicalData.map(item => ({
            timestamp: item.timestamp,
            value: item.presionCombustible || 0
          }))}
          thresholds={bankThresholds.presionCombustible}
        />
      </div>

      {/* Alertas del Banco A1 */}
      <AlertStatus 
        metrics={[
          { name: 'Lambda', value: data.bancos.A1.lambda, metric: 'lambda' },
          { name: 'Tiempo Inyección', value: data.bancos.A1.tiempoInyeccionMs, metric: 'tiempoInyeccionMs' },
          { name: 'Temperatura EGT', value: data.bancos.A1.temperaturaEGT, metric: 'temperaturaEGT' },
          { name: 'Presión Combustible', value: data.bancos.A1.presionCombustible, metric: 'presionCombustible' },
          { name: 'Presión Turbo', value: data.bancos.A1.presionTurbo, metric: 'presionTurbo' }
        ]}
        getAlertLevel={getAlertLevel}
      />

      {/* Tendencias históricas */}
      {historicalData.length > 0 && (
        <HistoricalTrends 
          data={historicalData}
          metrics={[
            { key: 'lambda', name: 'Lambda', color: '#3b82f6' },
            { key: 'tiempoInyeccion', name: 'Tiempo Inyección', color: '#10b981' },
            { key: 'temperaturaEGT', name: 'Temperatura EGT', color: '#ef4444' }
          ]}
        />
      )}
    </div>
  );
}