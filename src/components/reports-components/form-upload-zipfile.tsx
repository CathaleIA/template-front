"use client" // Fixed typo from 'use-client'

import type React from "react"

import { useState } from "react"
import type { ZipUploadRequest, ZipUploadResponse } from "@/types" // Updated import to use correct interfaces
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Fixed import path
import { Label } from "@/components/ui/label" // Fixed import path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { v4 as uuidv4 } from "uuid"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ZipUploader() {
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [tenantName, setTenantName] = useState<string>("TENANT_CATHALEIA")
  const [userPoolId, setUserPoolId] = useState<string>("USER_CATHALEIA")
  const [activo, setActivo] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [uploadResult, setUploadResult] = useState<ZipUploadResponse | null>(null)
  const [error, setError] = useState<string>("")

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1] // quitar encabezado
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  async function uploadZipefile(): Promise<ZipUploadResponse | null> {
    try {
      setIsLoading(true)
      setError("")
      if (!zipFile) throw new Error("Debes seleccionar un archivo .zip")

      const base64File = await fileToBase64(zipFile)
      const myUuid: string = uuidv4()
      const generatedFileName = activo + "-" + myUuid + ".zip" // Fixed fileName generation
      setFileName(generatedFileName)

      const requestBody: ZipUploadRequest = {
        tenantName: tenantName,
        userPoolId: userPoolId,
        activo: activo,
        fileName: generatedFileName,
        file: base64File,
      }

      const res = await fetch("/api/upload-zipfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) throw new Error("Error cargando items")

      const data: ZipUploadResponse = await res.json()
      setUploadResult(data)
      return data
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    uploadZipefile()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isZipMimeType = [
        "application/zip",
        "application/x-zip",
        "application/x-zip-compressed",
        "application/octet-stream", // Some systems report ZIP as octet-stream
      ].includes(file.type)

      const isZipExtension = file.name.toLowerCase().endsWith(".zip")

      if (isZipMimeType || isZipExtension) {
        setZipFile(file)
        setError("")
        console.log("[v0] ZIP file accepted:", file.name, "Type:", file.type)
      } else {
        setZipFile(null)
        setError(`Archivo no válido. Tipo detectado: ${file.type}. Por favor selecciona un archivo .zip`)
        console.log("[v0] File rejected:", file.name, "Type:", file.type)
      }
    }
  }
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-base font-bold mb-4 text-center">Subir Archivo ZIP</h2>
      {uploadResult ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>✅ Archivo subido exitosamente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Nombre: {fileName}</p>
            <p className="text-sm font-medium text-blue-600 mb-4">Job ID: {uploadResult.messageResponse}</p>
            <Button

              variant="custom"
              size="custom"
              onClick={() => {
                setUploadResult(null)
                setZipFile(null)
                setFileName("")
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Subir otro archivo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zipFile">Archivo ZIP</Label>
            <Input id="zipFile" type="file" accept=".zip" onChange={handleFileChange} required />
            {zipFile && <p className="text-sm text-green-600">Archivo seleccionado: {zipFile.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="activo">Activo *</Label>
            <Select onValueChange={(value) => setActivo(value)} required>
              <SelectTrigger id="activo" className="w-full">
                <SelectValue placeholder="Selecciona un activo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CT">Pruebas a CTs</SelectItem>
                <SelectItem value="INTER">Pruebas a Interruptores</SelectItem>
                <SelectItem value="DM">Dinamicas a Motores</SelectItem>
              </SelectContent>
            </Select>
            {activo && <p className="text-sm text-green-600">Activo seleccionado: {activo}</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            variant="custom"
            size="custom"
            type="submit"
            disabled={isLoading || !zipFile || !activo}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Subiendo..." : "Subir Archivo"}
          </Button>

          {(!zipFile || !activo) && (
            <p className="text-xs text-gray-500 text-center">
              {!zipFile && !activo
                ? "Selecciona un archivo ZIP y un activo"
                : !zipFile
                  ? "Selecciona un archivo ZIP"
                  : "Selecciona un activo"}
            </p>
          )}
        </form>
      )}
    </div>
  )
}