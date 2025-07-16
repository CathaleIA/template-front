export interface AnomalyDetection {
  timestamp: string;
  parameter: string;
  value: number;
  severity: 'low' | 'medium' | 'high';
  probability: number;
}