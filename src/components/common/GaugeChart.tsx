import React from 'react';
import GaugeChart from 'react-gauge-chart';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GaugeChartProps {
  title: string;
  value: number;
  min?: number;
  max: number;
  unit: string;
  color: string;
  icon?: React.ReactNode;
  thresholds?: {
    normal?: number;
    warning?: number;
    danger?: number;
  };
}

export const CustomGaugeChart: React.FC<GaugeChartProps> = ({
  title,
  value,
  min = 0,
  max,
  unit,
  color,
  icon,
  thresholds,
}) => {
  // Calcular el porcentaje para el gauge
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  
  // Determinar el estado actual basado en los thresholds
  const getStatusInfo = () => {
    if (thresholds?.danger && value >= thresholds.danger) {
      return { color: '#ef4444', text: 'Crítico' };
    }
    if (thresholds?.warning && value >= thresholds.warning) {
      return { color: '#f59e0b', text: 'Advertencia' };
    }
    return { color: color, text: 'Normal' };
  };

  const statusInfo = getStatusInfo();

  // Configurar los colores del gauge basado en los thresholds
  const getGaugeColors = () => {
    if (!thresholds) return [color];
    
    const colors = [];
    const normalThreshold = thresholds.normal || 0;
    const warningThreshold = thresholds.warning || max * 0.7;
    const dangerThreshold = thresholds.danger || max * 0.9;
    
    // Calcular porcentajes para cada zona
    const normalPercent = Math.min((warningThreshold - min) / (max - min), 1);
    const warningPercent = Math.min((dangerThreshold - warningThreshold) / (max - min), 1);
    const dangerPercent = 1 - normalPercent - warningPercent;
    
    if (normalPercent > 0) colors.push('#10b981'); // Verde para normal
    if (warningPercent > 0) colors.push('#f59e0b'); // Amarillo para advertencia
    if (dangerPercent > 0) colors.push('#ef4444'); // Rojo para peligro
    
    return colors;
  };

  const gaugeColors = getGaugeColors();

  return (
    <Card className="hover:shadow-lg transition-shadow bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div style={{ color: statusInfo.color }}>{icon}</div>}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="w-full max-w-xs mb-4">
          <GaugeChart
            id={`gauge-${title.replace(/\s+/g, '-').toLowerCase()}`}
            nrOfLevels={gaugeColors.length}
            percent={percentage}
            colors={gaugeColors}
            arcWidth={0.3}
            arcPadding={0.02}
            cornerRadius={3}
            needleColor="#374151"
            needleBaseColor="#374151"
            textColor="transparent" // Ocultamos el texto del gauge para usar el nuestro
            animate={false}
            animateDuration={1000}
            formatTextValue={() => ''} // Evitamos que muestre texto
          />
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: statusInfo.color }}>
            {value.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">{unit}</div>
          <div className="text-xs mt-1" style={{ color: statusInfo.color }}>
            {statusInfo.text}
          </div>
        </div>
        
        <div className="flex justify-between w-full mt-4 text-xs text-gray-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>
        
        {/* Indicadores de threshold */}
        {(thresholds?.warning || thresholds?.danger) && (
          <div className="flex gap-3 mt-3 text-xs">
            {thresholds?.warning && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Advertencia: {thresholds.warning}</span>
              </div>
            )}
            {thresholds?.danger && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Crítico: {thresholds.danger}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};