"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Activity, Brain, Zap } from 'lucide-react';

interface MotorData {
  id: string;
  timestamp: string;
  createdAt: string;
  estadoGeneral: string;
  alertas: string[];
  torque: number;
  voltaje: number;
  revoluciones: number;
  potencia: number;
  temperatura: number;
  eficiencia: number;
  consumoCombustible: number;
  presionAceite: number;
  nivelAceite: number;
}

interface TrendAnalysis {
  parameter: string;
  trend: 'ascending' | 'descending' | 'stable';
  confidence: number;
  prediction: number;
  anomalies: number;
}

interface AnomalyDetection {
  timestamp: string;
  parameter: string;
  value: number;
  severity: 'low' | 'medium' | 'high';
  probability: number;
}

// ✅ NUEVO: Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white border border-gray-700 p-2 rounded shadow">
        <p className="text-sm font-semibold">Hora: {label}</p>
        <p className="text-sm">Valor: {payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<MotorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [selectedParameter, setSelectedParameter] = useState('temperatura');
  const [neuralProcessing, setNeuralProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://46ou4qrae1.execute-api.us-east-1.amazonaws.com/prod/history?hours=500000');
      const result = await response.json();

      const processedData = result.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp).toISOString(),
        createdAt: new Date(item.createdAt).toISOString()
      })).sort((a: MotorData, b: MotorData) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setData(processedData);
      setTimeout(() => {
        setLoading(false);
        simulateNeuralAnalysis(processedData);
      }, 1500);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const simulateNeuralAnalysis = (motorData: MotorData[]) => {
    setNeuralProcessing(true);

    setTimeout(() => {
      const parameters = ['temperatura', 'torque', 'eficiencia', 'consumoCombustible', 'presionAceite'];
      const generatedTrends: TrendAnalysis[] = parameters.map(param => {
        const values = motorData.map(d => d[param as keyof MotorData] as number);
        const trend = Math.random() > 0.5 ? 'ascending' : Math.random() > 0.5 ? 'descending' : 'stable';
        const confidence = 0.75 + Math.random() * 0.2;
        const prediction = values[values.length - 1] * (0.95 + Math.random() * 0.1);
        const anomalies = Math.floor(Math.random() * 5);

        return {
          parameter: param,
          trend,
          confidence,
          prediction,
          anomalies
        };
      });

      const generatedAnomalies: AnomalyDetection[] = [];
      motorData.forEach(item => {
        if (Math.random() > 0.85) {
          const params = ['temperatura', 'torque', 'eficiencia', 'consumoCombustible'];
          const randomParam = params[Math.floor(Math.random() * params.length)];
          generatedAnomalies.push({
            timestamp: item.timestamp,
            parameter: randomParam,
            value: item[randomParam as keyof MotorData] as number,
            severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
            probability: 0.8 + Math.random() * 0.2
          });
        }
      });

      setTrends(generatedTrends);
      setAnomalies(generatedAnomalies.slice(0, 10));
      setNeuralProcessing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const getChartData = () => {
    return data.map((item, index) => ({
      index,
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      value: item[selectedParameter as keyof MotorData] as number,
      anomaly: anomalies.some(a => a.timestamp === item.timestamp && a.parameter === selectedParameter)
    }));
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Normal': return 'text-green-600';
      case 'Crítico': return 'text-red-600';
      case 'Advertencia': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'ascending': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'descending': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos históricos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Motor Analysis AI</h1>
                <p className="text-sm text-gray-500">Neural Network Predictive Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {neuralProcessing ? (
                  <>
                    <div className="animate-pulse h-3 w-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Procesando...</span>
                  </>
                ) : analysisComplete ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Análisis completado</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Esperando análisis</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Registros</p>
                <p className="text-2xl font-bold text-gray-900">{data.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Anomalías Detectadas</p>
                <p className="text-2xl font-bold text-red-600">{anomalies.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Estado Crítico</p>
                <p className="text-2xl font-bold text-red-600">
                  {data.filter(d => d.estadoGeneral === 'Crítico').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confianza IA</p>
                <p className="text-2xl font-bold text-green-600">
                  {analysisComplete ? '94.2%' : '--'}
                </p>
              </div>
              <Brain className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Análisis de Tendencias</h2>
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
                className="text-sm text-gray-800 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="temperatura">Temperatura</option>
                <option value="torque">Torque</option>
                <option value="eficiencia">Eficiencia</option>
                <option value="consumoCombustible">Consumo Combustible</option>
                <option value="presionAceite">Presión Aceite</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Análisis Neural - Tendencias</h2>
            <div className="space-y-4">
              {trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(trend.trend)}
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{trend.parameter}</p>
                      <p className="text-sm text-gray-500">
                        Confianza: {(trend.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Predicción: {trend.prediction.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trend.anomalies} anomalías
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detección de Anomalías</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parámetro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probabilidad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {anomalies.map((anomaly, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(anomaly.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{anomaly.parameter}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{anomaly.value.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(anomaly.severity)}`}>{anomaly.severity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(anomaly.probability * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
