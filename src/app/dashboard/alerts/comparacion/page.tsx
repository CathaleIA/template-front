'use client';

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { MotorData, HistoricalDataPoint, AlertLevel } from "@/components/common/types";
import { fetchMotorData, fetchHistoricalData } from "@/app/api/dashboard/api";

export default function ComparisonPage() {
  const [data, setData] = useState<MotorData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
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
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const historical = await fetchHistoricalData(80000);
        setHistoricalData(historical);
      } catch (err) {
        console.error("Error loading historical data:", err);
      }
    };

    loadHistoricalData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold">Cargando datos para comparación...</h2>
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

  // Preparar datos para comparación
  const comparisonData = [
    {
      name: 'Lambda',
      A1: data.bancos.A1.lambda,
      B1: data.bancos.B1.lambda,
    },
    {
      name: 'Inyección (ms)',
      A1: data.bancos.A1.tiempoInyeccionMs,
      B1: data.bancos.B1.tiempoInyeccionMs,
    },
    {
      name: 'EGT (°C)',
      A1: data.bancos.A1.temperaturaEGT,
      B1: data.bancos.B1.temperaturaEGT,
    },
    {
      name: 'Presión Turbo',
      A1: data.bancos.A1.presionTurbo,
      B1: data.bancos.B1.presionTurbo,
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Comparación entre Bancos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparación Actual</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={comparisonData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="A1" name="Banco A1" fill="#3b82f6" barSize={20} />
                <Bar dataKey="B1" name="Banco B1" fill="#10b981" barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencias de Lambda</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={historicalData.slice(-20)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()} 
                />
                <YAxis yAxisId="left" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="lambdaA" 
                  name="Lambda A1"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="lambdaB" 
                  name="Lambda B1"
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencias de Temperatura EGT</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={historicalData.slice(-20)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()} 
              />
              <YAxis yAxisId="left" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="egtA" 
                name="EGT A1 (°C)"
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="egtB" 
                name="EGT B1 (°C)"
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}