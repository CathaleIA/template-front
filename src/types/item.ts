export interface ItemPremitive {
  tenant_name: string;
  lote_job_id: string;
  activo?: string;
  estado?: string;
  type?: string;
  fecha_creacion?: string;
  user_pool_id?: string;
  s3_html_path?: string;
  s3_json_path?: string;
  s3_zip_path?:string;
}


export interface ItemQuery{
    tenant_name: string;
    job_id: string;
    estado: string;
    type: string;

}