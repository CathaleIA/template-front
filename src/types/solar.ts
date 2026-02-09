export interface Report {
  estado: string;
  tipoPrueba: string;
  pathFile: string;
  userPoolId: string;
  timestamp: string;
}

export interface ReportResponse {
  resultData: Report[];
}