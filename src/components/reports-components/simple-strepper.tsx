"use client"

import { useState } from "react"

import TableGestionLotes from "@/components/reports-components/lotes-gestionar-list"
import ZipUploader from "@/components/reports-components/form-upload-zipfile"
import ListadoAnexos from "@/components/reports-components/Listado-anexos"
import { set } from "zod/v4-mini"


export default function SimpleStepper() {
    // 1. Define tus pasos
    const steps = [
        {
            id: 1,
            title: "Subir Archivo",
            description: "Sube el grupo de archivos",
            content: <ZipUploader />,
        },
        {
            id: 2,
            title: "Gestión Reportes",
            description: "Consulta por JOB ID",
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">JOB ID</label>
                        <input type="text" placeholder="Ingresa el JOB ID" className="w-full p-2 border rounded-lg" />
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded">Consultar Reporte</button>
                </div>
            ),
        },
        {
            id: 3,
            title: "Gestiona Anexos",
            description: "Procesa cada anexo",
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded p-3">
                            <h4 className="font-medium">Anexo 1</h4>
                            <p className="text-sm text-gray-600">documento.pdf</p>
                            <button className="mt-2 text-blue-600 text-sm">Procesar</button>
                        </div>
                        <div className="border rounded p-3">
                            <h4 className="font-medium">Anexo 2</h4>
                            <p className="text-sm text-gray-600">imagen.jpg</p>
                            <button className="mt-2 text-blue-600 text-sm">Procesar</button>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 4,
            title: "Generar Reporte",
            description: "Agrupa los anexos",
            content: (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded">
                        <h4 className="font-medium mb-2">Resumen del Reporte</h4>
                        <p className="text-sm text-gray-600">Fecha: {new Date().toLocaleDateString()}</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded">Generar Reporte Final</button>
                </div>
            ),
        },
        {
            id: 5,
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
    const [tenantName] = useState<string>("TENANT_CATHALEIA") // Could be made dynamic later
    const [estado] = useState<string>("NORMALIZADO") // Could be made dynamic later

    console.log("Selected Job ID:", selectedJobId)
    console.log("Estado:", estado)
    console.log("Tenant Name:", tenantName)
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

    return (
        <div className="w-full min-h-[200px] mx-auto p-6">
            {/* 4. Header del stepper */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Sistema de Gestión de Reportes</h1>
                <p className="text-gray-600">Gestiona tus reportes a través de nuestro proceso de 5 fases</p>
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
                <h2 className="text-xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-600 mb-4">{steps[currentStep - 1].description}</p>

                <div className="min-h-[200px] bg-gray-50 rounded p-4">
                    {currentStep === 1 && <ZipUploader />}
                    {currentStep === 2 && <TableGestionLotes onJobSelect={setSelectedJobId} selectedJobId={selectedJobId} />}
                    {currentStep === 3 && <ListadoAnexos tenant_name={tenantName} job_id={`${selectedJobId}#`} estado={estado} />}

                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded">
                                <h4 className="font-medium mb-2">Resumen del Reporte</h4>
                                <p className="text-sm text-gray-600">Job ID: {selectedJobId || "No seleccionado"}</p>
                                <p className="text-sm text-gray-600">Tenant: {tenantName}</p>
                                <p className="text-sm text-gray-600">Fecha: {new Date().toLocaleDateString()}</p>
                            </div>
                            <button
                                className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
                                disabled={!selectedJobId}
                            >
                                Generar Reporte Final
                            </button>
                        </div>
                    )}
                    {currentStep === 5 && (
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
                    )}
                </div>
            </div>

            {/* 7. Botones de navegación */}
            <div className="flex justify-between">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Anterior
                </button>

                <span className="text-sm text-gray-500">
                    Paso {currentStep} de {steps.length}
                </span>

                <button
                    onClick={nextStep}
                    disabled={currentStep === steps.length}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Siguiente
                </button>
            </div>
        </div>
    )
}
