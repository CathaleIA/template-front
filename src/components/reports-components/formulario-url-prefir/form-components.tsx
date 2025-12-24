import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export function FormField({ field, label, placeholder, type = "text" }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Si el campo es centroTransformacion, solo permitir números
    if (field.name === 'centroTransformacion') {
      // Solo actualizar si el valor es vacío o contiene solo números
      if (value === '' || /^\d+$/.test(value)) {
        field.handleChange(value);
      }
    } else {
      field.handleChange(value);
    }
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name} className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">{label}</FieldLabel>
      <Input
        id={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={handleChange}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        className="rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-sm sm:text-base"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function FormTextarea({ field, label, placeholder }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name} className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">{label}</FieldLabel>
      <Textarea
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        rows={3}
        className="rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all resize-none text-sm sm:text-base"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function ResponsableArrayField({ field, label, description, isExtended = false, showOnlyNameAndCargo = false, titlePrefix = "" }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  
  // Versión simplificada: solo nombre y cargo (sin empresa)
  if (showOnlyNameAndCargo) {
    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
        <div>
          <FieldLabel className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">{label}</FieldLabel>
          <FieldDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{description}</FieldDescription>
        </div>
        {field.state.value.map((_: any, index: number) => (
          <div key={index} className="p-3 sm:p-4 bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{titlePrefix} {index + 1}</span>
              <button
                type="button"
                onClick={() => field.removeValue(index)}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
              >
                Eliminar
              </button>
            </div>
            <div>
              <FieldLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Nombre</FieldLabel>
              <Input
                value={field.state.value[index]?.nombre ?? ""}
                onChange={(e) => {
                  const newValue = [...field.state.value];
                  newValue[index] = { ...newValue[index], nombre: e.target.value };
                  field.handleChange(newValue);
                }}
                onBlur={() => field.handleBlur()}
                placeholder="Nombre completo"
                className="rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all w-full"
              />
            </div>
            <div>
              <FieldLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Cargo</FieldLabel>
              <Input
                value={field.state.value[index]?.cargo ?? ""}
                onChange={(e) => {
                  const newValue = [...field.state.value];
                  newValue[index] = { ...newValue[index], cargo: e.target.value };
                  field.handleChange(newValue);
                }}
                onBlur={() => field.handleBlur()}
                placeholder="Ej: Ingeniero, Supervisor, Técnico"
                className="rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all w-full"
              />
            </div>
          </div>
        ))}
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => field.pushValue({ nombre: "", cargo: "" })}
          className="w-full rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
        >
          + Agregar {titlePrefix}
        </Button>
        {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
      </div>
    );
  }
  
  if (isExtended) {
    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
        <div>
          <FieldLabel className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">{label}</FieldLabel>
          <FieldDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{description}</FieldDescription>
        </div>
        {field.state.value.map((_: any, index: number) => (
          <div key={index} className="p-3 sm:p-4 bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{titlePrefix} {index + 1}</span>
              <button
                type="button"
                onClick={() => field.removeValue(index)}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
              >
                Eliminar
              </button>
            </div>
            <div>
              <FieldLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Nombre</FieldLabel>
              <Input
                value={field.state.value[index]?.nombre ?? ""}
                onChange={(e) => {
                  const newValue = [...field.state.value];
                  newValue[index] = { ...newValue[index], nombre: e.target.value };
                  field.handleChange(newValue);
                }}
                onBlur={() => field.handleBlur()}
                placeholder="Nombre completo"
                className="rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all w-full"
              />
            </div>
            <div>
              <FieldLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Cargo</FieldLabel>
              <Input
                value={field.state.value[index]?.cargo ?? ""}
                onChange={(e) => {
                  const newValue = [...field.state.value];
                  newValue[index] = { ...newValue[index], cargo: e.target.value };
                  field.handleChange(newValue);
                }}
                onBlur={() => field.handleBlur()}
                placeholder="Ej: Ingeniero, Técnico"
                className="rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all w-full"
              />
            </div>
            <div>
              <FieldLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Empresa</FieldLabel>
              <Input
                value={field.state.value[index]?.empresa ?? ""}
                onChange={(e) => {
                  const newValue = [...field.state.value];
                  newValue[index] = { ...newValue[index], empresa: e.target.value };
                  field.handleChange(newValue);
                }}
                onBlur={() => field.handleBlur()}
                placeholder="Nombre de la empresa"
                className="rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all w-full"
              />
            </div>
          </div>
        ))}
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => field.pushValue({ nombre: "", cargo: "", empresa: "Copower" })}
          className="w-full rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
        >
          + Agregar {titlePrefix}
        </Button>
        {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
      </div>
    );
  }
  
  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div>
        <FieldLabel className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">{label}</FieldLabel>
        <FieldDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{description}</FieldDescription>
      </div>
      {field.state.value.map((_: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={field.state.value[index] ?? ""}
            onChange={(e) => {
              const newValue = [...field.state.value];
              newValue[index] = e.target.value;
              field.handleChange(newValue);
            }}
            onBlur={() => field.handleBlur()}
            placeholder={`Nombre ${index + 1}`}
            className="flex-1 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
          <button
            type="button"
            onClick={() => field.removeValue(index)}
            className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-200 dark:border-red-800"
          >
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      ))}
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => field.pushValue("")}
        className="w-full rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
      >
        + {label === "Elaborado Por" ? "Agregar Elaborador" : label === "Revisado Por" ? "Agregar Revisor" : "Agregar Aprobador"}
      </Button>
      {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
    </div>
  );
}

export function FormArrayItem({ field, index }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  
  return (
    <div className="flex items-center gap-2">
      <Input
        value={field.state.value[index] ?? ""}
        onChange={(e) => {
          const newValue = [...field.state.value];
          newValue[index] = e.target.value;
          field.handleChange(newValue);
        }}
        onBlur={() => field.handleBlur()}
        placeholder={`Nombre ${index + 1}`}
        aria-invalid={isInvalid}
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => field.removeValue(index)}
        className="p-2 rounded hover:bg-red-50 transition-colors border"
      >
        <X className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
}
