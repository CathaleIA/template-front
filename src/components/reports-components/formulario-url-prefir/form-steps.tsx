import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FormField, FormTextarea, ResponsableArrayField } from "./form-components";

interface FormStepsProps {
  form: any;
  currentStep: number;
}

export function FormStep1({ form }: { form: any }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">📋 Información General del Reporte</h2>
      </div>
      <FieldGroup className="gap-4">
        <form.Field name="reportTitle">
          {(field: any) => (
            <FormField field={field} label="Título del Reporte *" placeholder="Ingrese el título del reporte" />
          )}
        </form.Field>
        <form.Field name="codigo">
          {(field: any) => <FormField field={field} label="Código *" placeholder="Código del reporte" />}
        </form.Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="fechaEjecucion">
            {(field: any) => <FormField field={field} label="Fecha de Ejecución *" type="date" />}
          </form.Field>
          <form.Field name="fechaEmision">
            {(field: any) => <FormField field={field} label="Fecha de Emisión *" type="date" />}
          </form.Field>
        </div>
      </FieldGroup>
    </div>
  );
}

export function FormStep2({ form }: { form: any }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">👤 Información del Cliente</h2>
      </div>
      <FieldGroup className="gap-4">
        <form.Field name="cliente">
          {(field: any) => <FormField field={field} label="Cliente *" placeholder="Nombre del cliente" />}
        </form.Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="municipio">
            {(field: any) => <FormField field={field} label="Municipio *" placeholder="Municipio" />}
          </form.Field>
          <form.Field name="departamento">
            {(field: any) => <FormField field={field} label="Departamento *" placeholder="Departamento" />}
          </form.Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="primerNombre">
            {(field: any) => <FormField field={field} label="Primer Nombre *" placeholder="Primer nombre" />}
          </form.Field>
          <form.Field name="segundoNombre">
            {(field: any) => <FormField field={field} label="Segundo Nombre *" placeholder="Segundo nombre" />}
          </form.Field>
        </div>
        <form.Field name="cargo">
          {(field: any) => <FormField field={field} label="Cargo *" placeholder="Cargo" />}
        </form.Field>
      </FieldGroup>
    </div>
  );
}

export function FormStep3({ form }: { form: any }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">👥 Responsables del Reporte</h2>
      </div>
      <FieldGroup className="gap-6">
        <form.Field name="elaboradoPor" mode="array">
          {(field: any) => (
            <ResponsableArrayField
              field={field}
              label="Elaborado Por"
              description="Personas que elaboraron el reporte"
            />
          )}
        </form.Field>
        <form.Field name="revisadoPor" mode="array">
          {(field: any) => (
            <ResponsableArrayField
              field={field}
              label="Revisado Por"
              description="Personas que revisaron el reporte"
            />
          )}
        </form.Field>
        <form.Field name="aprobadoPor" mode="array">
          {(field: any) => (
            <ResponsableArrayField
              field={field}
              label="Aprobado Por"
              description="Personas que aprobaron el reporte"
            />
          )}
        </form.Field>
      </FieldGroup>
    </div>
  );
}

export function FormStep4({ form }: { form: any }) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">⚙️ Detalles del Trabajo</h2>
      </div>
      <FieldGroup className="gap-4">
        <form.Field name="objetivo">
          {(field: any) => (
            <FormTextarea field={field} label="Objetivo *" placeholder="Describa el objetivo del reporte" />
          )}
        </form.Field>
        <form.Field name="alcance">
          {(field: any) => (
            <FormTextarea field={field} label="Alcance *" placeholder="Describa el alcance" />
          )}
        </form.Field>
        <form.Field name="activos" mode="array">
          {(activosField: any) => (
            <div className="space-y-4">
              <FieldLabel>Activos *</FieldLabel>
              {activosField.state.value.map((_: any, activoIndex: number) => (
                <div key={activoIndex} className="p-4 border rounded-lg space-y-3 bg-slate-50">
                  <form.Field name={`activos[${activoIndex}].nombre`}>
                    {(nombreField: any) => (
                      <div className="space-y-1">
                        <FieldLabel>Nombre del activo</FieldLabel>
                        <Input
                          value={nombreField.state.value ?? ""}
                          onChange={(e) => nombreField.handleChange(e.target.value)}
                          placeholder={`Activo ${activoIndex + 1}`}
                        />
                      </div>
                    )}
                  </form.Field>
                  <form.Field name={`activos[${activoIndex}].pruebas`} mode="array">
                    {(pruebasField: any) => (
                      <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                        <FieldLabel>Pruebas</FieldLabel>
                        {pruebasField.state.value.map((_: any, pruebaIndex: number) => (
                          <div key={pruebaIndex} className="flex items-center gap-2">
                            <Input
                              placeholder={`Prueba ${pruebaIndex + 1}`}
                              className="flex-1"
                              value={pruebasField.state.value[pruebaIndex] ?? ""}
                              onChange={(e) => {
                                const newValue = [...pruebasField.state.value];
                                newValue[pruebaIndex] = e.target.value;
                                pruebasField.handleChange(newValue);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => pruebasField.removeValue(pruebaIndex)}
                              className="p-2 border rounded hover:bg-red-50"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => pruebasField.pushValue("")}
                        >
                          + Agregar Prueba
                        </Button>
                      </div>
                    )}
                  </form.Field>
                  <button
                    type="button"
                    onClick={() => activosField.removeValue(activoIndex)}
                    className="text-red-600 text-sm"
                  >
                    Eliminar Activo
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => activosField.pushValue({ nombre: "", pruebas: [""] })}
              >
                + Agregar Activo
              </Button>
            </div>
          )}
        </form.Field>
      </FieldGroup>
    </div>
  );
}

export function FormStep5({ form }: { form: any }) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">📊 Personal Presente y Estándar de la Prueba</h2>
      </div>
      <FieldGroup className="gap-4">
        <form.Field name="personalPresente" mode="array">
          {(field: any) => (
            <ResponsableArrayField
              field={field}
              label="Personal Intermediario"
              description="Personal que intervino a la hora de hacer pruebas"
            />
          )}
        </form.Field>
        <div className="border-t pt-4 mt-4">
          <h3 className="font-bold mb-4">Estándar de la Prueba</h3>
          <form.Field name="nombreDoc">
            {(field: any) => (
              <FormField field={field} label="Nombre Estándar *" placeholder="Nombre estándar" />
            )}
          </form.Field>
          <form.Field name="desDoc">
            {(field: any) => (
              <FormTextarea
                field={field}
                label="Descripción Estándar *"
                placeholder="Descripción del estándar"
              />
            )}
          </form.Field>
          <form.Field name="nombreEquipo">
            {(field: any) => (
              <FormTextarea
                field={field}
                label="Equipos Utilizados *"
                placeholder="Descripción de equipos utilizados"
              />
            )}
          </form.Field>
        </div>
      </FieldGroup>
    </div>
  );
}

export function StepContent({ form, currentStep }: FormStepsProps) {
  switch (currentStep) {
    case 1:
      return <FormStep1 form={form} />;
    case 2:
      return <FormStep2 form={form} />;
    case 3:
      return <FormStep3 form={form} />;
    case 4:
      return <FormStep4 form={form} />;
    case 5:
      return <FormStep5 form={form} />;
    default:
      return null;
  }
}
