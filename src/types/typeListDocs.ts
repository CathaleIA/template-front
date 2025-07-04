export interface S3FileInfo{
    key : string;
    size : number;
    lastModified : string;
}

export interface requestListDocs{
    userPoolid : string;
    tenantName : string;
}

export interface responseListDocs{
    mapObjetos : Record<string, S3FileInfo[]>
}

// filtrado de json para PDF

export type PdfFile = {
  key: string
  fileName: string
  size: number
  lastModified: string
}