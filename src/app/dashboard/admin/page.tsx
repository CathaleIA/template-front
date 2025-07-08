"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Mail,
  Settings,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Gauge,
  Droplets,
  BatteryCharging,
  Fuel,
  Bell,
  Users,
  Database,
  RefreshCw,
  Copy,
  Trash2,
  Plus,
  Upload,
  FileText,
  Activity,
  X
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext"

// Tipos TypeScript
interface ThresholdLevels {
  normal: number;
  warning: number;
  danger: number;
}

interface Thresholds {
  [key: string]: ThresholdLevels;
}

interface EmailSettings {
  recipients: string[];
  enabled: boolean;
  frequency: string;
  testEmail: string;
}

interface SystemSettings {
  refreshInterval: number;
  historyRetention: number;
  alertCooldown: number;
  enableSounds: boolean;
}

interface MetricConfig {
  name: string;
  unit: string;
  icon: any;
  category: string;
  description: string;
  isReverse: boolean;
}

interface MetricsConfig {
  [key: string]: MetricConfig;
}

interface SensorData {
  timestamp?: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  [key: string]: number | string | undefined;
}

interface LoadedDataInfo {
  fileName: string;
  recordCount: number;
  lastUpdate: string;
  dataSource: 'json' | 'csv' | null;
}

// Configuración inicial de umbrales
const defaultThresholds: Thresholds = {
  temperaturaAgua: { normal: 50, warning: 100, danger: 150 },
  temperaturaAceite: { normal: 90, warning: 110, danger: 130 },
  presionAceite: { normal: 2, warning: 1.5, danger: 1 },
  rpm: { normal: 6000, warning: 6500, danger: 7000 },
  voltajeBateria: { normal: 12, warning: 11.5, danger: 11 },
  consumoCombustibleLh: { normal: 10, warning: 15, danger: 20 },
  cargaMotor: { normal: 80, warning: 90, danger: 95 },
  temperaturaEGT: { normal: 450, warning: 550, danger: 650 },
  presionCombustible: { normal: 3, warning: 2.5, danger: 2 },
  presionTurbo: { normal: 1.8, warning: 2.2, danger: 2.5 },
  lambda: { normal: 1, warning: 1.2, danger: 1.5 },
  tiempoInyeccionMs: { normal: 5, warning: 8, danger: 10 },
  tiempoEncendidoAvance: { normal: 20, warning: 30, danger: 40 },
};

// Configuración de métricas con metadatos
const metricsConfig: MetricsConfig = {
  temperaturaAgua: {
    name: "Temperatura Agua",
    unit: "°C",
    icon: Thermometer,
    category: "Motor",
    description: "Temperatura del agua del motor",
    isReverse: false
  },
  temperaturaAceite: {
    name: "Temperatura Aceite",
    unit: "°C",
    icon: Thermometer,
    category: "Motor",
    description: "Temperatura del aceite del motor",
    isReverse: false
  },
  presionAceite: {
    name: "Presión Aceite",
    unit: "bar",
    icon: Droplets,
    category: "Motor",
    description: "Presión del aceite del motor",
    isReverse: true
  },
  rpm: {
    name: "RPM",
    unit: "rpm",
    icon: Gauge,
    category: "Motor",
    description: "Revoluciones por minuto",
    isReverse: false
  },
  voltajeBateria: {
    name: "Voltaje Batería",
    unit: "V",
    icon: BatteryCharging,
    category: "Eléctrico",
    description: "Voltaje de la batería",
    isReverse: true
  },
  consumoCombustibleLh: {
    name: "Consumo Combustible",
    unit: "L/h",
    icon: Fuel,
    category: "Motor",
    description: "Consumo de combustible por hora",
    isReverse: false
  },
  cargaMotor: {
    name: "Carga Motor",
    unit: "%",
    icon: Gauge,
    category: "Motor",
    description: "Porcentaje de carga del motor",
    isReverse: false
  },
  temperaturaEGT: {
    name: "Temperatura EGT",
    unit: "°C",
    icon: Thermometer,
    category: "Bancos",
    description: "Temperatura de gases de escape",
    isReverse: false
  },
  presionCombustible: {
    name: "Presión Combustible",
    unit: "bar",
    icon: Gauge,
    category: "Bancos",
    description: "Presión del combustible",
    isReverse: true
  },
  presionTurbo: {
    name: "Presión Turbo",
    unit: "bar",
    icon: Gauge,
    category: "Bancos",
    description: "Presión del turbo",
    isReverse: false
  },
  lambda: {
    name: "Lambda",
    unit: "",
    icon: Gauge,
    category: "Bancos",
    description: "Relación aire-combustible",
    isReverse: false
  },
  tiempoInyeccionMs: {
    name: "Tiempo Inyección",
    unit: "ms",
    icon: Gauge,
    category: "Bancos",
    description: "Tiempo de inyección en milisegundos",
    isReverse: false
  },
  tiempoEncendidoAvance: {
    name: "Tiempo Encendido",
    unit: "°",
    icon: Gauge,
    category: "Bancos",
    description: "Avance de encendido en grados",
    isReverse: false
  }
};

export default function AdminDashboard() {
  const { userr } = useUser();
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    recipients: ["admin@empresa.com"],
    enabled: true,
    frequency: "immediate",
    testEmail: ""
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    refreshInterval: 30,
    historyRetention: 30,
    alertCooldown: 5,
    enableSounds: true
  });

  const [activeCategory, setActiveCategory] = useState<string>("Motor");
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [currentValues, setCurrentValues] = useState<SensorData>({});
  const [dataInfo, setDataInfo] = useState<LoadedDataInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Simular carga de configuración guardada
  useEffect(() => {
    // Simulamos algunos valores actuales de sensores
    setCurrentValues({
      temperaturaAgua: 75,
      temperaturaAceite: 95,
      presionAceite: 1.8,
      rpm: 5800,
      voltajeBateria: 12.4,
      consumoCombustibleLh: 12,
      cargaMotor: 75,
      temperaturaEGT: 480,
      presionCombustible: 2.8,
      presionTurbo: 1.9,
      lambda: 1.1,
      tiempoInyeccionMs: 6,
      tiempoEncendidoAvance: 25
    });
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      toast.error("Error", { description: "Error loading file" })

    } finally {
      setIsUploading(false);
      // Limpiar el input
      event.target.value = '';
    }
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
          reject(new Error('Error al parsear JSON: ' + (error instanceof Error ? error.message : 'Formato inválido')));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

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
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error('Error al parsear CSV: ' + error.message));
        }
      });
    });
  };

  const handleThresholdChange = (metric: string, level: keyof ThresholdLevels, value: string) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [level]: parseFloat(value) || 0
      }
    }));
  };

  const handleSaveConfiguration = () => {
    const config = {
      thresholds,
      emailSettings,
      systemSettings,
      lastUpdated: new Date().toISOString()
    };

    toast.success("Success", { description: "Configuración guardada exitosamente" })
  };

  const handleResetToDefaults = () => {
    setThresholds(defaultThresholds);
    toast.info("Info", { description: "Configuración restablecida a valores predeterminados" })
  };

  const handleAddEmail = () => {
    if (emailSettings.testEmail && !emailSettings.recipients.includes(emailSettings.testEmail)) {
      setEmailSettings(prev => ({
        ...prev,
        recipients: [...prev.recipients, prev.testEmail],
        testEmail: ""
      }));
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailSettings(prev => ({
      ...prev,
      recipients: prev.recipients.filter(email => email !== emailToRemove)
    }));
  };

  const getAlertLevel = (metricKey: string, value: number): string => {
    const threshold = thresholds[metricKey];
    const config = metricsConfig[metricKey];

    if (!threshold || value === undefined || value === null) return "normal";

    if (config.isReverse) {
      // Para métricas inversas (como presión de aceite), valores bajos son problemáticos
      if (value <= threshold.danger) return "danger";
      if (value <= threshold.warning) return "warning";
      return "normal";
    } else {
      // Para métricas normales, valores altos son problemáticos
      if (value >= threshold.danger) return "danger";
      if (value >= threshold.warning) return "warning";
      return "normal";
    }
  };

  const getAlertColor = (level: string): string => {
    switch (level) {
      case "danger": return "border-red-500 bg-red-50";
      case "warning": return "border-yellow-500 bg-yellow-50";
      default: return "border-green-500 bg-green-50";
    }
  };

  const getCategories = (): string[] => {
    const categoriesSet = new Set(Object.values(metricsConfig).map(m => m.category));
    return Array.from(categoriesSet);
  };

  const getMetricsByCategory = (category: string): [string, MetricConfig][] => {
    return Object.entries(metricsConfig).filter(([key, config]) => config.category === category);
  };

  const renderThresholdCard = (metricKey: string, config: MetricConfig) => {
    const IconComponent = config.icon;
    const threshold = thresholds[metricKey];
    const rawValue = currentValues[metricKey];

    // Convertir y validar el valor
    const currentValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
    const numericValue = typeof currentValue === 'number' && !isNaN(currentValue) ? currentValue : undefined;

    const alertLevel = numericValue !== undefined ? getAlertLevel(metricKey, numericValue) : 'normal';
    const alertColor = getAlertColor(alertLevel);

    return (
      <Card key={metricKey} className={`overflow-hidden transition-all duration-200 `}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{config.name}</CardTitle>
          <div className="flex items-center space-x-2">
            {currentValue !== undefined && (
              <div className="text-right">
                <div className="text-lg font-bold">{currentValue}</div>
                <div className="text-xs text-gray-500">{config.unit}</div>
              </div>
            )}
            <IconComponent className="h-5 w-5 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">{config.description}</CardDescription>

          {currentValue !== undefined && (
            <div className={`mb-3 p-2 rounded text-sm font-medium ${alertLevel === 'danger' ? 'text-red-700 bg-red-100' :
              alertLevel === 'warning' ? 'text-yellow-700 bg-yellow-100' :
                'text-green-700 bg-green-100'
              }`}>
              Estado: {
                alertLevel === 'danger' ? '🔴 Peligro' :
                  alertLevel === 'warning' ? '🟡 Advertencia' :
                    '🟢 Normal'
              }
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs font-medium text-green-600">Normal</Label>
              <input
                type="number"
                step="0.1"
                value={threshold.normal}
                onChange={(e) => handleThresholdChange(metricKey, 'normal', e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-foreground"
              />
              <span className="text-xs text-gray-500">{config.unit}</span>
            </div>

            <div>
              <Label className="text-xs font-medium text-amber-600">Advertencia</Label>
              <input
                type="number"
                step="0.1"
                value={threshold.warning}
                onChange={(e) => handleThresholdChange(metricKey, 'warning', e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
              />
              <span className="text-xs text-gray-500">{config.unit}</span>
            </div>

            <div>
              <Label className="text-xs font-medium text-red-600">Peligro</Label>
              <input
                type="number"
                step="0.1"
                value={threshold.danger}
                onChange={(e) => handleThresholdChange(metricKey, 'danger', e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-foreground"
              />
              <span className="text-xs text-gray-500">{config.unit}</span>
            </div>
          </div>

          {config.isReverse && (
            <p className="text-xs text-blue-600 mt-2">
              ⚠️ Métrica inversa: valores bajos indican problemas
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Panel de Administración</h1>
            <p className="text-gray-500">Configuración de alertas y notificaciones del sistema</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleResetToDefaults}
              className="flex items-center"
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Restablecer</span>
            </Button>
            <Button
              onClick={handleSaveConfiguration}
              type="submit"
              variant="default"
              size="default"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Guardar</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="data">Datos</TabsTrigger>
            <TabsTrigger value="thresholds">Umbrales</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <Card>
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
                    <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
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
                        variant="outline"
                        onClick={() => document.getElementById("archivo")?.click()}
                        disabled={isUploading}
                        className="w-full h-12 border-2 hover:bg-primary/5 hover:border-primary/50 disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Cargando archivo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mr-2" />
                            {dataInfo ? dataInfo.fileName : "Seleccionar archivo"}
                          </>
                        )}
                      </Button>
                      {dataInfo && !isUploading && (
                        <div className="flex items-center justify-between gap-2 mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">{dataInfo.fileName}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDataInfo(null)}
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                          >
                            <X className="w-4 h-4" />
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

              <Card>
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
          </TabsContent>

          <TabsContent value="thresholds" className="p-1">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configuración de Umbrales de Alerta</span>
                </CardTitle>
                <CardDescription>
                  Define los valores límite para cada métrica. Los valores se comparan contra estos umbrales para generar alertas.
                  Las tarjetas muestran los valores actuales y su estado de alerta.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="mb-4">
              <div className="flex space-x-2">
                {getCategories().map(category => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "transition-colors duration-200",
                      activeCategory === category && "bg-primary hover:bg-primary/80 border-primary"
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getMetricsByCategory(activeCategory).map(([metricKey, config]) =>
                renderThresholdCard(metricKey, config)
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Configuración de Email</span>
                  </CardTitle>
                  <CardDescription>
                    Gestiona los destinatarios y configuración de notificaciones por email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={emailSettings.enabled}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded"
                    />
                    <Label>Habilitar notificaciones por email</Label>
                  </div>

                  <div>
                    <Label className="block mb-1">Frecuencia de notificaciones</Label>
                    <Select
                      value={emailSettings.frequency}
                      onValueChange={(value) => setEmailSettings(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Inmediata</SelectItem>
                        <SelectItem value="hourly">Cada hora</SelectItem>
                        <SelectItem value="daily">Diaria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="block mb-1">Agregar destinatario</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="email"
                        value={emailSettings.testEmail}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, testEmail: e.target.value }))}
                        placeholder="nuevo@email.com"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddEmail}
                        variant={"outline"}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4">
                    <Label className="block mb-1">Destinatarios actuales</Label>
                    <div className="space-y-2 ">
                      {emailSettings.recipients.length > 0 ? (
                        emailSettings.recipients.map(email => (
                          <div key={email} className="flex justify-between items-center px-6">
                            <span className="text-sm">{email}</span>
                            <Button
                              onClick={() => handleRemoveEmail(email)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-foreground">No hay destinatarios configurados</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Configuración de Alertas</span>
                  </CardTitle>
                  <CardDescription>
                    Personaliza cómo se muestran y notifican las alertas en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium mb-2">Tiempo de enfriamiento para alertas</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={systemSettings.alertCooldown}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, alertCooldown: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-sm font-medium">{systemSettings.alertCooldown} minutos</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={systemSettings.enableSounds}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, enableSounds: e.target.checked }))}
                      className="rounded"
                    />
                    <Label>Habilitar sonidos de alerta</Label>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Prueba de notificaciones</AlertTitle>
                    <AlertDescription>
                      Puedes probar las notificaciones configuradas haciendo clic en el botón de prueba
                    </AlertDescription>
                  </Alert>

                  <Button className="w-full">
                    Probar Notificaciones
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Configuración del Sistema</span>
                  </CardTitle>
                  <CardDescription>
                    Ajustes generales del sistema y preferencias de rendimiento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium mb-2">Intervalo de actualización (segundos)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="300"
                      value={systemSettings.refreshInterval}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-2">Retención de historial (días)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={systemSettings.historyRetention}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, historyRetention: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={systemSettings.enableSounds}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, enableSounds: e.target.checked }))}
                      className="rounded"
                    />
                    <Label>Habilitar sonidos del sistema</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Accesos y Permisos</span>
                  </CardTitle>
                  <CardDescription>
                    Gestiona los usuarios con acceso al sistema y sus permisos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Funcionalidad en desarrollo</AlertTitle>
                      <AlertDescription>
                        La gestión de usuarios estará disponible en la próxima versión
                      </AlertDescription>
                    </Alert>

                    <div className="p-4 border rounded">
                      <h4 className="font-medium mb-3 text-foreground">Usuario actual</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium text-foreground">{userr?.email}</p>
                            <p className="text-sm text-muted-foreground">{userr?.userRole}</p>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">Activo</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="p-1">
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
                      className="w-full"
                      variant={"default"}
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
                        className="flex-1"
                        variant={"default"}
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
                        className="flex-1"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
};