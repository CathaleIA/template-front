import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileCheck } from "lucide-react";
import { useState } from "react";

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
            
            {/* Firma */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <FieldLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Firma *</FieldLabel>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Máximo 20KB - Obligatorio</p>
              {!field.state.value[index]?.firma ? (
                <>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 20480) {
                          alert('La firma debe ser menor a 20KB');
                          return;
                        }

                        if (!file.type.startsWith('image/')) {
                          alert('Solo se permiten archivos de imagen');
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64String = event.target?.result as string;
                          const newValue = [...field.state.value];
                          newValue[index] = {
                            ...newValue[index],
                            firma: {
                              name: file.name,
                              size: file.size,
                              type: file.type,
                              data: base64String
                            }
                          };
                          field.handleChange(newValue);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-red-300 dark:border-red-600 rounded-md hover:border-red-500 dark:hover:border-red-400 transition-colors bg-red-50 dark:bg-red-900/20">
                      <Upload className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">Cargar firma (Requerido)</span>
                    </div>
                  </label>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Debes cargar la firma para continuar</p>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileCheck className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-green-900 dark:text-green-300 truncate">{field.state.value[index].firma.name}</p>
                        <p className="text-xs text-green-600 dark:text-green-500">{(field.state.value[index].firma.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = [...field.state.value];
                        newValue[index] = { ...newValue[index], firma: null };
                        field.handleChange(newValue);
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                  <div className="relative w-24 h-24 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
                    <img 
                      src={field.state.value[index].firma.data} 
                      alt="Firma" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => field.pushValue({ nombre: "", cargo: "", empresa: "Copower", firma: null })}
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

export function FileUploadField({ field, label, description, maxSize = 20480 }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (maxSize en KB)
    if (file.size > maxSize * 1024) {
      field.handleChange(null);
      alert(`El archivo debe ser menor a ${maxSize / 1024}KB`);
      return;
    }

    // Validar tipo de archivo (imágenes)
    if (!file.type.startsWith('image/')) {
      field.handleChange(null);
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Convertir a base64 para preview y almacenamiento
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setPreviewUrl(base64String);
      field.handleChange({
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    field.handleChange(null);
    setPreviewUrl(null);
  };

  return (
    <Field data-invalid={isInvalid}>
      <div className="space-y-2">
        <FieldLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</FieldLabel>
        {description && <FieldDescription className="text-xs text-slate-600 dark:text-slate-400">{description}</FieldDescription>}
        
        {!field.state.value ? (
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Seleccionar archivo</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileCheck className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-900 dark:text-green-300 truncate">{field.state.value.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">{(field.state.value.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
            {field.state.value.data && (
              <div className="relative w-32 h-32 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
                <img 
                  src={field.state.value.data} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        )}
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </div>
    </Field>
  );
}
