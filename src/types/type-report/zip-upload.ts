export interface ZipUploadRequest {
  tenantName: string
  userPoolId: string
  activo: string
  fileName: string
  file: string // base64
}

export interface ZipUploadResponse {
  success: boolean
  messageResponse: string
  fileName?: string
  uploadId?: string
}
