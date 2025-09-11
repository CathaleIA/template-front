export interface RequestQueryReportsList{
    tenantName: string,
    userPoolId: string,
    status: string
}

export interface ResponseQueryReportsList {
  tenant_id: string;
  job_id: string;
  activo: string;
  estado: string;
  fecha_creacion: string;
  pool_user_id: string;
  s3_html_path: string;
  s3_json_path: string;
}
