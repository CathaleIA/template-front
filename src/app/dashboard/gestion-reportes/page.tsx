"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableGestionLotes from "@/components/reports-components/colums-lotes-gestionar/lotes-gestionar-list";
import ListadoAnexos from "@/components/reports-components/colums-anexos-gestionar/Listado-anexos";
import TableGestionReportsFile from "@/components/reports-components/columns-final-reports/listado-final-reports";
import type { ItemPremitive } from "@/types";
import { Badge } from "@/components/ui/badge";
import { FileText, Package, CheckCircle } from "lucide-react";

export default function GestionReportesPage() {
  // Estados compartidos
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedActivo, setSelectedActivo] = useState<string>("");
  const [selectedAnexos, setSelectedAnexos] = useState<ItemPremitive[]>([]);

  // Configuración del tenant y usuario (puedes obtenerlos de un contexto)
  const tenantName = "your-tenant"; // Reemplazar con el tenant real
  const userPoolId = "your-pool-id"; // Reemplazar con el pool ID real

  // Handler para seleccionar un lote
  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setSelectedAnexos([]); // Limpiar anexos seleccionados al cambiar de lote
  };

  // Handler para seleccionar un activo
  const handleActivoSelect = (activo: string) => {
    setSelectedActivo(activo);
  };

  // Handler para seleccionar un anexo
  const handleAnexoSelect = (anexo: ItemPremitive) => {
    setSelectedAnexos((prev) => {
      // Verificar si el anexo ya está seleccionado
      const exists = prev.find((a) => a.s3_html_path === anexo.s3_html_path);
      if (exists) {
        // Si ya existe, removerlo
        return prev.filter((a) => a.s3_html_path !== anexo.s3_html_path);
      }
      // Si no existe, agregarlo
      return [...prev, anexo];
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header del Dashboard */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Reportes</h1>
        <p className="text-muted-foreground">
          Administra lotes, anexos y reportes finales desde un único lugar
        </p>
      </div>

      {/* Panel de información de selección */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lote Seleccionado</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedJobId ? (
                <span className="text-green-600">Activo</span>
              ) : (
                <span className="text-gray-400">Sin selección</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {selectedJobId || "Selecciona un lote para continuar"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivo</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedActivo || "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Dispositivo asociado al lote
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anexos Seleccionados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedAnexos.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedAnexos.length === 0 ? "Sin anexos seleccionados" : "Anexos listos para procesar"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="lotes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lotes">
            <Package className="h-4 w-4 mr-2" />
            Gestión de Lotes
          </TabsTrigger>
          <TabsTrigger value="anexos" disabled={!selectedJobId}>
            <FileText className="h-4 w-4 mr-2" />
            Anexos del Lote
          </TabsTrigger>
          <TabsTrigger value="reportes-finales">
            <CheckCircle className="h-4 w-4 mr-2" />
            Reportes Finales
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Gestión de Lotes */}
        <TabsContent value="lotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lotes Disponibles</CardTitle>
              <CardDescription>
                Selecciona un lote para gestionar sus anexos. Los lotes en estado "DESCOMPRIMIDO" están listos para procesar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableGestionLotes
                onJobSelect={handleJobSelect}
                onActivoSelect={handleActivoSelect}
                selectedJobId={selectedJobId}
                tenantName={tenantName}
                status="DESCOMPRIMIDO"
                userPoolId={userPoolId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Anexos del Lote */}
        <TabsContent value="anexos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anexos del Lote</CardTitle>
              <CardDescription>
                Selecciona los anexos que deseas incluir en el reporte final. 
                {selectedJobId && (
                  <Badge variant="outline" className="ml-2">
                    Job ID: {selectedJobId}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedJobId ? (
                <>
                  {/* Lista de anexos seleccionados */}
                  {selectedAnexos.length > 0 && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-green-800">
                        Anexos seleccionados ({selectedAnexos.length}):
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnexos.map((anexo) => (
                          <Badge key={anexo.s3_html_path} variant="secondary">
                            {anexo.s3_html_path?.split("/").pop()?.replace(/\.html$/i, ".pdf") || "Sin nombre"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <ListadoAnexos
                    tenant_name={tenantName}
                    job_id={selectedJobId}
                    estado="NORMALIZADO"
                    type="ANEXO"
                    onSelectAnexo={handleAnexoSelect}
                  />
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Selecciona un lote primero para ver sus anexos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Reportes Finales */}
        <TabsContent value="reportes-finales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Finales Generados</CardTitle>
              <CardDescription>
                Listado de reportes finales completados y listos para descarga.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableGestionReportsFile
                tenantName={tenantName}
                status="GESTIONADO"
                userPoolId={userPoolId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Panel de acciones rápidas */}
      {selectedJobId && selectedAnexos.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Listo para procesar</CardTitle>
            <CardDescription className="text-green-700">
              Has seleccionado {selectedAnexos.length} anexo(s) del lote {selectedJobId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Generar Reporte Final
              </button>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setSelectedAnexos([])}
              >
                Limpiar Selección
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
