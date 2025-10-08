"use client"

import { useEffect, useState } from "react"

import TableGestionLotes from "@/components/reports-components/colums-lotes-gestionar/lotes-gestionar-list"
import ZipUploader from "@/components/reports-components/form-upload-zipfile"
import ListadoAnexos from "@/components/reports-components/colums-anexos-gestionar/Listado-anexos"
import ConclusionsForm from "@/components/reports-components/formulario-concluciones"
import { ItemPremitive } from "@/types"
import ReportsGestion from "@/components/reports-components/components-to-editor/reports-gestion"
import Dashboard from "./graficas/charts"
import { Button } from "../ui/button"

export default function SimpleStepper() {
    // 1. Define tus pasos
    const steps = [
        {
            id: 1,
            title: "Subir Archivo",
            description: "Sube el grupo de archivos"
        },
        {
            id: 2,
            title: "Gestión Reportes",
            description: "Consulta por JOB ID",
        },
        {
            id: 3,
            title: "Gestiona Anexos",
            description: "Procesa cada anexo"
        },
        {
            id: 4,
            title: "Gestionar Anexos",
            description: "Anexos a procesar"
        },
        {
            id: 5,
            title: "Generar Reporte",
            description: "Agrupa los anexos",
            
        },
        {
            id: 6,
            title: "Listado Reportes",
            description: "Todos los reportes",
            content: (
                <div className="space-y-3">
                    <div className="border rounded p-3 flex justify-between items-center">
                        <div>
                            <h4 className="font-medium">Reporte #001</h4>
                            <p className="text-sm text-gray-600">Generado: 15/01/2024</p>
                        </div>
                        <button className="text-blue-600 text-sm">Descargar</button>
                    </div>
                    <div className="border rounded p-3 flex justify-between items-center">
                        <div>
                            <h4 className="font-medium">Reporte #002</h4>
                            <p className="text-sm text-gray-600">Generado: 14/01/2024</p>
                        </div>
                        <button className="text-blue-600 text-sm">Descargar</button>
                    </div>
                </div>
            ),
        },
    ]

    // 2. Estado para controlar el paso actual
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedJobId, setSelectedJobId] = useState<string>("")
    const [tenantName, setTenantName] = useState<string>("") // Could be made dynamic later
    const [estado, setEstado] = useState<string>("NORMALIZADO") // Could be made dynamic later
    const [userPoolId, setUserPoolId] = useState<string>("") // Could be made dynamic later
    const [estadoReportLis, setEstadoReportLis] = useState<string>("DESCOMPRIMIDO")
    const [selectedAnexo, setSelectedAnexo] = useState<ItemPremitive | null>(null);
    console.log("Selected Job ID:", selectedJobId)
    console.log("Estado:", estado)
    console.log("Tenant Name:", tenantName)
    console.log("User Pool ID:", userPoolId)
    const [error, setError] = useState<string>("")
    useEffect(() => {
        async function fetchTenant() {
            try {
                const res = await fetch("/api/auth/tenantget")
                const data = await res.json()
                if (data?.userPoolId && data?.userPoolDomain) {
                    setTenantName(data.userPoolDomain)
                    setUserPoolId(data.userPoolId)
                } else {
                    setError("No se encontraron datos de tenant en cookies")
                }
            } catch (err) {
                console.error("Error obteniendo tenant:", err)
                setError("Error al cargar tenant")
            }
        }
        fetchTenant()
    }, [])

    // 3. Funciones de navegación
    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const goToStep = (stepNumber: number) => {
        setCurrentStep(stepNumber)
    }
    const handleSelectAnexo = (anexo: ItemPremitive) => {
        console.log("Anexo seleccionado:", anexo);
        setSelectedAnexo(anexo);
        setCurrentStep(4); // saltar al paso de conclusiones
    };

    return (
        <div className="w-full min-h-[200px] mx-auto p-6">
            {/* 4. Header del stepper */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Sistema de Gestión de Reportes</h1>
                <p className="text-gray-600">Gestiona tus reportes a través de nuestro proceso de 6 fases</p>
            </div>

            {/* 5. Indicadores de pasos - HORIZONTAL */}
            <div className="flex justify-between items-start mb-8 bg-gray-50 p-4 rounded-lg">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className="flex items-center space-x-2">
                            {/* Círculo del número */}
                            <div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer flex-shrink-0
                  ${currentStep === step.id
                                        ? "bg-blue-600 text-white"
                                        : currentStep > step.id
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-300 text-gray-600"
                                    }
                `}
                                onClick={() => goToStep(step.id)}
                            >
                                {step.id}
                            </div>

                            <div className="text-left">
                                <div
                                    className={`text-xs font-bold ${currentStep === step.id
                                        ? "text-blue-600"
                                        : currentStep > step.id
                                            ? "text-green-600"
                                            : "text-gray-600"
                                        }`}
                                >
                                    {step.title}
                                </div>
                                <div className="text-xs text-gray-500">{step.description}</div>
                            </div>
                        </div>

                        {/* Línea conectora (no en el último paso) */}
                        {index < steps.length - 1 && (
                            <div className={`w-8 h-1 mx-3 ${currentStep > step.id ? "bg-green-600" : "bg-gray-300"}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* 6. Contenido del paso actual */}
            <div className="bg-white border rounded-lg p-6 mb-6">
                {/* <h2 className="text-xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-600 mb-4">{steps[currentStep - 1].description}</p> */}

                <div className="min-h-[200px] bg-gray-50 rounded p-4">
                    {currentStep === 1 && <ZipUploader />}
                    {currentStep === 2 && <TableGestionLotes onJobSelect={setSelectedJobId} selectedJobId={selectedJobId} tenantName={tenantName} status={estadoReportLis} userPoolId={userPoolId} />}
                    {currentStep === 3 && <ListadoAnexos tenant_name={tenantName} job_id={`${selectedJobId}#`} estado={estado} onSelectAnexo={handleSelectAnexo} type="ANEXO" />}

                    {currentStep === 4 && <div>
                        <ConclusionsForm s3Key={selectedAnexo?.s3_html_path} reportId={selectedJobId} tenantId={tenantName} poolUserId={userPoolId} fileName={selectedAnexo?.s3_html_path ? selectedAnexo.s3_html_path.split("/").pop() ?? "" : ""} activo={selectedAnexo?.activo} />
                        <Dashboard s3KeyJson={selectedAnexo?.s3_json_path} />
                    </div>}
                    {currentStep === 5 && <ReportsGestion tenant_name={tenantName} job_id={selectedJobId} estado={estado} type="ANEXO" />}
                </div>
            </div>

            {/* 7. Botones de navegación */}
            <div className="flex justify-between">
                <Button
                    variant="custom"
                    size="custom"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Anterior
                </Button>

                <span className="text-sm text-gray-500">
                    Paso {currentStep} de {steps.length}
                </span>

                <Button
                    variant="custom"
                    size="custom"
                    onClick={nextStep}
                    disabled={currentStep === steps.length}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Siguiente
                </Button>
            </div>
        </div>
    )
}
