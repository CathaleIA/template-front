export type AlertLevel = "normal" | "warning" | "danger";

export interface MotorData {
  timestamp: string;
  motor: {
    rpm: number;
    temperaturaAgua: number;
    temperaturaAceite: number;
    presionAceite: number;
    voltajeBateria: number;
    consumoCombustibleLh: number;
    cargaMotor: number;
    tiempoEncendidoMin: number;
    velocidadVehiculo: number;
    relacionTransmision: string;
    modoOperacion: string;
  };
  bancos: {
    A1: {
      lambda: number;
      tiempoInyeccionMs: number;
      tiempoEncendidoAvance: number;
      temperaturaEGT: number;
      presionCombustible: number;
      presionTurbo: number;
    };
    B1: {
      lambda: number;
      tiempoInyeccionMs: number;
      tiempoEncendidoAvance: number;
      temperaturaEGT: number;
      presionCombustible: number;
      presionTurbo: number;
    };
  };
}

export interface HistoricalDataPoint {
  alertas: string[];
  estadoGeneral: string;
  torque: number;
  timestamp: string;
  voltaje: number;
  createdAt: string;
  revoluciones: number;
  potencia: number;
  temperatura: number;
  eficiencia: number;
  consumoCombustible: number;
  id: string;
  presionAceite: number;
  nivelAceite: number;
  lambdaA?: number;
  lambdaB?: number;
  egtA?: number;
  egtB?: number;
  presionTurbo?: number;
  presionCombustible?: number;
}