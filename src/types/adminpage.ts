export interface LoadedDataInfo {
  fileName: string;
  recordCount: number;
  lastUpdate: string;
  dataSource: 'json' | 'csv' | null;
}

export interface SensorData {
  timestamp?: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  [key: string]: number | string | undefined;
}

export interface MetricConfig {
  name: string;
  unit: string;
  icon: any;
  category: string;
  description: string;
  isReverse: boolean;
}

export interface MetricsConfig {
  [key: string]: MetricConfig;
}

export interface ThresholdLevels {
  normal: number;
  warning: number;
  danger: number;
}

export interface Thresholds {
  [key: string]: ThresholdLevels;
}


export interface EmailSettings {
  recipients: string[];
  enabled: boolean;
  frequency: string;
  testEmail: string;
}

export interface SystemSettings {
  refreshInterval: number;
  historyRetention: number;
  alertCooldown: number;
  enableSounds: boolean;
}
