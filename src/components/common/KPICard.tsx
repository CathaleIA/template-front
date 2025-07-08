import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Gauge, Zap, Thermometer, Droplets, Battery } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  alertLevel: 'normal' | 'warning' | 'danger';
  stats?: {
    avg: number;
    trend: 'up' | 'down' | 'stable';
    min: number;
    max: number;
  };
  type?: 'gauge' | 'bar' | 'simple';
  thresholds?: {
    min: number;
    normal: number;
    warning: number;
    danger: number;
    max: number;
  };
}

const getColorClass = (alertLevel: string): string => {
  switch (alertLevel) {
    case "normal": return "text-green-500";
    case "warning": return "text-amber-500";
    case "danger": return "text-red-500";
    default: return "text-gray-500";
  }
};

const GaugeChart = ({ value, max, thresholds, unit }: { 
  value: number; 
  max: number; 
  thresholds?: any; 
  unit: string;
}) => {
  const percentage = (value / max) * 100;
  const strokeDasharray = `${percentage} ${100 - percentage}`;
  
  // Determine color based on thresholds
  let strokeColor = "#10b981"; // green
  if (thresholds) {
    if (value > thresholds.danger) strokeColor = "#ef4444"; // red
    else if (value > thresholds.warning) strokeColor = "#f59e0b"; // yellow
  }
  
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke={strokeColor}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={`${percentage * 2.51} 251.2`}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-bold" style={{ color: strokeColor }}>
            {value}
          </div>
          <div className="text-xs text-gray-500">{unit}</div>
        </div>
      </div>
    </div>
  );
};

const BarChart = ({ value, max, thresholds }: { 
  value: number; 
  max: number; 
  thresholds?: any;
}) => {
  const percentage = (value / max) * 100;
  
  let barColor = "bg-green-500";
  if (thresholds) {
    if (value > thresholds.danger) barColor = "bg-red-500";
    else if (value > thresholds.warning) barColor = "bg-yellow-500";
  }
  
  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full ${barColor} transition-all duration-300 rounded-full`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

export const EnhancedKPICard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  alertLevel, 
  stats, 
  type = 'simple',
  thresholds 
}: KPICardProps) => {
  const colorClass = getColorClass(alertLevel);
  
  const renderVisualization = () => {
    if (type === 'gauge' && thresholds) {
      return (
        <div className="mt-4">
          <GaugeChart 
            value={value} 
            max={thresholds.max} 
            thresholds={thresholds}
            unit={unit}
          />
        </div>
      );
    }
    
    if (type === 'bar' && thresholds) {
      return (
        <div className="mt-4">
          <BarChart 
            value={value} 
            max={thresholds.max} 
            thresholds={thresholds}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>{thresholds.max}</span>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className={colorClass}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          <span className={colorClass}>{value.toFixed(1)}</span> 
          <span className="text-sm text-gray-500 ml-1">{unit}</span>
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
            <div>
              <span className="text-gray-500">Prom:</span> {stats.avg.toFixed(1)} {unit}
            </div>
            <div className="flex items-center">
              <span className="text-gray-500">Tend:</span>
              <div className="ml-1">
                {stats.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                {stats.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                {stats.trend === 'stable' && <Minus className="h-3 w-3 text-gray-500" />}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Min:</span> {stats.min.toFixed(1)} {unit}
            </div>
            <div>
              <span className="text-gray-500">Max:</span> {stats.max.toFixed(1)} {unit}
            </div>
          </div>
        )}
        
        {renderVisualization()}
        
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          alertLevel === 'normal' ? 'bg-green-500' :
          alertLevel === 'warning' ? 'bg-amber-500' : 'bg-red-500'
        }`}></div>
      </CardContent>
    </Card>
  );
};

// Demo component
export default function KPIDemo() {
  const mockStats = {
    avg: 85.5,
    trend: 'up' as const,
    min: 60,
    max: 120
  };

  const mockThresholds = {
    min: 0,
    normal: 40,
    warning: 80,
    danger: 100,
    max: 120
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Enhanced KPI Cards</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnhancedKPICard
          title="Potencia Activa"
          value={698}
          unit="kW"
          icon={<Zap className="h-5 w-5" />}
          alertLevel="normal"
          type="gauge"
          thresholds={{ min: 0, normal: 400, warning: 800, danger: 1000, max: 1200 }}
          stats={mockStats}
        />
        
        <EnhancedKPICard
          title="Temperatura"
          value={85}
          unit="°C"
          icon={<Thermometer className="h-5 w-5" />}
          alertLevel="warning"
          type="bar"
          thresholds={mockThresholds}
          stats={mockStats}
        />
        
        <EnhancedKPICard
          title="Voltaje L1-L2"
          value={4159.5}
          unit="V"
          icon={<Battery className="h-5 w-5" />}
          alertLevel="normal"
          type="simple"
          stats={mockStats}
        />
        
        <EnhancedKPICard
          title="Frecuencia"
          value={60.02}
          unit="Hz"
          icon={<Gauge className="h-5 w-5" />}
          alertLevel="normal"
          type="gauge"
          thresholds={{ min: 0, normal: 50, warning: 65, danger: 70, max: 80 }}
          stats={mockStats}
        />
      </div>
    </div>
  );
}