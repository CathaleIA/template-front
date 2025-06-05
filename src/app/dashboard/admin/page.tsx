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
  Plus
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Configuración inicial de umbrales (copiada de tu código original)
const defaultThresholds: Thresholds = {
  temperaturaAgua: { normal: 105, warning: 120, danger: 170 },
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
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    recipients: ["admin@empresa.com"],
    enabled: true,
    frequency: "immediate", // immediate, hourly, daily
    testEmail: ""
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    refreshInterval: 30,
    historyRetention: 30,
    alertCooldown: 5,
    enableSounds: true
  });
  const [savedMessage, setSavedMessage] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("Motor");

  // Simular carga de configuración guardada
  useEffect(() => {
    const savedConfig = localStorage.getItem('motorAlertConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.thresholds) setThresholds(config.thresholds);
        if (config.emailSettings) setEmailSettings(config.emailSettings);
        if (config.systemSettings) setSystemSettings(config.systemSettings);
      } catch (error) {
        console.error("Error loading saved configuration:", error);
      }
    }
  }, []);

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
    
    localStorage.setItem('motorAlertConfig', JSON.stringify(config));
    setSavedMessage("Configuración guardada exitosamente");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleResetToDefaults = () => {
    setThresholds(defaultThresholds);
    setSavedMessage("Configuración restablecida a valores predeterminados");
    setTimeout(() => setSavedMessage(""), 3000);
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

  const getCategories = (): string[] => {
    // Convertir Set a Array usando Array.from en lugar de spread operator
    const categoriesSet = new Set(Object.values(metricsConfig).map(m => m.category));
    return Array.from(categoriesSet);
  };

  const getMetricsByCategory = (category: string): [string, MetricConfig][] => {
    return Object.entries(metricsConfig).filter(([key, config]) => config.category === category);
  };

  const renderThresholdCard = (metricKey: string, config: MetricConfig) => {
    const IconComponent = config.icon;
    const threshold = thresholds[metricKey];
    
    return (
      <Card key={metricKey} className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{config.name}</CardTitle>
          <IconComponent className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">{config.description}</CardDescription>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-green-600">Normal</label>
              <input
                type="number"
                step="0.1"
                value={threshold.normal}
                onChange={(e) => handleThresholdChange(metricKey, 'normal', e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-xs text-gray-500">{config.unit}</span>
            </div>
            
            <div>
              <label className="text-xs font-medium text-amber-600">Advertencia</label>
              <input
                type="number"
                step="0.1"
                value={threshold.warning}
                onChange={(e) => handleThresholdChange(metricKey, 'warning', e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs text-gray-500">{config.unit}</span>
            </div>
            
            <div>
              <label className="text-xs font-medium text-red-600">Peligro</label>
              <input
                type="number"
                step="0.1"
                value={threshold.danger}
                onChange={(e) => handleThresholdChange(metricKey, 'danger', e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
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
            <button
              onClick={handleResetToDefaults}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={handleSaveConfiguration}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <Save className="h-4 w-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>

        {savedMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Éxito</AlertTitle>
            <AlertDescription className="text-green-700">{savedMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="thresholds" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="thresholds">Umbrales</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="thresholds" className="p-1">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configuración de Umbrales de Alerta</span>
                </CardTitle>
                <CardDescription>
                  Define los valores límite para cada métrica. Los valores se comparan contra estos umbrales para generar alertas.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="mb-4">
              <div className="flex space-x-2">
                {getCategories().map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
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
                      onChange={(e) => setEmailSettings(prev => ({...prev, enabled: e.target.checked}))}
                      className="rounded"
                    />
                    <label>Habilitar notificaciones por email</label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Frecuencia de notificaciones</label>
                    <select
                      value={emailSettings.frequency}
                      onChange={(e) => setEmailSettings(prev => ({...prev, frequency: e.target.value}))}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="immediate">Inmediata</option>
                      <option value="hourly">Cada hora</option>
                      <option value="daily">Diaria</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Agregar destinatario</label>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        placeholder="email@ejemplo.com"
                        value={emailSettings.testEmail}
                        onChange={(e) => setEmailSettings(prev => ({...prev, testEmail: e.target.value}))}
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddEmail}
                        className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Destinatarios actuales</label>
                    <div className="space-y-2">
                      {emailSettings.recipients.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">{email}</span>
                          <button
                            onClick={() => handleRemoveEmail(email)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
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
                    Personaliza el comportamiento de las alertas del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tiempo de enfriamiento de alertas (minutos)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={systemSettings.alertCooldown}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev, 
                        alertCooldown: parseInt(e.target.value) || 5
                      }))}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo mínimo entre alertas del mismo tipo
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={systemSettings.enableSounds}
                      onChange={(e) => setSystemSettings(prev => ({...prev, enableSounds: e.target.checked}))}
                      className="rounded"
                    />
                    <label>Habilitar sonidos de alerta</label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="font-medium text-blue-800 mb-2">Estado del Servicio</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-blue-700">Modo de demostración - Sin envío real</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Configuración del Sistema</span>
                  </CardTitle>
                  <CardDescription>
                    Ajustes generales del monitoreo y almacenamiento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Intervalo de actualización (segundos)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={systemSettings.refreshInterval}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev, 
                        refreshInterval: parseInt(e.target.value) || 30
                      }))}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Retención de historial (días)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={systemSettings.historyRetention}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev, 
                        historyRetention: parseInt(e.target.value) || 30
                      }))}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Estadísticas de Uso</span>
                  </CardTitle>
                  <CardDescription>
                    Información sobre el uso del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Alertas configuradas:</span>
                      <span className="font-medium">{Object.keys(thresholds).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Destinatarios email:</span>
                      <span className="font-medium">{emailSettings.recipients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Última configuración:</span>
                      <span className="font-medium text-sm">Ahora</span>
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
                  <Copy className="h-5 w-5" />
                  <span>Exportar/Importar Configuración</span>
                </CardTitle>
                <CardDescription>
                  Respalda o restaura la configuración del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const config = { thresholds, emailSettings, systemSettings };
                      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `motor-config-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                    }}
                    className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Exportar Configuración</span>
                  </button>

                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const result = event.target?.result;
                              if (typeof result === 'string') {
                                const config = JSON.parse(result);
                                if (config.thresholds) setThresholds(config.thresholds);
                                if (config.emailSettings) setEmailSettings(config.emailSettings);
                                if (config.systemSettings) setSystemSettings(config.systemSettings);
                                setSavedMessage("Configuración importada exitosamente");
                                setTimeout(() => setSavedMessage(""), 3000);
                              }
                            } catch (error) {
                              alert("Error al importar configuración");
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Nota Importante</AlertTitle>
                  <AlertDescription>
                    Asegúrate de hacer una copia de seguridad antes de importar una nueva configuración. 
                    Los cambios sobrescribirán la configuración actual.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}