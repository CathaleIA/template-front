import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MetricChartProps {
  title: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  type: "line" | "area" | "bar";
  data: {
    timestamp: string;
    value: number;
  }[];
  thresholds?: {
    normal?: number;
    warning?: number;
    danger?: number;
  };
}

const TIME_RANGES = {
  '14min': { label: 'Últimos 14 minutos', minutes: 14 },
  '1h': { label: 'Última hora', minutes: 60 },
  '12h': { label: 'Últimas 12 horas', minutes: 720 },
  '24h': { label: 'Últimas 24 horas', minutes: 1440 },
};

export const EnhancedMetricChart = ({
  title,
  value,
  unit,
  color,
  icon,
  type,
  data,
  thresholds,
}: MetricChartProps) => {
  const [expanded, setExpanded] = useState(false);
  const [timeRange, setTimeRange] = useState('14min');

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    const now = new Date();
    const rangeMinutes = TIME_RANGES[timeRange as keyof typeof TIME_RANGES].minutes;
    const cutoffTime = new Date(now.getTime() - rangeMinutes * 60 * 1000);
    
    return data.filter(item => new Date(item.timestamp) >= cutoffTime);
  }, [data, timeRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!filteredData.length) return null;
    
    const values = filteredData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    const trendDiff = Math.abs(secondHalfAvg - firstHalfAvg);
    const trendThreshold = avg * 0.05; // 5% of average
    
    if (trendDiff > trendThreshold) {
      trend = secondHalfAvg > firstHalfAvg ? 'up' : 'down';
    }
    
    // Detect anomalies (values beyond 2 standard deviations)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const anomalies = filteredData.filter(d => 
      Math.abs(d.value - avg) > 2 * stdDev
    );
    
    return {
      min,
      max,
      avg,
      trend,
      anomalies: anomalies.length,
      stdDev,
      variance
    };
  }, [filteredData]);

  const renderChart = (isExpanded = false): JSX.Element => {
    const chartProps = {
      data: filteredData,
      margin: isExpanded ? { top: 20, right: 30, left: 20, bottom: 20 } : { top: 5, right: 5, left: 5, bottom: 5 },
    };

    const commonElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(value) => {
            const date = new Date(value);
            return timeRange === '24h' || timeRange === '12h' 
              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }}
          fontSize={12}
        />
        <YAxis fontSize={12} />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleString()}
          formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
        />
        {thresholds?.warning && (
          <ReferenceLine
            y={thresholds.warning}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            label={{ value: "Warning", position: "top" }}
          />
        )}
        {thresholds?.danger && (
          <ReferenceLine
            y={thresholds.danger}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{ value: "Warning", position: "top" }}
          />
        )}
      </>
    );

    switch (type) {
      case "line":
        return (
          <LineChart {...chartProps}>
            {commonElements}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={isExpanded ? 3 : 2}
              dot={false}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...chartProps}>
            {commonElements}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`${color}30`}
              strokeWidth={isExpanded ? 3 : 2}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...chartProps}>
            {commonElements}
            <Bar 
              dataKey="value" 
              fill={color} 
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        );

      default:
        return (
          <LineChart {...chartProps}>
            {commonElements}
            <Line dataKey="value" stroke={color} />
          </LineChart>
        );
    }
  };

  const StatCard = ({ label, value, icon: statIcon, color: statColor }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-gray-50 p-3 rounded-lg ">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <div style={{ color: statColor || '#6b7280' }}>{statIcon}</div>
      </div>
      <div className="text-lg font-semibold mt-1" style={{ color: statColor || '#374151' }}>
        {typeof value === 'number' ? value.toFixed(2) : value}
      </div>
    </div>
  );

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <div style={{ color }}>{icon}</div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 p-1 h-6 w-6"
              onClick={() => setExpanded(true)}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold" style={{ color }}>
              {value.toFixed(1)} {unit}
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-auto h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_RANGES).map(([key, range]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {statistics && (
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="flex items-center">
                <span className="text-gray-500">Media:</span>
                <span className="ml-1 font-medium">{statistics.avg.toFixed(1)} {unit}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500">Tendencia:</span>
                <div className="ml-1">
                  {statistics.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                  {statistics.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                  {statistics.trend === 'stable' && <span className="text-gray-500 text-xs">Estable</span>}
                </div>
              </div>
            </div>
          )}

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div style={{ color }}>{icon}</div>
              <span>{title} - Análisis Detallado</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full space-y-4">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Período:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIME_RANGES).map(([key, range]) => (
                    <SelectItem key={key} value={key}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart(true)}
              </ResponsiveContainer>
            </div>

            {/* Statistics Panel */}
            {statistics && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Estadísticas del Período</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Valor Actual"
                    value={`${value.toFixed(2)} ${unit}`}
                    icon={<Info className="h-4 w-4" />}
                    color={color}
                  />
                  <StatCard
                    label="Promedio"
                    value={`${statistics.avg.toFixed(2)} ${unit}`}
                    icon={<Info className="h-4 w-4" />}
                  />
                  <StatCard
                    label="Mínimo"
                    value={`${statistics.min.toFixed(2)} ${unit}`}
                    icon={<TrendingDown className="h-4 w-4" />}
                    color="#10b981"
                  />
                  <StatCard
                    label="Máximo"
                    value={`${statistics.max.toFixed(2)} ${unit}`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    color="#ef4444"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <StatCard
                    label="Tendencia"
                    value={
                      statistics.trend === 'up' ? 'Ascendente' :
                      statistics.trend === 'down' ? 'Descendente' : 'Estable'
                    }
                    icon={
                      statistics.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                      statistics.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                      <span className="text-xs">━</span>
                    }
                    color={
                      statistics.trend === 'up' ? '#ef4444' :
                      statistics.trend === 'down' ? '#10b981' : '#6b7280'
                    }
                  />
                  <StatCard
                    label="Anomalías"
                    value={`${statistics.anomalies} eventos`}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    color={statistics.anomalies > 0 ? '#f59e0b' : '#10b981'}
                  />
                  <StatCard
                    label="Desviación Estándar"
                    value={`${statistics.stdDev.toFixed(2)} ${unit}`}
                    icon={<Info className="h-4 w-4" />}
                  />
                </div>

                {/* Insights */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Análisis Automático</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• El valor actual ({value.toFixed(2)} {unit}) está {
                      value > statistics.avg ? 'por encima' : 'por debajo'
                    } del promedio ({statistics.avg.toFixed(2)} {unit})</p>
                    
                    {statistics.anomalies > 0 && (
                      <p>• Se detectaron {statistics.anomalies} anomalías en el período seleccionado</p>
                    )}
                    
                    <p>• La variabilidad {statistics.stdDev / statistics.avg > 0.2 ? 'alta' : 'normal'} 
                       (desviación estándar: {((statistics.stdDev / statistics.avg) * 100).toFixed(1)}%)</p>
                    
                    {thresholds && (
                      <>
                        {thresholds.warning && value > thresholds.warning && (
                          <p className="text-amber-700">⚠️ El valor actual supera el umbral de advertencia ({thresholds.warning} {unit})</p>
                        )}
                        {thresholds.danger && value > thresholds.danger && (
                          <p className="text-red-700">🚨 El valor actual supera el umbral crítico ({thresholds.danger} {unit})</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Demo component with sample data
export default function ChartDemo() {
  // Generate sample data
  const generateSampleData = (hours: number) => {
    const data = [];
    const now = new Date();
    const baseValue = 85;
    
    for (let i = hours * 60; i >= 0; i -= 5) {
      const timestamp = new Date(now.getTime() - i * 60 * 1000);
      const noise = (Math.random() - 0.5) * 20;
      const trend = Math.sin(i * 0.01) * 10;
      const value = Math.max(0, baseValue + noise + trend);
      
      data.push({
        timestamp: timestamp.toISOString(),
        value: parseFloat(value.toFixed(2))
      });
    }
    
    return data;
  };

  const sampleData = generateSampleData(24);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Enhanced Metric Charts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedMetricChart
          title="Temperatura del Motor"
          value={87.5}
          unit="°C"
          color="#ef4444"
          icon={<div>🌡️</div>}
          type="area"
          data={sampleData}
          thresholds={{
            normal: 40,
            warning: 80,
            danger: 100
          }}
        />
        
        <EnhancedMetricChart
          title="RPM del Motor"
          value={3250}
          unit="rpm"
          color="#3b82f6"
          icon={<div>⚙️</div>}
          type="line"
          data={sampleData.map(d => ({ ...d, value: d.value * 40 }))}
          thresholds={{
            normal: 1000,
            warning: 4000,
            danger: 5000
          }}
        />
      </div>
    </div>
  );
}