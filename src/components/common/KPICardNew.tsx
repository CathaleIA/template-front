import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value?: number;
    period?: string;
  };
  status?: 'normal' | 'warning' | 'danger';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  icon,
  color = '#3b82f6',
  trend,
  status = 'normal',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return color;
    }
  };

  const statusColor = getStatusColor();

  const TrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold" style={{ color: statusColor }}>
                {typeof value === 'number' ? value.toFixed(1) : value}
              </span>
              {unit && (
                <span className="text-sm text-gray-500">{unit}</span>
              )}
            </div>
            
            {trend && (
              <div className="flex items-center mt-2 space-x-1">
                <TrendIcon />
                <span className={`text-xs ${
                  trend.direction === 'up' ? 'text-red-500' : 
                  trend.direction === 'down' ? 'text-green-500' : 'text-gray-500'
                }`}>
                  {trend.value && `${trend.value.toFixed(1)}%`}
                  {trend.period && ` ${trend.period}`}
                </span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="ml-4" style={{ color: statusColor }}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};