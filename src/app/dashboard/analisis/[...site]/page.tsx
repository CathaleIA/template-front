"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Activity, Brain, Zap } from 'lucide-react';

import { PageHeader } from "@/components/page-header"
import { useNotifications } from "@/context/notification-context"
import { columns } from "./columns"
import { DataTable } from '@/components/ui/data-table';
import { AppPageLoading } from '@/components/skeleton/app-page-loading';

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

export default function AnalisisSite() {
    const { addNotification } = useNotifications()
    const filters = [
        { column: "parameter", placeholder: "Filter by parameter..." },
        { column: "severity", placeholder: "Filter by severity..." }
    ]
    const [data, setData] = useState<MotorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [trends, setTrends] = useState<TrendAnalysis[]>([]);
    const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
    const [selectedParameter, setSelectedParameter] = useState('temperatura');
    const [neuralProcessing, setNeuralProcessing] = useState(false);

    useEffect(() => {
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
        }
        fetchData()
    }, [])

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
        }, 1000);
    };

    const getChartData = () => {
        return data.map((item, index) => ({
            index,
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            value: item[selectedParameter as keyof MotorData] as number,
            anomaly: anomalies.some(a => a.timestamp === item.timestamp && a.parameter === selectedParameter)
        }));
    };

    // const getStatusColor = (estado: string) => {
    //     switch (estado) {
    //         case 'Normal': return 'text-green-600';
    //         case 'Crítico': return 'text-red-600';
    //         case 'Advertencia': return 'text-yellow-600';
    //         default: return 'text-gray-600';
    //     }
    // };

    // const getSeverityColor = (severity: string) => {
    //     switch (severity) {
    //         case 'high': return 'bg-red-100 text-red-800';
    //         case 'medium': return 'bg-yellow-100 text-yellow-800';
    //         case 'low': return 'bg-green-100 text-green-800';
    //         default: return 'bg-gray-100 text-gray-800';
    //     }
    // };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'ascending': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'descending': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
            default: return <Activity className="h-4 w-4 text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <AppPageLoading />
        );
    }
    return (
        <div className="flex flex-col items-center gap-4 p-5">
            {/* Header */}
            <div className="w-full">
                <PageHeader
                    title="Motor Analysis AI"
                    description="Neural Network Predictive Analytics."
                    actions={
                        <div className="flex items-center space-x-2">
                            {neuralProcessing ? (
                                <>
                                    <div className="animate-pulse h-3 w-3 bg-primary rounded-full"></div>
                                    <span className="text-sm text-muted-foreground">Procesando...</span>
                                </>
                            ) : analysisComplete ? (
                                <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-muted-foreground">Análisis completado</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Esperando análisis</span>
                                </>
                            )}
                        </div>
                    }
                />
            </div>
            <div className='flex flex-col gap-4 w-full'>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-bg-white rounded-lg  p-6 ">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Registros</p>
                                <p className="text-2xl font-bold text-foreground">{data.length}</p>
                            </div>
                            <Activity className="h-8 w-8 text-primary" />
                        </div>
                    </div>

                    <div className="bg-bg-white rounded-lg  p-6 ">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Anomalías Detectadas</p>
                                <p className="text-2xl font-bold text-destructive">{anomalies.length}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>

                    <div className="bg-bg-white rounded-lg  p-6 ">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Estado Crítico</p>
                                <p className="text-2xl font-bold text-destructive">
                                    {data.filter(d => d.estadoGeneral === 'Crítico').length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>

                    <div className="bg-bg-white rounded-lg  p-6 ">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Confianza IA</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {analysisComplete ? '94.2%' : '--'}
                                </p>
                            </div>
                            <Brain className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Chart Section */}
                    <div className="bg-bg-white rounded-lg  p-6 ">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Análisis de Tendencias</h2>
                            <select
                                value={selectedParameter}
                                onChange={(e) => setSelectedParameter(e.target.value)}
                                className="text-sm text-foreground border border-input rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-ring bg-bg-white"
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
                    <div className="bg-bg-white rounded-lg p-6 ">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Análisis Neural - Tendencias</h2>
                        <div className="space-y-4">
                            {trends.map((trend, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:shadow-lg">
                                    <div className="flex items-center space-x-3">
                                        {getTrendIcon(trend.trend)}
                                        <div>
                                            <p className="font-medium text-foreground capitalize">{trend.parameter}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Confianza: {(trend.confidence * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-foreground">
                                            Predicción: {trend.prediction.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {trend.anomalies} anomalías
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="rounded-lg">
                    <h2 className="text-lg font-semibold text-foreground pb-1 pl-5">Registro de Anomalias</h2>
                    <DataTable columns={columns} data={anomalies} filters={filters} />
                </div>
            </div>
        </div>
    )
} 