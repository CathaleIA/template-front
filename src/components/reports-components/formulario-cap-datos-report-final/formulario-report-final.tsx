'use client'
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"

import { X } from 'lucide-react';
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldSeparator,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
interface FormReportFinalProps {
  onFormSubmit?: (data: Record<string, any>) => void;
}
const schema = z.object({
    reportTitle: z.string().min(2, { message: "El título es obligatorio" }),
    cliente: z.string().min(2, { message: "La descripción es obligatoria" }),
    municipio: z.string().min(2, { message: "El municipio es obligatorio" }),
    departamento: z.string().min(2, { message: "El departamento es obligatorio" }),
    codigo: z.string().min(2, { message: "El código es obligatorio" }),
    elaboradoPor: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un elaborador"),
    revisadoPor: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un revisador"),
    aprobadoPor: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un aprobador"),
    fechaEjecucion: z.string().min(2, { message: "La fecha es obligatoria" }),
    fechaEmision: z.string().min(2, { message: "La fecha es obligatoria" }),
    objetivo: z.string().min(2, { message: "El objetivo es obligatorio" }),
    primerNombre: z.string().min(2, { message: "El primer nombre es obligatorio" }),
    segundoNombre: z.string().min(2, { message: "El segundo nombre es obligatorio" }),
    cargo: z.string().min(2, { message: "El campo es obligatorio" }),
    alcance: z.string().min(2, { message: "El alcance es obligatorio" }),
    activo: z.array(z.string().min(2, { message: "El activo es obligatorio" })).min(1, "Debe haber al menos un activo"),
    prueba: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos una prueba"),
    nombreDoc: z.string().min(2, { message: "Referencia de documentacion obligatorio" }),
    desDoc: z.string().min(2, { message: "Descripcion de documentacion obligatorio" }),
    nombreEquipo: z.string().min(2, { message: "El nombre del equipo es obligatorio" }),
    observaciones: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos una observación"),
    conclucionesRecomendaciones: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos una conclusión o recomendación"),
    personalPresente: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un personal presente"),
})

export default function FormReportFinal({ onFormSubmit }: FormReportFinalProps) {
    const [savedValues, setSavedValues] = useState({});

    const form = useForm({
        defaultValues: {
            reportTitle: '',
            cliente: '',
            municipio: '',
            departamento: '',
            codigo: '',
            elaboradoPor: [] as string[],
            revisadoPor: [] as string[],
            aprobadoPor: [] as string[],
            fechaEjecucion: '',
            fechaEmision: '',
            primerNombre: '',
            segundoNombre: '',
            cargo: '',
            alcance: '',
            objetivo: '',
            activo: [] as string[],
            prueba: [] as string[],
            personalPresente: [] as string[],
            nombreDoc: '',
            desDoc: '',
            nombreEquipo: '',
            observaciones: [] as string[],
            conclucionesRecomendaciones: [] as string[]
        },
        onSubmit: async ({ value }) => {
            // Validación manual con Zod antes de guardar
            const validation = schema.safeParse(value);

            if (!validation.success) {
                console.error('❌ Errores de validación:', validation.error.errors);
                const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
                toast("", {
                    description: `Errores de validación:\n${errorMessages}`,
                    position: 'top-center',
                    action: {
                        label: 'Cerrar',
                        onClick: () => toast.dismiss(),
                    }
                    
                });
                return;
            }

            toast.info('✅ Formulario válido! Valores:'+ validation.data);
            setSavedValues(validation.data);

            toast.success('¡Formulario guardado exitosamente!');
            if (onFormSubmit) onFormSubmit(validation.data);
        },
    })

    return (
        <Card className="w-2xl mx-auto">
            <CardTitle className="text-center text-lg font-bold mt-4">
                Formulario Captura Datos Reporte Final
            </CardTitle>

            <CardContent>
                <form
                    id="report-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    <FieldGroup>
                        {/* SECCIÓN 1: Información General */}
                        <FieldSet>
                            <FieldLegend>Información General del Reporte</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">

                                <form.Field name="reportTitle" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Título del Reporte *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Ingrese el título del reporte"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />

                                <form.Field name="codigo" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Código *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Código del reporte"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <form.Field name="fechaEjecucion" children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Fecha de Ejecución *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="date"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }} />

                                    <form.Field name="fechaEmision" children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Fecha de Emisión *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="date"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }} />
                                </div>
                            </FieldGroup>
                        </FieldSet>

                        {/* SECCIÓN 2: Información del Cliente */}
                        <FieldSet>
                            <FieldLegend>Información del Cliente</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">
                                <form.Field name="cliente" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Cliente *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nombre del cliente"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <form.Field name="municipio" children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Municipio *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Municipio"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }} />

                                    <form.Field name="departamento" children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Departamento *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Departamento"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <form.Field name="primerNombre" children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Primer Nombre *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Primer nombre"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }} />

                                    <form.Field name="segundoNombre" children={(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Segundo Nombre *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Segundo nombre"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }} />
                                </div>




                                <form.Field name="cargo" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Cargo *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Cargo"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />

                            </FieldGroup>
                        </FieldSet>
                        {/* SECCIÓN 3: Responsables */}
                        <FieldSet>
                            <FieldLegend>Responsables del Reporte</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-6">
                                {/* Elaborado Por */}
                                <form.Field name="elaboradoPor" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Elaborado Por *</FieldLabel>
                                                <FieldDescription>Personas que elaboraron el reporte</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`elaboradoPor[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`Nombre ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Elaborador
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>

                                {/* Revisado Por */}
                                <form.Field name="revisadoPor" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Revisado Por *</FieldLabel>
                                                <FieldDescription>Personas que revisaron el reporte</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`revisadoPor[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`Nombre ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Revisor
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>

                                {/* Aprobado Por */}
                                <form.Field name="aprobadoPor" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Aprobado Por *</FieldLabel>
                                                <FieldDescription>Personas que aprobaron el reporte</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`aprobadoPor[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`Nombre ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Aprobador
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Detalles del Trabajo</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">
                                <form.Field name="objetivo" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Objetivo *</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Describa el objetivo del reporte"
                                                rows={3}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />

                                <form.Field name="alcance" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Alcance *</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Describa el alcance"
                                                rows={3}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />

                                <form.Field name="activo" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Activo *</FieldLabel>
                                                <FieldDescription>Activos en lo que se realizaron las pruebas</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`activo[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`Nombre ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Activo
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>

                                {/* Pruebas */}
                                <form.Field name="prueba" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Pruebas Realizadas *</FieldLabel>
                                                <FieldDescription>Listado de pruebas realizadas</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`prueba[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`Prueba ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Prueba
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Personal Presente</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">


                                <form.Field name="personalPresente" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Personal Intermediario</FieldLabel>
                                                <FieldDescription>Personal que intervino a la hora de hacer pruebas</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`personalPresente[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`personalPresente ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Personal
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Estandar de la Prueba</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">


                                <form.Field name="nombreDoc" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Nombre Estandar *</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Nombre estandar"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />
                                <form.Field name="desDoc" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Descripcion Estandar *</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Descripcion del estandar"
                                                rows={3}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />
                                <form.Field name="nombreEquipo" children={(field) => {
                                    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Equipos Utilizados *</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Descripcion de equipos utilizados"
                                                rows={3}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }} />
                            </FieldGroup>


                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Observaciones, Recomendaciones y Conclusiones</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">



                                <form.Field name="conclucionesRecomendaciones" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Conclusiones y Recomendaciones</FieldLabel>
                                                <FieldDescription>Recomendaciones y Conclusiones de la Prueba Realizada</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`conclucionesRecomendaciones[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Textarea
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`Conclusiones y Recomendaciones ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                        rows={3}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Conclusión o Recomendación
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>
                                <form.Field name="observaciones" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Observaciones</FieldLabel>
                                                <FieldDescription>Observaciones de la Prueba Realizada</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`observaciones[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Textarea
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`Observaciones ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                        rows={3}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Observación
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>


                        </FieldSet>

                    </FieldGroup>

                    <Field orientation="horizontal" className="justify-end">
                        <Button
                            type="button"
                            variant="custom"
                            size="custom"
                            onClick={() => {
                                form.reset()
                                setSavedValues({})
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            variant="custom"
                            size="custom"
                        >
                            Save
                        </Button>
                    </Field>
                </form>

                {savedValues && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <h3 className="font-semibold text-green-800 mb-2">✅ Datos guardados exitosamente:</h3>
                        <pre className="text-sm text-green-700 overflow-auto max-h-60 bg-white p-3 rounded">
                            {JSON.stringify(savedValues, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}