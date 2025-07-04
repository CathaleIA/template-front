import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Bar } from "recharts";
import { HistoricalDataPoint } from "./types";

interface HistoricalTrendsProps {
  data: HistoricalDataPoint[];
  metrics?: {
    key: string;
    name: string;
    color: string;
  }[];
}

export const HistoricalTrends = ({ data, metrics = [
  { key: 'revoluciones', name: 'RPM', color: '#3b82f6' },
  { key: 'temperatura', name: 'Temperatura (°C)', color: '#ef4444' },
  { key: 'presionAceite', name: 'Presión Aceite (bar)', color: '#10b981' }
] }: HistoricalTrendsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencias Históricas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <Legend />
              {metrics.map((metric) => (
                <Line 
                  key={metric.key}
                  yAxisId="left"
                  type="monotone" 
                  dataKey={metric.key} 
                  name={metric.name}
                  stroke={metric.color} 
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <Bar 
                yAxisId="right"
                dataKey="eficiencia" 
                name="Eficiencia (%)"
                fill="#a78bfa" 
                opacity={0.6}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};