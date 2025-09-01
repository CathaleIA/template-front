export interface ItemPremitive {
  tenant_id: string;
  job_id: string;
  activo: string;
  estado: string;
  fecha_creacion: string;
  pool_user_id: string;
  s3_html_path: string;
  s3_json_path: string;
}

export interface ItemQuery{
    tenant_name: string;
    job_id: string;
    estado: string;
}