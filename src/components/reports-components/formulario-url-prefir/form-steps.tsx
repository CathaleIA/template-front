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
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2 sm:pb-3">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Información General del Reporte</h2>
      </div>
      <FieldGroup className="gap-3 sm:gap-4">
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
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2 sm:pb-3">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Información del Cliente</h2>
      </div>
      <FieldGroup className="gap-3 sm:gap-4">
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
            {(field: any) => <FormField field={field} label="Segundo Nombre" placeholder="Segundo nombre" />}
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
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2 sm:pb-3">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Responsables del Reporte</h2>
      </div>
      <FieldGroup className="gap-4 sm:gap-6">
        <form.Field name="elaboradoPor" mode="array">
          {(field: any) => (
            <ResponsableArrayField
              field={field}
              label="Elaborado Por"
              description="Personas que elaboraron el reporte"
              isExtended={true}
              titlePrefix="Elaborador"
            />
          )}
        </form.Field>
        <form.Field name="revisadoPor" mode="array">
          {(field: any) => (
            <ResponsableArrayField
              field={field}
              label="Revisado Por"
              description="Personas que revisaron el reporte"
              isExtended={true}
              titlePrefix="Revisor"
            />
          )}
        </form.Field>
        <form.Field name="aprobadoPor" mode="array">
          {(field: any) => (
            <ResponsableArrayField
              field={field}
              label="Aprobado Por"
              description="Personas que aprobaron el reporte"
              isExtended={true}
              titlePrefix="Aprobador"
            />
          )}
        </form.Field>
      </FieldGroup>
    </div>
  );
}

export function FormStep4({ form }: { form: any }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2 sm:pb-3">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Detalles del Trabajo</h2>
      </div>
      <FieldGroup className="gap-3 sm:gap-4">
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
        <form.Field name="centroTransformacion">
          {(field: any) => (
            <FormField 
              field={field} 
              label="Centro de Transformación (CT) *" 
              placeholder="Ingrese solo números" 
              type="text"
            />
          )}
        </form.Field>

        {/* Equipos */}
        <form.Field name="equipos" mode="array">
          {(equiposField: any) => (
            <div className="space-y-4">
              <FieldLabel>Equipos Utilizados *</FieldLabel>
              {equiposField.state.value.map((_: any, equipoIndex: number) => (
                <div key={equipoIndex} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md space-y-3 bg-slate-50 dark:bg-slate-800/50">
                  <form.Field name={`equipos[${equipoIndex}].marca`}>
                    {(marcaField: any) => (
                      <div className="space-y-1">
                        <FieldLabel>Marca</FieldLabel>
                        <Input
                          value={marcaField.state.value ?? ""}
                          onChange={(e) => marcaField.handleChange(e.target.value)}
                          placeholder="Ej: Fluke, FLIR, Megger"
                        />
                      </div>
                    )}
                  </form.Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <form.Field name={`equipos[${equipoIndex}].referencia`}>
                      {(referenciaField: any) => (
                        <div className="space-y-1">
                          <FieldLabel>Referencia</FieldLabel>
                          <Input
                            value={referenciaField.state.value ?? ""}
                            onChange={(e) => referenciaField.handleChange(e.target.value)}
                            placeholder="Modelo o referencia"
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name={`equipos[${equipoIndex}].numeroSerie`}>
                      {(serieField: any) => (
                        <div className="space-y-1">
                          <FieldLabel>Número de Serie</FieldLabel>
                          <Input
                            value={serieField.state.value ?? ""}
                            onChange={(e) => serieField.handleChange(e.target.value)}
                            placeholder="Número de serie"
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>

                  <button
                    type="button"
                    onClick={() => equiposField.removeValue(equipoIndex)}
                    className="text-red-600 dark:text-red-400 text-sm hover:text-red-800 dark:hover:text-red-300"
                  >
                    Eliminar Equipo
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => equiposField.pushValue({ marca: "", referencia: "", numeroSerie: "" })}
              >
                + Agregar Equipo
              </Button>
            </div>
          )}
        </form.Field>

        <form.Field name="activos" mode="array">
          {(activosField: any) => (
            <div className="space-y-4">
              <FieldLabel>Activos *</FieldLabel>
              {activosField.state.value.map((_: any, activoIndex: number) => (
                <div key={activoIndex} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md space-y-3 bg-slate-50 dark:bg-slate-800/50">
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
                    className="text-red-600 dark:text-red-400 text-sm hover:text-red-800 dark:hover:text-red-300"
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
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2 sm:pb-3">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Personal Presente y Estándar de la Prueba</h2>
      </div>
      <FieldGroup className="gap-3 sm:gap-4">
        <form.Field name="personalPresente" mode="array">
          {(field: any) => (
            <ResponsableArrayField
              field={field}
              label="Personal Presente"
              description="Personal que intervino a la hora de hacer pruebas"
            />
          )}
        </form.Field>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
          <h3 className="font-bold mb-4 text-slate-900 dark:text-slate-100">Estándar de la Prueba</h3>
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

export function FormStep6({ form }: { form: any }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2 sm:pb-3">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Conclusiones, Observaciones y Recomendaciones</h2>
      </div>
      <FieldGroup className="gap-3 sm:gap-4">
        <form.Field name="conclusiones">
          {(field: any) => (
            <FormTextarea
              field={field}
              label="Conclusiones *"
              placeholder="Describa las conclusiones del reporte"
            />
          )}
        </form.Field>
        <form.Field name="observaciones">
          {(field: any) => (
            <FormTextarea
              field={field}
              label="Observaciones *"
              placeholder="Describa las observaciones relevantes"
            />
          )}
        </form.Field>
        <form.Field name="recomendaciones">
          {(field: any) => (
            <FormTextarea
              field={field}
              label="Recomendaciones *"
              placeholder="Describa las recomendaciones"
            />
          )}
        </form.Field>
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
    case 6:
      return <FormStep6 form={form} />;
    default:
      return null;
  }
}
