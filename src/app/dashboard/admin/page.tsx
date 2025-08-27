"use client";

import { useState, useEffect } from "react";
import {
  Thermometer,
  Gauge,
  Droplets,
  BatteryCharging,
  Fuel,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageHeader } from "@/components/page-header"

import {
  LoadedDataInfo,
  SensorData,
  MetricsConfig,
  Thresholds,
  EmailSettings,
  SystemSettings,
} from "@/types/index"

import DataComponent from "@/components/admin-navigation/DatosComponent";
import ThresholdsComponent from "@/components/admin-navigation/ThresholdsComponent";
import NotificationComponent from "@/components/admin-navigation/BotificationComponent";
import SystemComponent from "@/components/admin-navigation/SystemComponent";
import ExportComponent from "@/components/admin-navigation/ExportComponent";


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

export default function AdminDashboard() {

  const [sensorData, setSensorData] = useState<SensorData[]>([]);

  const [currentValues, setCurrentValues] = useState<SensorData>({});
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

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-4">
        <PageHeader
          title="Panel de Administración"
          description="Configuración de alertas y notificaciones del sistema."
          actions={
            [
              // <AlertDialog key="reset">
              //   <AlertDialogTrigger asChild>
              //     <Button variant="ghost">
              //       <RefreshCw className="h-4 w-4" /> Restablecer
              //     </Button>
              //   </AlertDialogTrigger>
              //   <AlertDialogContent>
              //     <AlertDialogHeader>
              //       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              //       <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              //     </AlertDialogHeader>
              //     <AlertDialogFooter>
              //       <AlertDialogCancel>Cancel</AlertDialogCancel>
              //       <AlertDialogAction onClick={handleResetToDefaults} disabled={isRefresquin}>
              //         {isRefresquin ? "Restableciendo..." : "Restablecer"}
              //       </AlertDialogAction>
              //     </AlertDialogFooter>
              //   </AlertDialogContent>
              // </AlertDialog>, <Button
              //   key="save"
              //   onClick={handleSaveConfiguration}
              //   type="submit"
              //   variant="default"
              //   size="default"
              //   className="gap-2"
              // >
              //   <Save className="h-4 w-4" />
              //   <span>Guardar</span>
              // </Button>
            ]
          }
        />

        <Tabs defaultValue="data">
          <TabsList>
            <TabsTrigger value="data">Datos</TabsTrigger>
            <TabsTrigger value="thresholds">Umbrales</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <DataComponent sensorData={sensorData} setSensorData={setSensorData} metricsConfig={metricsConfig} currentValues={currentValues} setCurrentValues={setCurrentValues} />
          </TabsContent>

          <TabsContent value="thresholds">
            <ThresholdsComponent metricsConfig={metricsConfig} currentValues={currentValues} thresholds={thresholds} setThresholds={setThresholds} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationComponent setEmailSettings={setEmailSettings} emailSettings={emailSettings} systemSettings={systemSettings} setSystemSettings={setSystemSettings}/>
          </TabsContent>
            
          <TabsContent value="system">
            <SystemComponent systemSettings={systemSettings} setSystemSettings={setSystemSettings}/>
          </TabsContent>

          <TabsContent value="export" className="p-1">
            <ExportComponent thresholds={thresholds} emailSettings={emailSettings} systemSettings={systemSettings} sensorData={sensorData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
};