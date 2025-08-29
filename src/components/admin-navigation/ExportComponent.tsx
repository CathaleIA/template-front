import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database } from "lucide-react";

import { SystemSettings, Thresholds, EmailSettings, SensorData } from "@/types/index";
import Papa from "papaparse";

interface ExportProps {
    thresholds: Thresholds,
    emailSettings: EmailSettings,
    systemSettings: SystemSettings,
    sensorData: SensorData[],
}

const ExportComponent: React.FC<ExportProps> = ({ thresholds, emailSettings, systemSettings, sensorData }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Exportar Datos y Configuración</span>
                </CardTitle>
                <CardDescription>
                    Exporta la configuración actual o los datos del sistema para respaldo o análisis
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Exportar Configuración</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Guarda la configuración actual de umbrales y notificaciones en un archivo JSON
                        </p>
                        <Button
                            variant="custom" 
                            size="custom" 
                            className="w-full gap-1"
                            onClick={() => {
                                const config = {
                                    thresholds,
                                    emailSettings,
                                    systemSettings,
                                    exportedAt: new Date().toISOString()
                                };
                                const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `configuracion-sistema-${new Date().toISOString().split('T')[0]}.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                        >
                            Exportar Configuración
                        </Button>
                    </div>

                    <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Exportar Datos</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Exporta los datos actuales de sensores en formato JSON o CSV
                        </p>
                        <div className="flex space-x-2">
                            <Button
                                variant="custom" size="custom" className="flex-1 gap-1"
                                onClick={() => {
                                    const blob = new Blob([JSON.stringify(sensorData, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `datos-sensores-${new Date().toISOString().split('T')[0]}.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                JSON
                            </Button>
                            <Button
                                variant="custom" 
                                size="custom" 
                                className="flex-1 gap-1"
                                onClick={() => {
                                    const csv = Papa.unparse(sensorData);
                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `datos-sensores-${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                CSV
                            </Button>
                        </div>
                    </div>
                </div>

                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Precaución con los datos sensibles</AlertTitle>
                    <AlertDescription>
                        Los archivos exportados pueden contener información sensible. Asegúrate de almacenarlos de forma segura.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}

export default ExportComponent