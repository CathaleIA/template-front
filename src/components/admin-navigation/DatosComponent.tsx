'use client'

import { LoadedDataInfo, SensorData, MetricConfig, MetricsConfig } from "@/types/index";
import { useState } from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Activity, FileText, RefreshCw, Upload, X } from "lucide-react";
import { useNotifications } from "@/context/notification-context";

import * as Papa from "papaparse";
import { Button } from "@/components/ui/button";

interface SensorListProps {
    sensorData: SensorData[];
    setSensorData: React.Dispatch<React.SetStateAction<SensorData[]>>;
    metricsConfig: MetricsConfig;
    currentValues: SensorData;
    setCurrentValues: React.Dispatch<React.SetStateAction<SensorData>>
}


const DataComponent: React.FC<SensorListProps> = ({ sensorData, setSensorData, metricsConfig, currentValues, setCurrentValues }) => {

    const { addNotification } = useNotifications();
    const [isUploading, setIsUploading] = useState(false);

    const handleCSVFile = async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        if (results.errors.length > 0) {
                            throw new Error('Errores en el archivo CSV: ' + results.errors.map(e => e.message).join(', '));
                        }

                        const data = results.data as SensorData[];
                        setSensorData(data);

                        // Tomar los valores más recientes para mostrar
                        if (data.length > 0) {
                            const latestData = data[data.length - 1];
                            setCurrentValues(latestData);
                        }

                        resolve();
                    } catch (error) {
                        addNotification({
                            type: "error",
                            title: "Error al procesar archivo.",
                            message: `Error al parsear JSON: ${error}`,
                        })
                    }
                },
                error: (error) => {
                    addNotification({
                        type: "error",
                        title: "Error al procesar archivo.",
                        message: `Error al parsear JSON: ${error}`,
                    })
                }
            });
        });
    };

    const handleJSONFile = async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);

                    // Verificar si es un array de datos de sensores
                    if (Array.isArray(data)) {
                        setSensorData(data);
                        // Tomar los valores más recientes para mostrar
                        if (data.length > 0) {
                            const latestData = data[data.length - 1];
                            setCurrentValues(latestData);
                        }
                    } else if (typeof data === 'object' && data !== null) {
                        // Si es un objeto simple, tratarlo como un registro único
                        setSensorData([data]);
                        setCurrentValues(data);
                    } else {
                        throw new Error('El archivo JSON debe contener un array de objetos o un objeto con datos de sensores');
                    }

                    resolve();
                } catch (error) {
                    // reject(new Error('Error al parsear JSON: ' + (error instanceof Error ? error.message : 'Formato inválido')));
                    addNotification({
                        type: "error",
                        title: "Error al procesar archivo.",
                        message: `Error al parsear JSON: ${error}`,
                    })
                }
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            addNotification({
                type: "error",
                title: "Error de carga.",
                message: "No se ha cargado o encontrado ningun archivo valido.",
            })
            return;
        }

        setIsUploading(true);

        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (fileExtension === 'json') {
                await handleJSONFile(file);
            } else if (fileExtension === 'csv') {
                await handleCSVFile(file);
            } else {
                throw new Error('Formato de archivo no soportado. Use JSON o CSV.');
            }

            setDataInfo({
                fileName: file.name,
                recordCount: sensorData.length,
                lastUpdate: new Date().toLocaleString(),
                dataSource: fileExtension as 'json' | 'csv'
            });
            toast.success("Success", { description: "File Loaded success." })

        } catch (error) {
            //toast.error("Error", { description: "Error loading file" })
            addNotification({
                type: "error",
                title: "Error de carga.",
                message: `Error, Descripcion:${error}`,
            })

        } finally {
            setIsUploading(false);
            // Limpiar el input
            event.target.value = '';
        }
    };

    const [dataInfo, setDataInfo] = useState<LoadedDataInfo | null>(null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card className="card-generic">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Upload className="h-5 w-5" />
                        <span>Cargar Datos de Sensores</span>
                    </CardTitle>
                    <CardDescription>
                        Sube un archivo JSON o CSV con los datos de los sensores para actualizar las métricas
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-foreground">Archivo de Datos</Label>
                        <div className="border-1 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                            <Input
                                id="archivo"
                                type="file"
                                accept=".json,.csv"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="customdestructive"
                                size="custom"
                                onClick={() => document.getElementById("archivo")?.click()}
                                disabled={isUploading}
                                className="w-full disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <>
                                        <RefreshCw className="animate-spin" />
                                        Cargando archivo...
                                    </>
                                ) : (
                                    <>
                                        <Upload/>
                                        {dataInfo ? dataInfo.fileName : "Seleccionar archivo"}
                                    </>
                                )}
                            </Button>
                            {dataInfo && !isUploading && (
                                <div className="flex items-center justify-between gap-2 mt-3 p-2 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <span className="text-primary">{dataInfo.fileName}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="customclose"
                                        size="customicon"
                                        onClick={() => setDataInfo(null)}
                                    >
                                        <X/>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Formatos Soportados</AlertTitle>
                        <AlertDescription>
                            <strong>JSON:</strong> Array de objetos o objeto único con propiedades de sensores<br />
                            <strong>CSV:</strong> Archivo con encabezados correspondientes a los nombres de métricas
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card className="card-generic">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Estado de los Datos</span>
                    </CardTitle>
                    <CardDescription>
                        Información sobre los datos cargados actualmente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Archivo cargado:</span>
                            <span className="font-medium text-sm">
                                {dataInfo?.fileName || "Datos de ejemplo"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tipo de fuente:</span>
                            <span className="font-medium">
                                {dataInfo?.dataSource ? dataInfo?.dataSource.toUpperCase() : "Simulado"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Registros:</span>
                            <span className="font-medium">{sensorData.length || "Datos de ejemplo"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Última actualización:</span>
                            <span className="font-medium text-xs">
                                {dataInfo?.lastUpdate || "Inicio de sesión"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Métricas activas:</span>
                            <span className="font-medium">
                                {Object.keys(currentValues).length}
                            </span>
                        </div>
                    </div>

                    {Object.keys(currentValues).length > 0 && (
                        <div className="mt-4 p-3 bg-muted rounded">
                            <h4 className="font-medium text-foreground mb-2">Valores Actuales</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(currentValues).slice(0, 6).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-muted-foreground truncate">{metricsConfig[key]?.name || key}:</span>
                                        <span className="font-medium text-foreground">{value} {metricsConfig[key]?.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default DataComponent;