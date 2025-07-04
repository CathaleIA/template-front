import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface SystemInfoProps {
  mode: string;
  transmission: string;
  runtime: number;
  speed: number;
  load: number;
  records: number;
}

export const SystemInfo = ({ 
  mode, 
  transmission, 
  runtime, 
  speed, 
  load, 
  records 
}: SystemInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Información del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Modo de Operación:</span>
            <span className="font-medium">{mode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Relación Transmisión:</span>
            <span className="font-medium">{transmission}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tiempo Encendido:</span>
            <span className="font-medium">{runtime} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Velocidad:</span>
            <span className="font-medium">{speed} km/h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Carga del Motor:</span>
            <span className="font-medium">{load}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Registros Históricos:</span>
            <span className="font-medium">{records}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};